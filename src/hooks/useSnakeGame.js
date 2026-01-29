// src/hooks/useSnakeGame.js
import { useState, useEffect, useCallback, useRef } from "react";
import { DIRECTIONS } from "../utils/constants";

// --- CONFIG ---
const MAP_SIZE = 20;
const OBSTACLE_LIMIT = 2;

// CONFIG: Expanded Food List
const FRUIT_TYPES = [
  // BASICS
  { type: "apple", chance: 0.35, score: 1, speedMod: -5, grow: 1 },
  { type: "banana", chance: 0.15, score: 2, speedMod: -30, grow: 1 },
  { type: "cherry", chance: 0.1, score: 5, speedMod: 0, grow: 3 },
  { type: "ice", chance: 0.1, score: 1, speedMod: 20, grow: 1 },

  // SPECIALS
  { type: "mushroom", chance: 0.1, score: 2, speedMod: 0, grow: -3 }, // Shrink!
  {
    type: "star",
    chance: 0.05,
    score: 0,
    speedMod: 0,
    grow: 0,
    effect: "invincible",
  },
  {
    type: "shield",
    chance: 0.08,
    score: 0,
    speedMod: 0,
    grow: 0,
    effect: "shield",
  },
  {
    type: "magnet",
    chance: 0.07,
    score: 0,
    speedMod: 0,
    grow: 0,
    effect: "magnet",
  },
];

// ... (Keep OBSTACLE_TYPES, isOccupied, getRandomPos same) ...
const OBSTACLE_TYPES = ["tree", "rock", "bush", "tree", "tree"];
const isOccupied = (p, list) => list.some((o) => o.x === p.x && o.y === p.y);
const getRandomPos = (cols, rows, invalidPositions = []) => {
  let pos;
  let attempts = 0;
  while (attempts < 50) {
    pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
    let valid = true;
    for (let i = 0; i < invalidPositions.length; i++) {
      if (invalidPositions[i].x === pos.x && invalidPositions[i].y === pos.y) {
        valid = false;
        break;
      }
    }
    if (valid) return pos;
    attempts++;
  }
  return null;
};

const getRandomFruit = () => {
  const r = Math.random();
  let accumulated = 0;
  for (let fruit of FRUIT_TYPES) {
    accumulated += fruit.chance;
    if (r <= accumulated) return fruit.type;
  }
  return "apple";
};

