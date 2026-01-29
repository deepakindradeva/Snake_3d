// src/App.js
import React, { useState, Suspense, lazy } from "react";
import "./App.css";
import Home from "./components/Home/Home";
import { Loader } from "@react-three/drei"; // <--- Import Loader

// 1. LAZY LOAD THE GAME
// This tells the browser: "Don't download this file until we need it."
const GameBoard = lazy(() => import("./components/Game/GameBoard"));

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("snakeHighScore")) || 0,
  );
  const [lastScore, setLastScore] = useState(0);

  const handleStartGame = () => {
    setIsPlaying(true);
  };

  const handleGameEnd = (score) => {
    setIsPlaying(false);
    setLastScore(score);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score);
    }
  };

  return (
    <div className="App">
      {!isPlaying ? (
        <Home
          highScore={highScore}
          lastScore={lastScore}
          onStartGame={handleStartGame}
        />
      ) : (
        // 2. WRAP GAME IN SUSPENSE
        // This shows a fallback (empty) while code loads
        <Suspense fallback={null}>
          <GameBoard onGameEnd={handleGameEnd} />
        </Suspense>
      )}

      {/* 3. ADD THE 3D LOADER OVERLAY */}
      {/* This detects when textures/models are loading and shows a bar */}
      <Loader
        containerStyles={{ background: "#80DEEA" }} // Match sky color
        innerStyles={{ background: "rgba(255,255,255,0.5)", width: "200px" }}
        barStyles={{ background: "#4CAF50" }}
        dataStyles={{ color: "#01579B", fontWeight: "bold" }}
        dataInterpolation={(p) => `Loading World... ${p.toFixed(0)}%`}
      />
    </div>
  );
}

export default App;
