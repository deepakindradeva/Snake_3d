// src/components/Game/GameBoard.js
import React, { useState, useEffect } from "react";
import useSnakeGame from "../../hooks/useSnakeGame";

import GameHUD from "../UI/GameHUD";
import GameOverlay from "../UI/GameOverlay";
import Minimap from "../UI/Minimap";
import MobileControls from "../UI/MobileControls";
import GameScene from "./GameScene";

import "./GameBoard.css";

// RECEIVE DIFFICULTY PROP
const GameBoard = ({ onGameEnd, difficulty }) => {
  const COLS = 60;
  const ROWS = 60;

  const [cameraMode, setCameraMode] = useState("FOLLOW");

  // PASS DIFFICULTY TO HOOK
  const {
    snake,
    foods,
    obstacles,
    effects,
    removeEffect,
    gameOver,
    score,
    distance,
    speed,
    moveSnake,
    resetGame,
    dir,
    setDir,
    isPaused,
    togglePause,
    isInvincible,
    hasShield,
    isMagnet,
  } = useSnakeGame(COLS, ROWS, difficulty);

  const handleExit = () => onGameEnd(score);

  const handleTurnLeft = () => !isPaused && setDir({ x: dir.y, y: -dir.x });
  const handleTurnRight = () => !isPaused && setDir({ x: -dir.y, y: dir.x });

  const cycleCamera = () => {
    setCameraMode((prev) => {
      if (prev === "FOLLOW") return "TOP";
      if (prev === "TOP") return "POV";
      return "FOLLOW";
    });
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === "c") {
        cycleCamera();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="game-container">
      <GameHUD
        score={score}
        distance={distance}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onExit={handleExit}
      />

      <GameOverlay
        isPaused={isPaused}
        gameOver={gameOver}
        score={score}
        onResume={togglePause}
        onRestart={resetGame}
        onQuit={handleExit}
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
            pointerEvents: "none",
          }}>
          🛡️ IMMUNITY ACTIVE 🛡️
        </div>
      )}

      <Minimap snake={snake} foods={foods} obstacles={obstacles} size={COLS} />
      <MobileControls
        onTurnLeft={handleTurnLeft}
        onTurnRight={handleTurnRight}
      />

      <GameScene
        snake={snake}
        foods={foods}
        obstacles={obstacles}
        effects={effects}
        removeEffect={removeEffect}
        dir={dir}
        cols={COLS}
        rows={ROWS}
        isInvincible={isInvincible}
        hasShield={hasShield}
        isMagnet={isMagnet}
        cameraMode={cameraMode}
        moveSnake={moveSnake}
        speed={speed}
        isPaused={isPaused}
        gameOver={gameOver}
      />
    </div>
  );
};

export default GameBoard;
