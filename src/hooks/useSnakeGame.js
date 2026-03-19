// src/hooks/useSnakeGame.js
// Triggering rebuild
import { useState, useEffect, useCallback, useRef } from "react";
import useSnake from "./useSnake";
import useWorld from "./useWorld";
import { FRUIT_TYPES } from "../utils/gameUtils";

const useSnakeGame = (cols, rows, difficulty = "MEDIUM") => {
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);

  const [level, setLevel] = useState(1);
  const levelRef = useRef(1);

  const [combo, setCombo] = useState(0);
  const comboTimerRef = useRef(null);

  const warpCooldownRef = useRef(0);

  const [lives, setLives] = useState(3);
  const [activeEvent, setActiveEvent] = useState(null);
  const activeEventTimerRef = useRef(null);

  const triggerEvent = useCallback((title, description, color) => {
    setActiveEvent({ title, description, color });
    if (activeEventTimerRef.current) clearTimeout(activeEventTimerRef.current);
    activeEventTimerRef.current = setTimeout(() => {
      setActiveEvent(null);
    }, 1500);
  }, []);

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
    portals,
    portalsRef,
    enemies,
    enemiesRef,
    resetWorld,
    updateWorld,
    removeAndRespawnFood,
    destroyObstacle,
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

  const respawn = useCallback(() => {
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);

    resetSnake();
    const initialSnake = Array.from({ length: 5 }, (_, i) => ({
      x: startX - i,
      y: startY,
    }));
    resetWorld(initialSnake);

    setSpeed(getInitialSpeed());
    setEffects([]);

    setIsInvincible(true);
    setHasShield(false);
    setIsMagnet(false);
    setTimeout(() => setIsInvincible(false), 3000);
  }, [cols, rows, resetSnake, resetWorld, getInitialSpeed]);

  const initGame = useCallback(() => {
    setGameOver(false);
    setScore(0);
    setDistance(0);
    setLevel(1);
    levelRef.current = 1;
    setLives(3);
    setCombo(0);
    setActiveEvent(null);
    if (activeEventTimerRef.current) clearTimeout(activeEventTimerRef.current);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    setIsPaused(false);
    respawn();
  }, [respawn]);

  useEffect(() => {
    if (snake.length === 0) initGame();
  }, [initGame, snake.length]);

  const togglePause = useCallback(() => {
    if (!gameOver) setIsPaused((p) => !p);
  }, [gameOver]);

  // --- MANUAL MOVE FUNCTION ---
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || activeEvent) return;

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

      for (let obs of obstaclesRef.current) {
        if (obs.x === newHead.x && obs.y === newHead.y) {
          if (isInvincible || hasShield) {
            destroyObstacle(obs.id);
            triggerEvent("SMASH!", "+50 Score", "#FF9800");
            setScore(s => s + 50);
            if (!isInvincible && hasShield) {
                setHasShield(false);
                playSound("shield_break");
            }
          } else {
            isCrash = true;
          }
          break;
        }
      }

      for (let enemy of enemiesRef.current) {
          if (enemy.x === newHead.x && enemy.y === newHead.y) {
              isCrash = true;
              break;
          }
      }

      // Self-Collision Check
      for (let segment of prevSnake) {
        if (segment.x === newHead.x && segment.y === newHead.y) {
          isCrash = true;
          break;
        }
      }

      if (isCrash) {
        if (isInvincible) return prevSnake;
        if (hasShield) {
          playSound("shield_break");
          setHasShield(false);
          return prevSnake;
        }

        if (lives > 1) {
          playSound("crash");
          setLives((l) => l - 1);
          setCombo(0);
          triggerEvent("CRASHED!", "-1 Life", "#F44336");
          setTimeout(() => {
            respawn();
          }, 1500);
          return prevSnake;
        }

        playSound("crash");
        setGameOver(true);
        return prevSnake;
      }

      if (warpCooldownRef.current > 0) warpCooldownRef.current--;
      
      let steppedPortal = portalsRef.current.find(p => p.x === newHead.x && p.y === newHead.y);
      if (steppedPortal && warpCooldownRef.current === 0) {
          const otherPortal = portalsRef.current.find(p => p.id !== steppedPortal.id);
          if (otherPortal) {
              newHead.x = otherPortal.x;
              newHead.y = otherPortal.y;
              warpCooldownRef.current = Math.max(2, prevSnake.length); 
              triggerEvent("WARPED!", "Phase Shift", "#E040FB");
          }
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

        setCombo((c) => c + 1);
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => setCombo(0), 4000); // 4 sec limit

        const currentCombo = combo + 1; 
        const points = fruitStats.score * currentCombo;
        
        setScore((s) => {
            const newScore = s + points;
            const targetLevel = Math.floor(newScore / 300) + 1;
            if (targetLevel > levelRef.current) {
                levelRef.current = targetLevel;
                setLevel(targetLevel);
                triggerEvent("LEVEL UP!", `Stage ${targetLevel}`, "#FFD700");
                playSound("eat");
            }
            return newScore;
        });

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

        removeAndRespawnFood(eatenFood.id, newSnake);

        let colorStr = "#FFF";
        if (eatenFood.type === "apple") colorStr = "#D32F2F";
        else if (eatenFood.type === "banana") colorStr = "#FFEB3B";
        else if (eatenFood.type === "cherry") colorStr = "#880E4F";
        else if (eatenFood.type === "ice") colorStr = "#00E5FF";
        else if (eatenFood.type === "star") colorStr = "#FFD700";
        else if (eatenFood.type === "shield") colorStr = "#2979FF";
        else if (eatenFood.type === "magnet") colorStr = "#FF1744";

        let evtDesc = points > 0 ? `+${points} Score` : "Special Effect!";
        if (currentCombo > 1 && points > 0) evtDesc += ` (x${currentCombo} Combo!)`;

        triggerEvent(
          `Ate ${eatenFood.type.toUpperCase()}`,
          evtDesc,
          colorStr
        );
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
    portalsRef,
    enemiesRef,
    destroyObstacle,
    foodsRef,
    growthBankRef,
    addGrowth,
    updateWorld,
    removeAndRespawnFood,
    difficulty,
    cols,
    rows,
    setSnake,
    activeEvent,
    lives,
    combo, // Pass combo to dependency array
    triggerEvent,
    respawn,
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
    portals,
    enemies,
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
    lives,
    level,
    activeEvent,
  };
};

export default useSnakeGame;
