import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TicTacToeLobby from './TicTacToeLobby';
import TicTacToeGame from './TicTacToeGame';
import StartPage from './StartPage';
import BattleshipGame from './BattleshipGame';
import BattleshipLobby from './BattleshipLobby';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage/>} />
        <Route path="/tic-tac-toe" element={<TicTacToeLobby/>} />
        <Route path="/tic-tac-toe/game/:lobbyName" element={<TicTacToeGame />} />
        <Route path="/battleship" element={<BattleshipLobby/>} />
        <Route path="/battleship/game/:lobbyName" element={<BattleshipGame />} />
      </Routes>
    </Router>
  );
};

export default App;
