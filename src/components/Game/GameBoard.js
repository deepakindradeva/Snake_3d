// src/components/Game/GameBoard.js
import React, { useState, useEffect } from "react";
import useSnakeGame from "../../hooks/useSnakeGame";

// UI Components
import GameHUD from "../UI/GameHUD";
import GameOverlay from "../UI/GameOverlay";
import Minimap from "../UI/Minimap";
import MobileControls from "../UI/MobileControls";

// 3D Scene
import GameScene from "./GameScene";

import "./GameBoard.css";

const GameBoard = ({ onGameEnd }) => {
  const COLS = 60;
  const ROWS = 60;

  // 1. CAMERA STATE
  const [cameraMode, setCameraMode] = useState("FOLLOW"); // Options: FOLLOW, TOP, POV

  // 2. GAME LOGIC HOOK
  const {
    snake,
    food,
    obstacles,
    gameOver,
    score,
    resetGame,
    dir,
    setDir,
    isPaused,
    togglePause,
    isInvincible,
    hasShield,
    isMagnet,
  } = useSnakeGame(COLS, ROWS);

  // --- HANDLERS ---

  const handleExit = () => onGameEnd(score);

  // Mobile Turn Handlers (Only work if not paused)
  const handleTurnLeft = () => !isPaused && setDir({ x: dir.y, y: -dir.x });
  const handleTurnRight = () => !isPaused && setDir({ x: -dir.y, y: dir.x });

  // Camera Toggle Handler
  const cycleCamera = () => {
    setCameraMode((prev) => {
      if (prev === "FOLLOW") return "TOP";
      if (prev === "TOP") return "POV";
      return "FOLLOW";
    });
  };

  // --- KEYBOARD LISTENERS ---
  useEffect(() => {
    const handleKey = (e) => {
      // Press 'C' to switch camera
      if (e.key.toLowerCase() === "c") {
        cycleCamera();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="game-container">
      {/* 1. HEADS UP DISPLAY (Score, Buttons) */}
      <GameHUD
        score={score}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onExit={handleExit}
        onCycleCamera={cycleCamera}
        cameraMode={cameraMode}
      />

      {/* 2. OVERLAYS (Pause Menu, Game Over Screen) */}
      <GameOverlay
        isPaused={isPaused}
        gameOver={gameOver}
        score={score}
        onResume={togglePause}
        onRestart={resetGame}
        onQuit={handleExit}
      />

      {/* 3. VISUAL INDICATOR FOR IMMUNITY */}
      {isInvincible && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: "100px",
            width: "100%",
            textAlign: "center",
            color: "#FFF",
            fontSize: "24px",
            fontWeight: "bold",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            zIndex: 80,
            animation: "pulse 0.5s infinite",
            pointerEvents: "none",
          }}>
          🛡️ IMMUNITY ACTIVE 🛡️
        </div>
      )}

      {/* 4. 2D HELPERS (Minimap, Touch Controls) */}
      <Minimap snake={snake} food={food} obstacles={obstacles} size={COLS} />
      <MobileControls
        onTurnLeft={handleTurnLeft}
        onTurnRight={handleTurnRight}
      />

      {/* 5. THE 3D WORLD */}
      <GameScene
        snake={snake}
        food={food}
        obstacles={obstacles}
        dir={dir}
        cols={COLS}
        rows={ROWS}
        isInvincible={isInvincible}
        hasShield={hasShield}
        isMagnet={isMagnet}
        cameraMode={cameraMode}
      />
    </div>
  );
};

export default GameBoard;
