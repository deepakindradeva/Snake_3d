import React, { useState, useEffect } from "react";
import "./App.css";

// --- NEW PATHS ---
import GameBoard from "./components/Game/GameBoard";
import Home from "./components/Home/Home";

function App() {
  const [view, setView] = useState("HOME"); // Start at HOME
  const [highScore, setHighScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);

  // Load High Score on startup
  useEffect(() => {
    const savedScore = localStorage.getItem("snakeHighScore");
    if (savedScore) {
      setHighScore(parseInt(savedScore, 10));
    }
  }, []);

  const startGame = () => {
    setView("GAME");
  };

  const handleGameEnd = (score) => {
    setLastScore(score);

    // Update High Score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score);
    }

    // Go back to the homepage
    setView("HOME");
  };

  return (
    <div className="App">
      {view === "HOME" ? (
        <Home
          highScore={highScore}
          lastScore={lastScore}
          onStartGame={startGame}
        />
      ) : (
        <GameBoard onGameEnd={handleGameEnd} />
      )}
    </div>
  );
}

export default App;
