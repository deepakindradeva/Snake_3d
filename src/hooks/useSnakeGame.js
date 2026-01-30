// src/hooks/useSnakeGame.js
import { useState, useEffect, useCallback } from "react";
import useSnake from "./useSnake";
import useWorld from "./useWorld";
import { FRUIT_TYPES } from "../utils/gameUtils";

const useSnakeGame = (cols, rows, difficulty = "MEDIUM") => {
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);

  // LINTER FIX: Wrapped in useCallback for stable dependency
  const getInitialSpeed = useCallback(() => {
    switch (difficulty) {
      case "HARD":
        return 150;
      case "EASY":
        return 350;
      default:
        return 250;
    }
  }, [difficulty]);

  const [speed, setSpeed] = useState(getInitialSpeed());

  // ABILITIES
  const [isInvincible, setIsInvincible] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [isMagnet, setIsMagnet] = useState(false);
  const [effects, setEffects] = useState([]);

  const {
    snake,
    setSnake,
    dir,
    setDir,
    growthBankRef,
    addGrowth,
    resetSnake,
    turnLeft,
    turnRight,
  } = useSnake(cols, rows);

  const {
    obstacles,
    obstaclesRef,
    foods,
    foodsRef,
    resetWorld,
    updateWorld,
    removeAndRespawnFood,
  } = useWorld(cols, rows, difficulty);

  const playSound = (type) => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const triggerEffect = (position, type) => {
    let color = "#FFF";
    if (type === "apple") color = "#D32F2F";
    if (type === "banana") color = "#FFEB3B";
    if (type === "ice") color = "#00E5FF";
    if (type === "shield") color = "#2979FF";
    const newEffect = {
      id: Date.now() + Math.random(),
      x: position.x,
      y: position.y,
      color: color,
    };
    setEffects((prev) => [...prev, newEffect]);
  };

  const removeEffect = useCallback((id) => {
    setEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const initGame = useCallback(() => {
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);

    resetSnake();
    resetWorld({ x: startX, y: startY });

    setGameOver(false);
    setScore(0);
    setDistance(0);
    setSpeed(getInitialSpeed());
    setIsPaused(false);
    setEffects([]);

    setIsInvincible(true);
    setHasShield(false);
    setIsMagnet(false);
    setTimeout(() => setIsInvincible(false), 5000);
  }, [cols, rows, resetSnake, resetWorld, getInitialSpeed]);

  useEffect(() => {
    if (snake.length === 0) initGame();
  }, [initGame, snake.length]);

  const togglePause = useCallback(() => {
    if (!gameOver) setIsPaused((p) => !p);
  }, [gameOver]);

  // --- MANUAL MOVE FUNCTION ---
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];

      let nextX = head.x + dir.x;
      let nextY = head.y + dir.y;

      // 1. ENDLESS WRAPPING LOGIC (Teleport at edges)
      if (nextX < 0) nextX = cols - 1;
      else if (nextX >= cols) nextX = 0;

      if (nextY < 0) nextY = rows - 1;
      else if (nextY >= rows) nextY = 0;

      const newHead = { x: nextX, y: nextY };

      updateWorld(newHead, dir);

      // 2. COLLISION CHECK
      let isCrash = false;

      // Check Obstacles ONLY
      for (let obs of obstaclesRef.current) {
        if (obs.x === newHead.x && obs.y === newHead.y) {
          isCrash = true;
          break;
        }
      }

      // REMOVED: Self-Collision Loop
      // The snake can now safely pass through its own body.

      if (isCrash) {
        if (isInvincible) return prevSnake;
        if (hasShield) {
          playSound("shield_break");
          setHasShield(false);
          return prevSnake;
        }
        playSound("crash");
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];
      setDistance((d) => d + 1);

      // 3. EATING LOGIC
      const eatRange = isMagnet ? 3 : 0;
      const eatenFood = foodsRef.current.find((f) => {
        const dist = Math.abs(newHead.x - f.x) + Math.abs(newHead.y - f.y);
        return dist <= eatRange;
      });

      if (eatenFood) {
        playSound("eat");
        triggerEffect(eatenFood, eatenFood.type);
        const fruitStats =
          FRUIT_TYPES.find((f) => f.type === eatenFood.type) || FRUIT_TYPES[0];

        setScore((s) => s + fruitStats.score);

        const maxSpeed = difficulty === "HARD" ? 100 : 150;
        setSpeed((s) => Math.max(maxSpeed, s + fruitStats.speedMod));

        if (fruitStats.grow > 0) addGrowth(fruitStats.grow - 1);
        else if (fruitStats.grow < 0) {
          const shrinkAmt = Math.abs(fruitStats.grow);
          for (let i = 0; i < shrinkAmt; i++)
            if (newSnake.length > 3) newSnake.pop();
          newSnake.pop();
        }

        if (fruitStats.effect === "invincible") {
          setIsInvincible(true);
          setTimeout(() => setIsInvincible(false), 5000);
        }
        if (fruitStats.effect === "shield") setHasShield(true);
        if (fruitStats.effect === "magnet") {
          setIsMagnet(true);
          setTimeout(() => setIsMagnet(false), 10000);
        }

        removeAndRespawnFood(eatenFood.id, newHead);
      } else {
        if (growthBankRef.current > 0) growthBankRef.current -= 1;
        else newSnake.pop();
      }

      return newSnake;
    });
  }, [
    gameOver,
    isPaused,
    dir,
    isInvincible,
    hasShield,
    isMagnet,
    obstaclesRef,
    foodsRef,
    growthBankRef,
    addGrowth,
    updateWorld,
    removeAndRespawnFood,
    difficulty,
    cols,
    rows,
    setSnake,
  ]);

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
    foods,
    obstacles,
    effects,
    removeEffect,
    gameOver,
    score,
    distance,
    speed,
    moveSnake,
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
