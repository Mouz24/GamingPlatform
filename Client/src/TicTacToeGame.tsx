import React, { useEffect, useState } from 'react';
import signalRService from './SignalRTicTacToeService';
import { useLocation, useNavigate } from 'react-router-dom';
import './TicTacToeGame.css';
import {Box} from '@mui/material';

const TicTacToeGame: React.FC<{}> = () => {
const connection = signalRService.getConnection();
const [currentPlayer, setCurrentPlayer] = useState<string>('');
const [gameEnded, setGameEnded] = useState<boolean>(false);
const [board, setBoard] = useState<string[][]>(Array.from(Array(3), () => Array(3).fill('')));
const [opponentName, setOpponentName] = useState('');
const [message, setMessage] = useState('');
const location = useLocation();
const { playerName, lobbyName, yourMarker } = location.state || {};
const [playerMarker, setPlayerMarker] = useState(yourMarker);
const navigate = useNavigate();

useEffect(() => {
  setBoard(Array.from(Array(3), () => Array(3).fill('')));
}, []);

useEffect(() => {
  if (connection) {
    connection.on('MoveMade', (marker, row, col) => {
      console.log(`${marker} made a move at (${row}, ${col}).`);
      const newBoard = [...board];
      newBoard[row][col] = marker;
      setBoard(newBoard);

      const updatedPlayer = marker === 'X' ? 'O' : 'X';
      setCurrentPlayer(updatedPlayer);
      console.log(`${updatedPlayer} move`);
    });

    connection.on('PlayerLeft', (leftPlayerName: string) => {
        navigate(`/tic-tac-toe?playerName=${encodeURIComponent(leftPlayerName)}`);
      });

      connection.on('RemoveLobby', (leftPlayerName: string, secondPlayerName: string) => {
        if (playerName === leftPlayerName) {
          navigate(`/tic-tac-toe?playerName=${encodeURIComponent(leftPlayerName)}`);
        } else {
          navigate(`/tic-tac-toe?playerName=${encodeURIComponent(secondPlayerName)}`);
        }
      });

    connection.on('ChangeXPlayer', (newPlayerX: string) => {
      setPlayerMarker('X');
      setCurrentPlayer('X');
      setOpponentName('');
    });

    connection.on('GameEnded', (message: string) => {
      console.log(`Game ended: ${message}`);
      setGameEnded(true);
      setMessage(message);
    });

    connection.on('GameCreated', (playerMarker, playerName, lobbyName) => {
      console.log(`Player with ${playerMarker} joined`);
      console.log(`${playerName} joined`, lobbyName);
      setCurrentPlayer(playerMarker);
      setPlayerMarker(playerMarker);
    });

    connection.on('GameJoined', (playerMarker: string, lobbyName: string) => {
      console.log(`Player with ${playerMarker} joined`);
      console.log(`${playerName} joined`, lobbyName);
      setCurrentPlayer('X');
      setPlayerMarker(playerMarker);
    });

    connection.on('GameStart', (playerNameToHandle: string, opponentName: string) => {
      setOpponentName(playerNameToHandle === playerName ? opponentName : playerNameToHandle)
    });

    const leaveLobbyOnUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      signalRService.leaveLobby(lobbyName, playerName);
    };

    window.addEventListener('beforeunload', leaveLobbyOnUnload);

    return () => {
      window.removeEventListener('beforeunload', leaveLobbyOnUnload);
    };
  }
}, []);

const leaveLobby = () => {
  signalRService.leaveLobby(lobbyName, playerName);
};
      
return (
  <Box sx={{padding: '40px'}}>
    {gameEnded && (
  <div className="end-game-message" style={{textAlign: 'center'}}>
    {message}
  </div>
    )}
    <div className="player-names">
      <div className={`player-name green-line`}>
      {playerName}
      </div>
      <div className={`player-name`}>
        {opponentName}
      </div>
    </div>
    <div className="turn-indicator">
      {currentPlayer === playerMarker ? <div>Your move</div> : <div>Opponent's move</div>}
    </div>
    <div>
      <table className="tic-tac-toe-board">
        <tbody>
          {board.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className={`tic-tac-toe-cell ${cell}`}
                  onClick={() =>
                    signalRService.makeMove(
                      rowIndex,
                      colIndex,
                      gameEnded,
                      currentPlayer,
                      playerMarker,
                      lobbyName
                    )
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <button className="leave-button" onClick={leaveLobby}>
      Leave Lobby
    </button>
  </Box>
);    
};
    
export default TicTacToeGame;