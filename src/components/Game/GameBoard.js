// src/components/Game/GameBoard.js
import React from "react";
import useSnakeGame from "../../hooks/useSnakeGame";
import Minimap from "../UI/Minimap";
import MobileControls from "../UI/MobileControls";

// Imported Sub-Components
import GameHUD from "../UI/GameHUD";
import GameOverlay from "../UI/GameOverlay";
import GameScene from "./GameScene";

import "./GameBoard.css";

const GameBoard = ({ onGameEnd }) => {
  const COLS = 60;
  const ROWS = 60;

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
    isMagnet, // <--- Get new props
  } = useSnakeGame(COLS, ROWS);

  // --- Handlers ---
  const handleExit = () => onGameEnd(score);
  const handleTurnLeft = () => !isPaused && setDir({ x: dir.y, y: -dir.x });
  const handleTurnRight = () => !isPaused && setDir({ x: -dir.y, y: dir.x });

  return (
    <div className="game-container">
      {/* 1. Add "SAFE MODE" text to HUD if active */}
      <GameHUD
        score={score}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onExit={handleExit}
      />

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
          }}>
          🛡️ IMMUNITY ACTIVE 🛡️
        </div>
      )}

      {/* 2. OVERLAYS (Pause / Game Over) */}
      <GameOverlay
        isPaused={isPaused}
        gameOver={gameOver}
        score={score}
        onResume={togglePause}
        onRestart={resetGame}
        onQuit={handleExit}
      />

      {/* 3. 2D UI ELEMENTS */}
      <Minimap
        snake={snake}
        food={food}
        obstacles={obstacles}
        size={COLS}
        dir={dir}
      />
      <MobileControls
        onTurnLeft={handleTurnLeft}
        onTurnRight={handleTurnRight}
      />

      {/* 4. 3D SCENE */}
      <GameScene
        snake={snake}
        food={food}
        obstacles={obstacles}
        dir={dir}
        cols={COLS}
        rows={ROWS}
        isInvincible={isInvincible}
        hasShield={hasShield} // <--- Pass down
        isMagnet={isMagnet} // <--- Pass down
      />
    </div>
  );
};

export default GameBoard;
