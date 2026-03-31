// src/components/Game/GameBoard.js
import { useState, useEffect } from "react";
import useSnakeGame from "../../hooks/useSnakeGame";
import { DEFAULT_CHARACTER } from "../../utils/characters";

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

const GameBoard = ({ onGameEnd, difficulty, character = DEFAULT_CHARACTER, highScore = 0 }) => {
  const COLS = 60;
  const ROWS = 60;

  const [cameraMode, setCameraMode] = useState("FOLLOW");

  const {
    snake, foods, obstacles, portals, enemies, effects, removeEffect,
    gameOver, score, distance, level, speed, moveSnake, resetGame,
    dir, turnLeft, turnRight, isPaused, togglePause,
    isInvincible, hasShield, isMagnet,
    lives, combo, activeEvent,
    levelComplete, advanceLevel,
    floatingScores, removeFloatingScore,
    runStats, isShaking,
    newAchievement, clearNewAchievement,
  } = useSnakeGame(COLS, ROWS, difficulty, character);

  const handleExit = () => onGameEnd(score);

  const handleTurnLeft  = () => { if (!isPaused) turnLeft(); };
  const handleTurnRight = () => { if (!isPaused) turnRight(); };

  const cycleCamera = () => {
    setCameraMode(prev => {
      if (prev === "FOLLOW") return "TOP";
      if (prev === "TOP")    return "POV";
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

      {floatingScores.map(fs => (
        <FloatingScore
          key={fs.id} id={fs.id}
          value={fs.value} label={fs.label}
          color={fs.color} x={fs.x} y={fs.y}
          onDone={removeFloatingScore}
        />
      ))}

      <AchievementToast achievement={newAchievement} onDone={clearNewAchievement} />

      {levelComplete && !gameOver && (
        <LevelTransition
          level={level} difficulty={difficulty}
          snake={snake} onContinue={advanceLevel}
        />
      )}

      <Minimap snake={snake} foods={foods} obstacles={obstacles} enemies={enemies} portals={portals} size={COLS} />

      {/* Pass currentDir so swipe detector can compute correct relative turns */}
      <MobileControls
        onTurnLeft={handleTurnLeft}
        onTurnRight={handleTurnRight}
        currentDir={dir}
      />

      {speed < 200 && <div className="speed-lines" />}
      {lives === 1 && !gameOver && <div className="danger-vignette" />}

      <GameScene
        snake={snake} foods={foods} obstacles={obstacles}
        portals={portals} enemies={enemies} effects={effects}
        removeEffect={removeEffect} dir={dir}
        cols={COLS} rows={ROWS}
        isInvincible={isInvincible} hasShield={hasShield} isMagnet={isMagnet}
        character={character} cameraMode={cameraMode}
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
