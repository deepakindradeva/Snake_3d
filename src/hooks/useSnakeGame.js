// src/hooks/useSnakeGame.js
import { useState, useEffect, useCallback } from "react";
import useSnake from "./useSnake";
import useWorld from "./useWorld";
import { FRUIT_TYPES } from "../utils/gameUtils";

const useSnakeGame = (cols, rows) => {
  // 1. GAME STATUS STATE
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(300);

  // Abilities
  const [isInvincible, setIsInvincible] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [isMagnet, setIsMagnet] = useState(false);

  // 2. SUB-HOOKS
  // FIX: Added 'setDir' to the destructuring list below
  const {
    snake,
    setSnake,
    dir,
    setDir,
    dirRef,
    growthBank,
    setGrowthBank,
    resetSnake,
    turnLeft,
    turnRight,
  } = useSnake(cols, rows);

  const {
    obstacles,
    obstaclesRef,
    food,
    setFood,
    resetWorld,
    updateWorld,
    respawnFood,
  } = useWorld(cols, rows);

  // Audio Helper
  const playSound = (type) => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  // --- INITIALIZATION ---
  const initGame = useCallback(() => {
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);

    resetSnake();
    resetWorld({ x: startX, y: startY });

    setGameOver(false);
    setScore(0);
    setSpeed(300);
    setIsPaused(false);

    // Reset Abilities
    setIsInvincible(true);
    setHasShield(false);
    setIsMagnet(false);
    setTimeout(() => setIsInvincible(false), 5000);
  }, [cols, rows, resetSnake, resetWorld]);

  // Init on mount
  useEffect(() => {
    if (snake.length === 0) initGame();
  }, [initGame, snake.length]);

  const togglePause = useCallback(() => {
    if (!gameOver) setIsPaused((p) => !p);
  }, [gameOver]);

  // --- MAIN GAME LOOP ---
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      // 1. UPDATE WORLD (Infinite Spawner)
      updateWorld(newHead, dir);

      // 2. COLLISION CHECK
      let isCrash = false;
      // Wall Check
      if (
        newHead.x < 0 ||
        newHead.x >= cols ||
        newHead.y < 0 ||
        newHead.y >= rows
      )
        isCrash = true;
      // Obstacle Check
      else {
        for (let obs of obstaclesRef.current) {
          if (obs.x === newHead.x && obs.y === newHead.y) {
            isCrash = true;
            break;
          }
        }
      }

      if (isCrash) {
        if (isInvincible) return prevSnake; // Ghost Mode
        if (hasShield) {
          playSound("shield_break");
          setHasShield(false);
          return prevSnake; // Bounce off
        }
        playSound("crash");
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // 3. EATING CHECK
      const dist = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
      const eatRange = isMagnet ? 3 : 0;

      if (dist <= eatRange) {
        playSound("eat");
        const fruitStats =
          FRUIT_TYPES.find((f) => f.type === food.type) || FRUIT_TYPES[0];

        // Apply Stats
        setScore((s) => s + fruitStats.score);
        setSpeed((s) => Math.min(Math.max(50, s + fruitStats.speedMod), 500));

        // Apply Growth/Shrink
        if (fruitStats.grow > 0)
          setGrowthBank((g) => g + (fruitStats.grow - 1));
        else if (fruitStats.grow < 0) {
          const shrinkAmt = Math.abs(fruitStats.grow);
          for (let i = 0; i < shrinkAmt; i++)
            if (newSnake.length > 3) newSnake.pop();
          newSnake.pop();
        }

        // Apply Abilities
        if (fruitStats.effect === "invincible") {
          setIsInvincible(true);
          setTimeout(() => setIsInvincible(false), 5000);
        }
        if (fruitStats.effect === "shield") setHasShield(true);
        if (fruitStats.effect === "magnet") {
          setIsMagnet(true);
          setTimeout(() => setIsMagnet(false), 10000);
        }

        respawnFood(newHead);
      } else {
        // Normal Move (Shrink tail if not growing)
        if (growthBank > 0) setGrowthBank((g) => g - 1);
        else newSnake.pop();
      }

      return newSnake;
    });
  }, [
    gameOver,
    isPaused,
    dir,
    food,
    growthBank,
    isInvincible,
    hasShield,
    isMagnet,
    obstaclesRef,
    updateWorld,
    respawnFood,
    setGrowthBank,
    cols,
    rows,
  ]);

  // Interval
  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, gameOver, isPaused, speed]);

  // Controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        togglePause();
        return;
      }
      if (isPaused) return;
      if (e.key === "ArrowLeft") turnLeft();
      if (e.key === "ArrowRight") turnRight();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPaused, togglePause, turnLeft, turnRight]);

  return {
    snake,
    food,
    obstacles,
    gameOver,
    score,
    resetGame: initGame,
    dir,
    setDir,
    isPaused,
    togglePause,
    isInvincible,
    hasShield,
    isMagnet,
  };
};

export default useSnakeGame;