const useSnakeGame = (cols = MAP_SIZE, rows = MAP_SIZE) => {
  // Game State
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState({ x: 0, y: 0, type: "apple" });
  const [obstacles, setObstacles] = useState([]);
  const [dir, setDir] = useState(DIRECTIONS.RIGHT);
  const [speed, setSpeed] = useState(300);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [growthBank, setGrowthBank] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ABILITIES STATE
  const [isInvincible, setIsInvincible] = useState(false);
  const [hasShield, setHasShield] = useState(false); // New: Shield
  const [isMagnet, setIsMagnet] = useState(false); // New: Magnet

  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const obstaclesRef = useRef(obstacles);

  // Sync Refs
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);
  useEffect(() => {
    foodRef.current = food;
  }, [food]);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  const playSound = (type) => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play().catch((e) => {});
  };

  const initGame = useCallback(() => {
    // ... (Keep World Generation Logic Same as before) ...
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    const startSnake = Array.from({ length: 5 }, (_, i) => ({
      x: startX - i,
      y: startY,
    }));

    const initialObstacles = [];
    const safeZone = 5;
    for (let i = 0; i < 300; i++) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      if (Math.abs(x - startX) < safeZone && Math.abs(y - startY) < safeZone)
        continue;
      if (!isOccupied({ x, y }, initialObstacles)) {
        const type =
          OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        const scale = 0.8 + Math.random() * 0.8;
        initialObstacles.push({ x, y, type, id: i, scale });
      }
    }

    setSnake(startSnake);
    setObstacles(initialObstacles);
    const startFood = getRandomPos(cols, rows, [
      ...startSnake,
      ...initialObstacles,
    ]) || { x: 5, y: 5 };
    setFood({ ...startFood, type: "apple" });
    setDir(DIRECTIONS.RIGHT);
    setSpeed(300);
    setGameOver(false);
    setScore(0);
    setGrowthBank(0);
    setIsPaused(false);

    // Reset Abilities
    setIsInvincible(true);
    setHasShield(false);
    setIsMagnet(false);

    // Initial Invincibility Timer
    setTimeout(() => setIsInvincible(false), 5000);
  }, [cols, rows]);

  // Init on mount
  useEffect(() => {
    if (snake.length === 0) initGame();
  }, [initGame, snake.length]);

  const togglePause = useCallback(() => {
    if (!gameOver) setIsPaused((prev) => !prev);
  }, [gameOver]);

  // SPAWNER (Same logic)
  useEffect(() => {
    if (gameOver || isPaused) return;
    const spawner = setInterval(() => {
      // ... (Keep existing spawner logic) ...
      const currentObs = obstaclesRef.current;
      if (currentObs.length > OBSTACLE_LIMIT) return;
      const centerPos = getRandomPos(cols, rows, [
        ...snakeRef.current,
        foodRef.current,
        ...currentObs,
      ]);
      if (centerPos) {
        setObstacles((prev) => [
          ...prev,
          { ...centerPos, type: "tree", id: Date.now(), scale: 1 },
        ]);
      }
    }, 1000);
    return () => clearInterval(spawner);
  }, [gameOver, isPaused, cols, rows]);

  // --- MOVEMENT LOOP ---
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const newHead = { x: prevSnake[0].x + dir.x, y: prevSnake[0].y + dir.y };

      // 1. COLLISION CHECKS
      let isCrash = false;
      if (
        newHead.x < 0 ||
        newHead.x >= cols ||
        newHead.y < 0 ||
        newHead.y >= rows
      )
        isCrash = true;
      else {
        for (let i = 0; i < obstaclesRef.current.length; i++) {
          if (
            obstaclesRef.current[i].x === newHead.x &&
            obstaclesRef.current[i].y === newHead.y
          ) {
            isCrash = true;
            break;
          }
        }
      }

      // Handle Crash
      if (isCrash) {
        if (isInvincible) return prevSnake; // Ghost Mode
        if (hasShield) {
          playSound("shield_break"); // You need a sound for this!
          setHasShield(false); // Lose shield
          // Bounce back slightly to avoid getting stuck inside the wall
          return prevSnake;
        }

        if (!gameOver) playSound("crash");
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // 2. CHECK EATING (Magnet Logic included)
      // If Magnet is ON, eat if within 3 tiles
      const dist = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
      const eatRange = isMagnet ? 3 : 0; // 0 means direct hit

      if (dist <= eatRange) {
        playSound("eat");
        const fruitStats =
          FRUIT_TYPES.find((f) => f.type === food.type) || FRUIT_TYPES[0];

        // Apply Stats
        setScore((s) => s + fruitStats.score);
        setSpeed((s) => Math.min(Math.max(50, s + fruitStats.speedMod), 500));

        // Handle Growth / Shrink
        if (fruitStats.grow > 0)
          setGrowthBank((g) => g + (fruitStats.grow - 1)); // -1 because 1 is consumed by moving
        else if (fruitStats.grow < 0) {
          // Shrink immediately!
          // Remove extra segments from tail
          const shrinkAmount = Math.abs(fruitStats.grow);
          for (let i = 0; i < shrinkAmount; i++) {
            if (newSnake.length > 3) newSnake.pop();
          }
          newSnake.pop(); // Pop one more to account for movement
        }

        // Handle Special Effects
        if (fruitStats.effect === "invincible") {
          setIsInvincible(true);
          setTimeout(() => setIsInvincible(false), 5000);
        }
        if (fruitStats.effect === "shield") {
          setHasShield(true);
        }
        if (fruitStats.effect === "magnet") {
          setIsMagnet(true);
          setTimeout(() => setIsMagnet(false), 10000); // 10s Magnet
        }

        // Spawn New Fruit
        const nextType = getRandomFruit();
        setFood({
          ...getRandomPos(cols, rows, [...newSnake, ...obstaclesRef.current]),
          type: nextType,
        });
      } else {
        // Normal Movement (Shrink tail if not growing)
        if (growthBank > 0) setGrowthBank((g) => g - 1);
        else newSnake.pop();
      }
      return newSnake;
    });
  }, [
    dir,
    food,
    gameOver,
    isPaused,
    cols,
    rows,
    growthBank,
    isInvincible,
    hasShield,
    isMagnet,
  ]);

  // ... (Keep Interval & KeyPress logic same) ...
  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, gameOver, isPaused, speed]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        togglePause();
        return;
      }
      if (isPaused) return;
      let newDir = null;
      if (e.key === "ArrowLeft") newDir = { x: dir.y, y: -dir.x };
      else if (e.key === "ArrowRight") newDir = { x: -dir.y, y: dir.x };
      if (newDir) setDir(newDir);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [dir, isPaused, togglePause]);

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
