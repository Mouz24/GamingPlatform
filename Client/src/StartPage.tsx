import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import TicTacToeImage from './assets/TicTacToe.jpg';
import BattleshipImage from './assets/Battleship.jpg';
import { TextField } from '@mui/material';

const images = [
  {
    url: TicTacToeImage, // Replace with actual image path
    title: 'Play Tic-Tac-Toe',
    width: '40%',
  },
  {
    url: BattleshipImage, // Replace with actual image path
    title: 'Play Battleship',
    width: '40%',
  },
];

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: 200,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important', // Overrides inline-style
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
});

const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
}));

const ImageMarked = styled('span')(({ theme }) => ({
  height: 3,
  width: 18,
  backgroundColor: theme.palette.common.white,
  position: 'absolute',
  bottom: -2,
  left: 'calc(50% - 9px)',
  transition: theme.transitions.create('opacity'),
}));

const StartPage: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>('');
  const [isPlayerNameValid, setIsPlayerNameValid] = useState<boolean>(true);

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setPlayerName(newName);
    setIsPlayerNameValid(newName.trim() !== '');
  };

  return (
    <Box sx={{ padding: '20px', textAlign: 'center' }}>
      <Typography variant="h4">Choose a Game to Play</Typography>
      <Box sx={{ marginTop: '20px', marginBottom: '20px' }}>
        <TextField
          type="text"
          value={playerName}
          onChange={handlePlayerNameChange}
          placeholder="Your Player Name"
          label="Enter Your Player Name"
          variant="outlined"
          error={!isPlayerNameValid}
          helperText={!isPlayerNameValid ? 'Player name cannot be empty' : ''}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 300, width: '100%' }}>
        {images.map((image) => (
          <ImageButton
            focusRipple
            key={image.title}
            style={{
              width: image.width,
              height: '400px',
            }}
          >
            <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
            <ImageBackdrop className="MuiImageBackdrop-root" />
            <Image>
              <Typography
                component="span"
                variant="subtitle1"
                color="inherit"
                sx={{
                  position: 'relative',
                  p: 4,
                  pt: 2,
                  pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                }}
              >
                <Link
                  to={
                    playerName && isPlayerNameValid // Only link if playerName is not empty and valid
                      ? image.title === 'Play Tic-Tac-Toe'
                        ? `/tic-tac-toe?playerName=${encodeURIComponent(playerName)}`
                        : `/battleship?playerName=${encodeURIComponent(playerName)}`
                      : ''
                  }
                  style={{ textDecoration: 'none' }}
                >
                  {image.title}
                </Link>
                <ImageMarked className="MuiImageMarked-root" />
              </Typography>
            </Image>
          </ImageButton>
        ))}
      </Box>
      {!isPlayerNameValid && <p>Please enter a valid player name</p>}
    </Box>
  );
};

export default StartPage;
