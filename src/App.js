// src/App.js
import React, { useState, useEffect } from "react";
import Home from "./components/Home/Home";
import GameBoard from "./components/Game/GameBoard";
import "./App.css";

const App = () => {
  const [gameState, setGameState] = useState("HOME"); // HOME, PLAYING
  const [lastScore, setLastScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // NEW: Store selected difficulty
  const [difficulty, setDifficulty] = useState("MEDIUM");

  useEffect(() => {
    const storedBest = localStorage.getItem("snake3d-highscore");
    if (storedBest) setHighScore(parseInt(storedBest, 10));
  }, []);

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState("PLAYING");
  };

  const endGame = (score) => {
    setLastScore(score);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snake3d-highscore", score);
    }
    setGameState("HOME");
  };

  return (
    <div className="app">
      {gameState === "HOME" && (
        <Home
          highScore={highScore}
          lastScore={lastScore}
          onStartGame={startGame}
        />
      )}
      {gameState === "PLAYING" && (
        <GameBoard
          difficulty={difficulty} /* PASS IT DOWN */
          onGameEnd={endGame}
        />
      )}
    </div>
  );
};

export default App;
