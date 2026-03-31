// src/components/Game/GameBoard.js
import React, { useState, useEffect } from "react";
import useSnakeGame from "../../hooks/useSnakeGame";

import GameHUD from "../UI/GameHUD";
import GameOverlay from "../UI/GameOverlay";
import EventOverlay from "../UI/EventOverlay";
import Minimap from "../UI/Minimap";
import MobileControls from "../UI/MobileControls";
import FloatingScore from "../UI/FloatingScore";
import AchievementToast from "../UI/AchievementToast";
import LevelTransition from "../UI/LevelTransition";
import GameScene from "./GameScene";
import { Loader } from "@react-three/drei";

import "./GameBoard.css";

const GameBoard = ({ onGameEnd, difficulty, skin, highScore = 0 }) => {
  const COLS = 60;
  const ROWS = 60;

  const [cameraMode, setCameraMode] = useState("FOLLOW");

  const {
    snake, foods, obstacles, portals, enemies, effects, removeEffect,
    gameOver, score, distance, level, speed, moveSnake, resetGame,
    dir, setDir, isPaused, togglePause,
    isInvincible, hasShield, isMagnet,
    lives, combo, activeEvent,
    levelComplete, advanceLevel,
    floatingScores, removeFloatingScore,
    runStats, isShaking,
    newAchievement, clearNewAchievement,
  } = useSnakeGame(COLS, ROWS, difficulty);

  const handleExit = () => onGameEnd(score);

  const handleTurnLeft  = () => !isPaused && setDir({ x: dir.y, y: -dir.x });
  const handleTurnRight = () => !isPaused && setDir({ x: -dir.y, y: dir.x });

  const cycleCamera = () => {
    setCameraMode(prev => {
      if (prev === "FOLLOW") return "TOP";
      if (prev === "TOP") return "POV";
      return "FOLLOW";
    });
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key.toLowerCase() === "c") cycleCamera(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className={`game-container ${isShaking ? "screen-shake" : ""}`}>
      <GameHUD
        score={score} distance={distance} level={level}
        isPaused={isPaused} onTogglePause={togglePause} onExit={handleExit}
        lives={lives} combo={combo}
        isInvincible={isInvincible} hasShield={hasShield} isMagnet={isMagnet}
        speed={speed}
      />

      <GameOverlay
        isPaused={isPaused} gameOver={gameOver}
        score={score} highScore={highScore}
        runStats={runStats}
        onResume={togglePause} onRestart={resetGame} onQuit={handleExit}
      />

      <EventOverlay activeEvent={activeEvent} />

      {/* Floating score pop-ups */}
      {floatingScores.map(fs => (
        <FloatingScore
          key={fs.id} id={fs.id}
          value={fs.value} label={fs.label}
          color={fs.color} x={fs.x} y={fs.y}
          onDone={removeFloatingScore}
        />
      ))}

      {/* Achievement toast */}
      <AchievementToast achievement={newAchievement} onDone={clearNewAchievement} />

      {/* Level transition overlay */}
      {levelComplete && !gameOver && (
        <LevelTransition
          level={level}
          difficulty={difficulty}
          snake={snake}
          onContinue={advanceLevel}
        />
      )}

      <Minimap snake={snake} foods={foods} obstacles={obstacles} enemies={enemies} portals={portals} size={COLS} />
      <MobileControls onTurnLeft={handleTurnLeft} onTurnRight={handleTurnRight} />

      {/* Speed lines overlay */}
      {speed < 200 && (
        <div className="speed-lines" />
      )}

      {/* Low-health vignette */}
      {lives === 1 && !gameOver && (
        <div className="danger-vignette" />
      )}

      <GameScene
        snake={snake} foods={foods} obstacles={obstacles}
        portals={portals} enemies={enemies} effects={effects}
        removeEffect={removeEffect} dir={dir}
        cols={COLS} rows={ROWS}
        isInvincible={isInvincible} hasShield={hasShield} isMagnet={isMagnet}
        skin={skin} cameraMode={cameraMode}
        moveSnake={moveSnake} speed={speed}
        isPaused={isPaused} gameOver={gameOver}
        levelComplete={levelComplete}
        activeEvent={activeEvent} level={level}
        isShaking={isShaking}
      />
      <Loader
        containerStyles={{ background: "#111" }}
        innerStyles={{ width: "300px" }}
        barStyles={{ background: "#4CAF50" }}
      />
    </div>
  );
};

export default GameBoard;
