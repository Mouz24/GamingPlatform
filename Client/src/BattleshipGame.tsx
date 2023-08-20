import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import signalRService from './SignalRBattleshipService';
import { Button, Grid, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Checkbox } from '@mui/material';
import "./Battleship.css"

const BattleshipGame: React.FC = () => {
  const { playerName, lobbyName } = useParams<{ playerName: string; lobbyName: string}>();
  const connection = signalRService.getConnection();
  const [playerGrid, setPlayerGrid] = useState<string[][]>([]);
  const [opponentGrid, setOpponentGrid] = useState<string[][]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);
  const theme = useTheme();
  const [selectedShipType, setSelectedShipType] = useState<number | null>(null);
  const [remainingShips, setRemainingShips] = useState<number>(3);
  const [verticalPlacement, setVerticalPlacement] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
    
  useEffect(() => {
    if (connection) {
      connection.on('YourTurn', () => {
        setIsPlayerTurn(true);
        console.log("turn")
      });

      connection.on('ShotResult', (targetX: number, targetY: number, result: string) => {
        setOpponentGrid(prevOpponentGrid => {
          const updatedGrid = prevOpponentGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              rowIndex === targetX && colIndex === targetY ? result : cell
            )
          );
          return updatedGrid;
        });
      });

      connection.on('GameResult', (message: string) => {
        console.log(`Game ended: ${message}`);
        setGameEnded(true);
        setMessage(message);
      });

      connection.on('OpponentLeft', () => {
        setGameEnded(true);
        setMessage('Your opponent left. You won!');
      });

      connection.on('PlayerLeft', (leftPlayerName) => {
        navigate(`/tic-tac-toe?playerName=${encodeURIComponent(leftPlayerName)}`);
        setMessage('Your opponent left. You won!');
      });
      
      connection.on('ShipPlaced', (shipType: number, shipLength: number, startX: number, startY: number, isVertical: boolean) => {
        setPlayerGrid(prevPlayerGrid => {
          const updatedGrid = prevPlayerGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              if (
                (isVertical && rowIndex >= startX && rowIndex < startX + shipLength && colIndex === startY) ||
                (!isVertical && rowIndex === startX && colIndex >= startY && colIndex < startY + shipLength)
              ) {
                return 'S';
              }
              return cell;
            })
          );
          return updatedGrid;
        });
      
        setRemainingShips(remainingShips - 1);
      });
      
    }
  }, [connection, playerName, lobbyName, playerGrid, opponentGrid]);

  const handleFireShot = (targetX: number, targetY: number) => {
    if (connection && isPlayerTurn) {
      signalRService.fireShot(lobbyName, targetX, targetY);
      setIsPlayerTurn(false);
    }
  };

  const handlePlaceShip = (shipType: number | null, startX: number, startY: number, isVertical: boolean) => {
    if (connection && playerGrid[startX][startY] === '') {
      connection.invoke('PlaceShip', lobbyName, shipType, startX, startY, isVertical);
    }
  };

  useEffect(() => {
    const emptyGrid: string[][] = [];

    for (let i = 0; i < 10; i++) {
      const row: string[] = [];
      for (let j = 0; j < 10; j++) {
        row.push('');
      }
      emptyGrid.push([...row]); // Clone the row array to make it independent
    }

    setPlayerGrid(emptyGrid);
    setOpponentGrid(emptyGrid);
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Battleship Game - {lobbyName}
      </Typography>
      {gameEnded && (
        <div className="end-game-message" style={{textAlign: 'center'}}>
          {message}
        </div>
      )}
      <Paper elevation={3} style={{ padding: theme.spacing(2), marginBottom: theme.spacing(2) }}>
        <Typography variant="h6">Select a Ship to Place</Typography>
        <Button
          variant="outlined"
          onClick={() => setSelectedShipType(1)}
          disabled={selectedShipType === 1}
        >
          Ship Type 1
        </Button>
        <Button
          variant="outlined"
          onClick={() => setSelectedShipType(2)}
          disabled={selectedShipType === 2}
        >
          Ship Type 2
        </Button>
        <Button
          variant="outlined"
          onClick={() => setSelectedShipType(3)}
          disabled={selectedShipType === 3}
        >
          Ship Type 3
        </Button>
        <Checkbox
              checked={verticalPlacement} 
              onChange={(event) => setVerticalPlacement(event.target.checked)}
        />
        <span>Place vertically</span>
      </Paper>
      <Paper elevation={3} style={{ padding: theme.spacing(2), marginBottom: theme.spacing(2) }}>
        <Typography variant="h6">Your Grid</Typography>
        <Grid container spacing={1}>
          {playerGrid.map((row, rowIndex) => (
            <Grid key={rowIndex} container item>
              {row.map((cell, colIndex) => (
                <Grid key={colIndex} item>
                  <Button
                    variant="outlined"
                    onClick={() => handlePlaceShip(selectedShipType, rowIndex, colIndex, verticalPlacement)}
                    disabled={cell !== '' || selectedShipType === null || remainingShips === 0}
                  >
                    {cell}
                  </Button>
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Paper elevation={3} style={{ padding: theme.spacing(2) }}>
        <Typography variant="h6">Opponent's Grid</Typography>
        <Grid container spacing={1}>
          {opponentGrid.map((row, rowIndex) => (
            <Grid key={rowIndex} container item>
              {row.map((cell, colIndex) => (
                <Grid key={colIndex} item>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: cell === 'hit' ? theme.palette.error.main : cell === 'miss' ? 'transparent' : theme.palette.primary.main,
                      color: cell === 'miss' ? theme.palette.text.primary : theme.palette.common.white,
                    }}
                    onClick={() => handleFireShot(rowIndex, colIndex)}
                    disabled={!isPlayerTurn}
                  >
                    {cell === 'hit' ? 'H' : cell === 'miss' ? 'M' : ''}
                  </Button>
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Paper>
      <button className="leave-button" onClick={() => signalRService.leaveLobby(lobbyName)}>
            Leave Lobby
      </button>
    </div>
  );
};

export default BattleshipGame;
