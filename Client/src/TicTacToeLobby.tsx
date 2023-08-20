import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import signalRService from './SignalRTicTacToeService';
import axios from 'axios';
import { Box, Button, List, ListItem, ListItemButton, ListItemText, TextField } from '@mui/material';

const TicTacToeLobby: React.FC = () => {
const connection = signalRService.getConnection();
const [gameEnded, setGameEnded] = useState<boolean>(false);
const [openLobbies, setOpenLobbies] = useState<string[]>([]);
const [lobbyNameInput, setLobbyNameInput] = useState<string>('');
const [showLobbyNameInput, setShowLobbyNameInput] = useState<boolean>(false); // New state
const navigate = useNavigate();
const location = useLocation();
const params = new URLSearchParams(location.search);
const [playerName, setPlayerName] = useState('');
const [isLobbyNameValid, setIsLobbyNameValid] = useState<boolean>(true);

useEffect(() => {
  if (connection) {
    setPlayerName(params.get('playerName') || '');
    
    connection.on('OpenLobbies', (lobbyNames: string[]) => {
      setOpenLobbies(lobbyNames);
    });

    connection.on('NewLobbyCreated', () => {
      axios.get('http://peabody28.com:1032/api/tic-tac-toe/lobbies')
      .then(response => {
        setOpenLobbies(response.data);
      })
      .catch(error => {
        console.error('Error fetching open lobbies:', error);
      });
    });

    connection.on('LobbyAvailable', () => {
      axios.get('http://peabody28.com:1032/api/tic-tac-toe/lobbies')
      .then(response => {
        setOpenLobbies(response.data);
      })
      .catch(error => {
        console.error('Error fetching open lobbies:', error);
      });
    });

    connection.on('PlayerJoined', () => {
      axios.get('http://peabody28.com:1032/api/tic-tac-toe/lobbies')
      .then(response => {
        setOpenLobbies(response.data);
      })
      .catch(error => {
        console.error('Error fetching open lobbies:', error);
      });
    });

    connection.on('LobbyClosed', () => {
      axios.get('http://peabody28.com:1032/api/tic-tac-toe/lobbies')
      .then(response => {
        setOpenLobbies(response.data);
      })
      .catch(error => {
        console.error('Error fetching open lobbies:', error);
      });
    });

    connection.invoke('GetOpenLobbies');
  } 
}, [connection]);

const handleJoinGame = (lobbyName: string) => {
  if (connection) {
    connection.invoke('JoinGame', playerName, lobbyName);
    navigate(`/tic-tac-toe/game/${lobbyName}`, {
      state: {playerName: playerName, lobbyName: lobbyName, yourMarker: 'O'}
    });
  }
};

const handleCreateGame = () => {
  if (!showLobbyNameInput) {
    setShowLobbyNameInput(true);
  } else if (connection && lobbyNameInput.trim() !== '') {
    connection.invoke('CreateGame', playerName, lobbyNameInput);
    navigate(`/tic-tac-toe/game/${lobbyNameInput}`, {
      state: {playerName: playerName, lobbyName: lobbyNameInput, yourMarker: 'X'}
    });
  } else {
    setIsLobbyNameValid(lobbyNameInput.trim() !== '');
  }
};

return (
  <Box sx={{ padding: '20px'}}>
    <div>
      Create Game:
      {!showLobbyNameInput ? (
        <Button variant="contained" onClick={handleCreateGame}>
          Create
        </Button>
      ) : (
        <Box sx={{width: '300px'}}>
          <TextField
            type="text"
            value={lobbyNameInput}
            onChange={(e) => {
              setLobbyNameInput(e.target.value);
              setIsLobbyNameValid(e.target.value.trim() !== ''); // Set isLobbyNameValid based on input
            }}
            label="Enter Lobby Name"
            variant="outlined"
            error={!isLobbyNameValid}
            helperText={!isLobbyNameValid ? 'Lobby name cannot be empty' : ''}
          />
          <Button variant="contained" onClick={handleCreateGame}>
            Create
          </Button>
        </Box>
      )}
    </div>
    <div>
      Open Lobbies:
      <List>
        {openLobbies.map(lobbyName => (
          <ListItem key={lobbyName}>
            <ListItemButton onClick={() => handleJoinGame(lobbyName)}>
              <ListItemText primary={lobbyName} />
              <Button variant="outlined">Join</Button>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  </Box>
);
};

export default TicTacToeLobby;
