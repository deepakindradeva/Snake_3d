// src/hooks/useSnakeGame.js
import { useState, useEffect, useCallback, useRef } from "react";
import useSnake from "./useSnake";
import useWorld from "./useWorld";
import { FRUIT_TYPES } from "../utils/gameUtils";

const useSnakeGame = (cols, rows, difficulty = "MEDIUM") => {
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);

  const damageCooldownRef = useRef(false);

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
    if (type === "damage") color = "#FF0000";
    else if (type === "banana") color = "#FFEB3B";
    else if (type === "shield") color = "#2979FF";

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
    setLives(3);
    setSpeed(getInitialSpeed());
    setIsPaused(false);
    setEffects([]);

    setIsInvincible(true);
    setHasShield(false);
    setIsMagnet(false);
    damageCooldownRef.current = false;

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

      // 1. ENDLESS WRAPPING
      if (nextX < 0) nextX = cols - 1;
      else if (nextX >= cols) nextX = 0;
      if (nextY < 0) nextY = rows - 1;
      else if (nextY >= rows) nextY = 0;

      const newHead = { x: nextX, y: nextY };

      updateWorld(newHead, dir);

      // 2. COLLISION CHECK
      let isCrash = false;
      for (let obs of obstaclesRef.current) {
        if (obs.x === newHead.x && obs.y === newHead.y) {
          isCrash = true;
          break;
        }
      }

      if (isCrash) {
        if (!isInvincible && !damageCooldownRef.current) {
          damageCooldownRef.current = true;
          setTimeout(() => {
            damageCooldownRef.current = false;
          }, 2000);

          if (hasShield) {
            playSound("shield_break");
            setHasShield(false);
            setIsInvincible(true);
            setTimeout(() => setIsInvincible(false), 1500);
            return [newHead, ...prevSnake];
          }

          triggerEffect(newHead, "damage");
          playSound("crash");

          // --- FIXED MATH FOR SHRINKING ---
          if (prevSnake.length > 5) {
            growthBankRef.current = 0; // Prevent instant healing

            // We want to lose 3 segments NET.
            // Since we are adding 1 head, we must remove 4 tail segments.
            const damage = 3;
            const headOffset = 1;
            const itemsToKeep = prevSnake.length - (damage + headOffset);

            // Ensure we don't go below min length (3)
            const safeKeepCount = Math.max(2, itemsToKeep);

            const shortenedBody = prevSnake.slice(0, safeKeepCount);

            setIsInvincible(true);
            setTimeout(() => setIsInvincible(false), 2000);

            // Returns: [NewHead (1), ...Body (Length-4)] -> Total Length-3
            return [newHead, ...shortenedBody];
          }

          // SCENARIO 2: Lose Life
          if (lives > 1) {
            setLives((l) => l - 1);

            const startX = Math.floor(cols / 2);
            const startY = Math.floor(rows / 2);
            const respawnSnake = Array.from({ length: 5 }, (_, i) => ({
              x: startX - i,
              y: startY,
            }));

            setIsInvincible(true);
            setTimeout(() => setIsInvincible(false), 3000);

            return respawnSnake;
          }

          // SCENARIO 3: Game Over
          setGameOver(true);
          return prevSnake;
        }
      }

      // 3. NORMAL MOVEMENT
      const newSnake = [newHead, ...prevSnake];
      setDistance((d) => d + 1);

      // 4. EATING LOGIC
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
    lives,
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
    lives,
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
