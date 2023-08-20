using Entities.TicTacToeModels;
using Microsoft.AspNetCore.SignalR;

namespace Games.Hubs
{
    public class TicTacToeHub : Hub
    {
        public static Dictionary<string, TicTacToeGame> _games = new Dictionary<string, TicTacToeGame>();

        public async Task JoinGame(string playerName, string lobbyName)
        {
            var game = _games[lobbyName];
            
            var player = new TicTacToePlayer
            {
                ConnectionId = Context.ConnectionId,
                PlayerName = playerName,
                Marker = 'O'
            };
    
            game.PlayerO = player;

            await Groups.AddToGroupAsync(Context.ConnectionId, lobbyName);
           
            await Clients.Caller.SendAsync("GameJoined", player.Marker, lobbyName);
            await Clients.All.SendAsync("PlayerJoined");

            if (game.PlayerO != null)
            {
                await Clients.All.SendAsync("GameStart", game.PlayerO.PlayerName, game.PlayerX.PlayerName);
            }
        }

        public async Task CreateGame(string playerName, string lobbyName)
        {
            if (!_games.ContainsKey(lobbyName))
            {
                _games[lobbyName] = new TicTacToeGame();
                
                var game = _games[lobbyName];

                var player = new TicTacToePlayer
                {
                    ConnectionId = Context.ConnectionId,
                    PlayerName = playerName,
                    Marker = 'X'
                };

                game.PlayerX = player;
                game.CurrentPlayer = game.PlayerX;

                await Groups.AddToGroupAsync(Context.ConnectionId, lobbyName);

                await Clients.Caller.SendAsync("GameCreated", player.Marker, playerName, lobbyName);
                await Clients.All.SendAsync("NewLobbyCreated", lobbyName);
            }
            else
            {
                await Clients.Caller.SendAsync("GameExists", lobbyName);
            }
        }

        public async Task MakeMove(string lobbyName, int row, int col)
        {
            if (!_games.ContainsKey(lobbyName))
            {
                return;
            }

            var game = _games[lobbyName];
            if (game.IsGameEnded || game.CurrentPlayer == null || game.PlayerX == null || game.PlayerO == null)
            {
                return;
            }

            var currentPlayer = game.CurrentPlayer;

            if (game.Board[row, col] == '\0')
            {
                game.Board[row, col] = currentPlayer.Marker;

                await Clients.Group(lobbyName).SendAsync("MoveMade", currentPlayer.Marker, row, col);

                if (CheckWin(game.Board, currentPlayer.Marker))
                {
                    game.IsGameEnded = true;
                    await Clients.Group(lobbyName).SendAsync("GameEnded", currentPlayer.PlayerName + " wins!");
                }
                else if (IsBoardFull(game.Board))
                {
                    game.IsGameEnded = true;
                    await Clients.Group(lobbyName).SendAsync("GameEnded", "It's a draw!");
                }
                else
                {   
                    game.CurrentPlayer = currentPlayer == game.PlayerX ? game.PlayerO : game.PlayerX;
                }
            }
        }

        public async Task LeaveGame(string lobbyName, string playerName)
        {
            if (_games.ContainsKey(lobbyName))
            {
                var game = _games[lobbyName];
                if (game.PlayerX != null && game.PlayerX.PlayerName == playerName)
                {
                    game.PlayerX = null;
                }
                else if (game.PlayerO != null && game.PlayerO.PlayerName == playerName)
                {
                    game.PlayerO = null;
                }

                if (game.PlayerX == null && game.PlayerO == null)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyName);

                    _games.Remove(lobbyName);

                    await Clients.All.SendAsync("LobbyClosed", lobbyName);
                }
                else if (game.PlayerX == null && IsBoardEmpty(game.Board))
                {
                    game.PlayerX = game.PlayerO;
                    game.PlayerX.Marker = 'X';
                    game.CurrentPlayer = game.PlayerX;

                    await Clients.OthersInGroup(lobbyName).SendAsync("ChangeXPlayer", game.PlayerO.PlayerName);

                    game.PlayerO = null;
                }
                else if ((game.PlayerX == null || game.PlayerO == null) && !IsBoardEmpty(game.Board))
                {
                    await Clients.Group(lobbyName).SendAsync("RemoveLobby", playerName, game.PlayerO.PlayerName);

                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyName);

                    _games.Remove(lobbyName);

                    await Clients.All.SendAsync("LobbyClosed", lobbyName);
                }
                
                if (game.PlayerO == null)
                {
                    await Clients.Caller.SendAsync("PlayerLeft", playerName);
                    await Clients.All.SendAsync("LobbyAvailable");
                }
            }
        }

        public async Task GetOpenLobbies()
        {
            var openLobbies = _games.Where(pair => pair.Value.PlayerO == null).Select(pair => pair.Key);

            await Clients.Caller.SendAsync("OpenLobbies", openLobbies);
        }

        private bool CheckWin(char[,] board, char marker)
        {
            for (int row = 0; row < 3; row++)
            {
                if (board[row, 0] == marker && board[row, 1] == marker && board[row, 2] == marker)
                {
                    return true;
                }
            }

            for (int col = 0; col < 3; col++)
            {
                if (board[0, col] == marker && board[1, col] == marker && board[2, col] == marker)
                {
                    return true;
                }
            }

            if (board[0, 0] == marker && board[1, 1] == marker && board[2, 2] == marker)
            {
                return true;
            }

            if (board[0, 2] == marker && board[1, 1] == marker && board[2, 0] == marker)
            {
                return true;
            }

            return false;
        }

        private bool IsBoardFull(char[,] board)
        {
            for (int row = 0; row < 3; row++)
            {
                for (int col = 0; col < 3; col++)
                {
                    if (board[row, col] == '\0')
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        private bool IsBoardEmpty(char[,] board)
        {
            for (int row = 0; row < 3; row++)
            {
                for (int col = 0; col < 3; col++)
                {
                    if (board[row, col] != '\0')
                    {
                        return false;
                    }
                }
            }

            return true;
        }
    }
}
