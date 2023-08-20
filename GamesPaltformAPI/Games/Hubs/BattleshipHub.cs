using Entities.BattleShip;
using Microsoft.AspNetCore.SignalR;

namespace Games.Hubs
{
    public class BattleshipHub : Hub
    {
        public static Dictionary<string, List<BattleshipPlayer>> _lobbies = new Dictionary<string, List<BattleshipPlayer>>();

        public async Task JoinGame(string playerName, string lobbyName)
        {
            var player = new BattleshipPlayer
            {
                ConnectionId = Context.ConnectionId,
                PlayerName = playerName
            };

            _lobbies[lobbyName].Add(player);

            await Groups.AddToGroupAsync(Context.ConnectionId, lobbyName);

            await Clients.Caller.SendAsync("GameJoined");

            await Clients.All.SendAsync("PlayerJoined");

            if (_lobbies[lobbyName].Count == 2)
            {
                InitializeGame(lobbyName);

                await Clients.All.SendAsync("GameStart", lobbyName);
            }
        }

        public async Task CreateGame(string playerName, string lobbyName)
        {
            if (!_lobbies.ContainsKey(lobbyName))
            {
                _lobbies[lobbyName] = new List<BattleshipPlayer>();

                var player = new BattleshipPlayer
                {
                    ConnectionId = Context.ConnectionId,
                    PlayerName = playerName
                };

                _lobbies[lobbyName].Add(player);

                await Groups.AddToGroupAsync(Context.ConnectionId, lobbyName);

                await Clients.Caller.SendAsync("GameCreated", lobbyName);

                await Clients.All.SendAsync("NewLobbyCreated");

                await Clients.Caller.SendAsync("YourTurn");
            }
            else
            {
                await Clients.Caller.SendAsync("LobbyExists", lobbyName);
            }
        }

        public async Task GetOpenLobbies()
        {
            var openLobbies = _lobbies
                .Where(pair => pair.Value.Count < 2)
                .Select(pair => pair.Key);

            await Clients.Caller.SendAsync("OpenLobbies", openLobbies);
        }

        public async Task PlaceShip(string lobbyName, int shipType, int startX, int startY, bool isVertical)
        {
            var currentPlayer = _lobbies[lobbyName].FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
            if (currentPlayer == null || currentPlayer.Ships.Count >= 5)
            {
                return;
            }

            var opponent = _lobbies[lobbyName].FirstOrDefault(p => p.ConnectionId != Context.ConnectionId);

            var ship = new Ship
            {
                Type = shipType,
                Length = GetShipLength(shipType),
                Hits = 0
            };

            for (int i = 0; i < ship.Length; i++)
            {
                ship.Segments.Add(new Segment
                {
                    X = isVertical ? startX + i : startX,
                    Y = isVertical ? startY : startY + i,
                    Hits = 0
                });
            }

            if (CanPlaceShip(currentPlayer, startX, startY, ship.Length, isVertical))
            {
                for (int i = 0; i < ship.Length; i++)
                {
                    if (isVertical)
                    {
                        currentPlayer.OwnGrid[startX + i, startY] = 'S';
                    }
                    else
                    {
                        currentPlayer.OwnGrid[startX, startY + i] = 'S';
                    }
                }
                currentPlayer.Ships.Add(ship);
                
                await Clients.Caller.SendAsync("ShipPlaced", shipType, GetShipLength(shipType), startX, startY, isVertical);
            }
        }

        public async Task FireShot(string lobbyName, int targetX, int targetY)
        {
            var currentPlayer = _lobbies[lobbyName].FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
            var opponent = _lobbies[lobbyName].FirstOrDefault(p => p.ConnectionId != Context.ConnectionId);

            if (currentPlayer == null || opponent == null || currentPlayer.TrackingGrid[targetX, targetY] == 'M' || currentPlayer.TrackingGrid[targetX, targetY] == 'H')
            {
                await Clients.Caller.SendAsync("YourTurn");

                return;
            }

            if (opponent.Ships.Any(ship => ShipHit(ship, targetX, targetY)))
            {
                currentPlayer.TrackingGrid[targetX, targetY] = 'H';
                
                opponent.OwnGrid[targetX, targetY] = 'H';

                await Clients.Caller.SendAsync("ShotResult", targetX, targetY, "hit");
                await Clients.Client(opponent.ConnectionId).SendAsync("OpponentShot", targetX, targetY, "hit");
                await Clients.Client(opponent.ConnectionId).SendAsync("YourTurn");

                if (opponent.Ships.All(ship => ship.IsSunk))
                {
                    await Clients.Group(lobbyName).SendAsync("GameResult", $"{currentPlayer.PlayerName} won!");
                }
            }
            else
            {
                currentPlayer.TrackingGrid[targetX, targetY] = 'M';
                
                await Clients.Caller.SendAsync("ShotResult", targetX, targetY, "miss");
                await Clients.Client(opponent.ConnectionId).SendAsync("OpponentShot", targetX, targetY, "miss");
                await Clients.Client(opponent.ConnectionId).SendAsync("YourTurn");
            }
        }


        public async Task LeaveLobby(string lobbyName)
        {
            var currentPlayer = _lobbies[lobbyName].FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
            if (currentPlayer != null)
            {
                var opponent = _lobbies[lobbyName].FirstOrDefault(p => p.ConnectionId != Context.ConnectionId);
                if (opponent != null)
                {
                    await Clients.Client(opponent.ConnectionId).SendAsync("OpponentLeft");
                }

                await Clients.Caller.SendAsync("PlayerLeft", currentPlayer.PlayerName);

                _lobbies[lobbyName].Remove(currentPlayer);
                if (_lobbies[lobbyName].Count == 0)
                {
                    _lobbies.Remove(lobbyName);

                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyName);

                    await Clients.All.SendAsync("LobbyClosed");
                }
            }
        }

        private int GetShipLength(int shipType)
        {
            switch (shipType)
            {
                case 1: return 2;
                case 2: return 3;
                case 3: return 4;
                default: return 0;
            }
        }

        private bool CanPlaceShip(BattleshipPlayer player, int startX, int startY, int length, bool isVertical)
        {
            if (isVertical)
            {
                for (int i = 0; i < length; i++)
                {
                    if (startX + i >= 10 || player.OwnGrid[startX + i, startY] != '\0')
                    {
                        return false;
                    }
                }
            }
            else
            {
                for (int i = 0; i < length; i++)
                {
                    if (startY + i >= 10 || player.OwnGrid[startX, startY + i] != '\0')
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        private bool ShipHit(Ship ship, int targetX, int targetY)
        {
            foreach (var segment in ship.Segments)
            {
                if (segment.X == targetX && segment.Y == targetY)
                {
                    segment.Hits++;
                    
                    return true;
                }
            }

            return false;
        }

        private void InitializeGame(string lobbyName)
        {
            foreach (var player in _lobbies[lobbyName])
            {
                player.OwnGrid = new char[10, 10];
                player.Ships.Clear();
            }
        }
    }

}
