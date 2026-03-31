// src/hooks/useSnakeGame.js
import { useState, useEffect, useCallback, useRef } from "react";
import useSnake from "./useSnake";
import useWorld from "./useWorld";
import useSounds from "./useSounds";
import { FRUIT_TYPES } from "../utils/gameUtils";
import { getLevelTarget, getLevelConfig } from "../utils/constants";

// ─── Achievement Definitions ────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: "first_eat",    name: "First Bite",        icon: "🍎", desc: "Eat your first fruit",               check: (s) => s.totalEaten >= 1 },
  { id: "combo5",       name: "Chain Reaction",     icon: "🔥", desc: "Reach a x5 combo streak",           check: (s) => s.maxCombo >= 5 },
  { id: "combo10",      name: "Unstoppable",        icon: "⚡", desc: "Reach a x10 combo streak",          check: (s) => s.maxCombo >= 10 },
  { id: "portal5",      name: "Portal Hopper",      icon: "🌀", desc: "Use 5 portals in one run",          check: (s) => s.portalsUsed >= 5 },
  { id: "level5",       name: "Rising Star",        icon: "⭐", desc: "Reach Level 5",                     check: (s) => s.maxLevel >= 5 },
  { id: "level10",      name: "Apex Serpent",       icon: "👑", desc: "Reach Level 10",                    check: (s) => s.maxLevel >= 10 },
  { id: "survive120",   name: "Marathon Runner",    icon: "🏃", desc: "Survive for 2 minutes",             check: (s) => s.timeSurvived >= 120 },
  { id: "score500",     name: "Point Machine",      icon: "💯", desc: "Score 500 points in one run",       check: (s) => s.score >= 500 },
  { id: "score1000",    name: "Legend",             icon: "🏆", desc: "Score 1000 points in one run",      check: (s) => s.score >= 1000 },
  { id: "invincible3",  name: "Star Power",         icon: "🌟", desc: "Use invincibility 3 times",         check: (s) => s.powerUpsUsed.star >= 3 },
  { id: "hard_mode",    name: "Glutton for Pain",   icon: "💀", desc: "Play on HARD mode",                 check: (s) => s.difficulty === "HARD" },
  { id: "eaten50",      name: "Feast Mode",         icon: "🍽️", desc: "Eat 50 fruits total (all runs)",   check: (s, g) => g.totalFruitsAllTime >= 50 },
];

const loadGlobalStats = () => {
  try {
    return JSON.parse(localStorage.getItem("snake3d-global-stats") || "{}");
  } catch { return {}; }
};

const saveGlobalStats = (s) => {
  try { localStorage.setItem("snake3d-global-stats", JSON.stringify(s)); } catch (_) {}
};

const loadUnlocked = () => {
  try {
    return JSON.parse(localStorage.getItem("snake3d-achievements") || "[]");
  } catch { return []; }
};

const saveUnlocked = (arr) => {
  try { localStorage.setItem("snake3d-achievements", JSON.stringify(arr)); } catch (_) {}
};

// ─── Main Game Engine Hook ──────────────────────────────────────────────────
const useSnakeGame = (cols, rows, difficulty = "MEDIUM") => {
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);

  const [level, setLevel] = useState(1);
  const levelRef = useRef(1);

  const [levelComplete, setLevelComplete] = useState(false);
  const levelCompleteRef = useRef(false);

  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(null);

  const warpCooldownRef = useRef(0);

  const [lives, setLives] = useState(3);
  const [activeEvent, setActiveEvent] = useState(null);
  const activeEventTimerRef = useRef(null);

  // ── Floating scores ──
  const [floatingScores, setFloatingScores] = useState([]);
  const addFloatingScore = useCallback((value, color, x, y, label) => {
    const id = Date.now() + Math.random();
    setFloatingScores(prev => [...prev, { id, value, color, x, y, label }]);
  }, []);
  const removeFloatingScore = useCallback((id) => {
    setFloatingScores(prev => prev.filter(f => f.id !== id));
  }, []);

  // ── Run stats ──
  const runStatsRef = useRef({
    totalEaten: 0,
    fruitCounts: {},
    portalsUsed: 0,
    maxCombo: 0,
    maxLevel: 1,
    timeSurvived: 0,
    powerUpsUsed: { star: 0, shield: 0, magnet: 0 },
    score: 0,
    difficulty,
  });
  const [runStats, setRunStats] = useState(null);

  // ── Achievements ──
  const [unlockedAchievements, setUnlockedAchievements] = useState(loadUnlocked);
  const [newAchievement, setNewAchievement] = useState(null);
  const unlockAchievement = useCallback((ach) => {
    setUnlockedAchievements(prev => {
      if (prev.includes(ach.id)) return prev;
      const next = [...prev, ach.id];
      saveUnlocked(next);
      setNewAchievement(ach);
      return next;
    });
  }, []);
  const clearNewAchievement = useCallback(() => setNewAchievement(null), []);

  // ── Sounds ──
  const { play } = useSounds();

  // ── Screen shake ──
  const [isShaking, setIsShaking] = useState(false);
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  // ── Speed ──
  const getInitialSpeed = useCallback(() => {
    switch (difficulty) {
      case "HARD":  return 150;
      case "EASY":  return 350;
      default:       return 250;
    }
  }, [difficulty]);

  const [speed, setSpeed] = useState(getInitialSpeed());

  // ── Abilities ──
  const [isInvincible, setIsInvincible] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [isMagnet, setIsMagnet] = useState(false);
  const [effects, setEffects] = useState([]);

  const { snake, setSnake, dir, setDir, growthBankRef, addGrowth, resetSnake, turnLeft, turnRight } = useSnake(cols, rows);
  const { obstacles, obstaclesRef, foods, foodsRef, portals, portalsRef, enemies, enemiesRef, resetWorld, updateWorld, removeAndRespawnFood, destroyObstacle } = useWorld(cols, rows, difficulty);

  // ── Survival timer ──
  const startTimeRef = useRef(null);

  const triggerEvent = useCallback((title, description, color) => {
    setActiveEvent({ title, description, color });
    if (activeEventTimerRef.current) clearTimeout(activeEventTimerRef.current);
    activeEventTimerRef.current = setTimeout(() => setActiveEvent(null), 1500);
  }, []);

  const triggerEffect = (position, type) => {
    let color = "#FFF";
    if (type === "apple")   color = "#D32F2F";
    if (type === "banana")  color = "#FFEB3B";
    if (type === "ice")     color = "#00E5FF";
    if (type === "shield")  color = "#2979FF";
    setEffects(prev => [...prev, { id: Date.now() + Math.random(), x: position.x, y: position.y, color }]);
  };

  const removeEffect = useCallback((id) => setEffects(prev => prev.filter(e => e.id !== id)), []);

  // ── Achievements checker ──
  const checkAchievements = useCallback((stats) => {
    const globalStats = loadGlobalStats();
    ACHIEVEMENTS.forEach(ach => {
      if (!unlockedAchievements.includes(ach.id) && ach.check(stats, globalStats)) {
        unlockAchievement(ach);
      }
    });
  }, [unlockedAchievements, unlockAchievement]);

  const respawn = useCallback(() => {
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    resetSnake();
    const initialSnake = Array.from({ length: 5 }, (_, i) => ({ x: startX - i, y: startY }));
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
    setLevelComplete(false);
    levelCompleteRef.current = false;
    setLives(3);
    setCombo(0);
    comboRef.current = 0;
    setActiveEvent(null);
    setFloatingScores([]);
    setIsShaking(false);
    if (activeEventTimerRef.current) clearTimeout(activeEventTimerRef.current);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    setIsPaused(false);
    runStatsRef.current = {
      totalEaten: 0, fruitCounts: {}, portalsUsed: 0,
      maxCombo: 0, maxLevel: 1, timeSurvived: 0,
      powerUpsUsed: { star: 0, shield: 0, magnet: 0 },
      score: 0, difficulty,
    };
    startTimeRef.current = Date.now();
    respawn();
  }, [respawn, difficulty]);

  useEffect(() => {
    if (snake.length === 0) initGame();
  }, [initGame, snake.length]);

  // Finalise run stats on game over
  useEffect(() => {
    if (gameOver) {
      const elapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      const stats = { ...runStatsRef.current, timeSurvived: elapsed };
      runStatsRef.current.timeSurvived = elapsed;
      setRunStats({ ...stats });
      play("game_over");
      // Update global stats
      const g = loadGlobalStats();
      g.totalFruitsAllTime = (g.totalFruitsAllTime || 0) + stats.totalEaten;
      saveGlobalStats(g);
      checkAchievements(stats);
    }
  }, [gameOver]); // eslint-disable-line

  const togglePause = useCallback(() => {
    if (!gameOver) setIsPaused(p => !p);
  }, [gameOver]);

  // ─── LEVEL ADVANCE ────────────────────────────────────────────────────────
  const advanceLevel = useCallback((currentSnake) => {
    const nextLevel = levelRef.current + 1;
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    runStatsRef.current.maxLevel = nextLevel;

    const config = getLevelConfig(nextLevel, difficulty);
    setSpeed(config.speed);

    resetWorld(currentSnake, nextLevel);

    levelCompleteRef.current = false;
    setLevelComplete(false);

    // Brief invincibility so the snake doesn't die instantly into new obstacles
    setIsInvincible(true);
    setTimeout(() => setIsInvincible(false), 2000);
  }, [difficulty, resetWorld]);

  // ─── CORE MOVE FUNCTION ────────────────────────────────────────────────────
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || activeEvent || levelCompleteRef.current) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let nextX = head.x + dir.x;
      let nextY = head.y + dir.y;

      // Wrapping
      if (nextX < 0) nextX = cols - 1; else if (nextX >= cols) nextX = 0;
      if (nextY < 0) nextY = rows - 1; else if (nextY >= rows) nextY = 0;

      const newHead = { x: nextX, y: nextY };
      updateWorld(newHead, dir);

      // ── Collision ──
      let isCrash = false;

      for (let obs of obstaclesRef.current) {
        if (obs.x === newHead.x && obs.y === newHead.y) {
          if (isInvincible || hasShield) {
            destroyObstacle(obs.id);
            triggerEvent("SMASH!", "+50 Score", "#FF9800");
            addFloatingScore(50, "#FF9800", newHead.x, newHead.y);
            setScore(s => s + 50);
            if (!isInvincible && hasShield) {
              setHasShield(false);
              play("shield_break");
            }
          } else { isCrash = true; }
          break;
        }
      }

      for (let enemy of enemiesRef.current) {
        if (enemy.x === newHead.x && enemy.y === newHead.y) { isCrash = true; break; }
      }

      for (let segment of prevSnake) {
        if (segment.x === newHead.x && segment.y === newHead.y) { isCrash = true; break; }
      }

      if (isCrash) {
        if (isInvincible) return prevSnake;
        if (hasShield) {
          play("shield_break");
          setHasShield(false);
          triggerShake();
          return prevSnake;
        }

        if (lives > 1) {
          const now = Date.now();
          if (!activeEventTimerRef.current || now - activeEventTimerRef.current > 1000) {
            play("crash");
            triggerShake();
            setLives(l => l - 1);
            setCombo(0);
            comboRef.current = 0;
            triggerEvent("CRASHED!", "-1 Life", "#F44336");
            setTimeout(() => {
              setIsInvincible(true);
              setTimeout(() => setIsInvincible(false), 3000);
            }, 100);
          }
          return prevSnake;
        }

        const now = Date.now();
        if (!activeEventTimerRef.current || now - activeEventTimerRef.current > 1000) {
          play("crash");
          triggerShake();
          setGameOver(true);
        }
        return prevSnake;
      }

      // ── Portals ──
      if (warpCooldownRef.current > 0) warpCooldownRef.current--;
      const steppedPortal = portalsRef.current.find(p => p.x === newHead.x && p.y === newHead.y);
      if (steppedPortal && warpCooldownRef.current === 0) {
        const otherPortal = portalsRef.current.find(p => p.id !== steppedPortal.id);
        if (otherPortal) {
          newHead.x = otherPortal.x;
          newHead.y = otherPortal.y;
          warpCooldownRef.current = Math.max(2, prevSnake.length);
          triggerEvent("WARPED!", "Phase Shift", "#E040FB");
          play("portal");
          runStatsRef.current.portalsUsed++;
          checkAchievements(runStatsRef.current);
        }
      }

      const newSnake = [newHead, ...prevSnake];
      setDistance(d => d + 1);

      // ── Eating ──
      const eatRange = isMagnet ? 3 : 0;
      const eatenFood = foodsRef.current.find(f => {
        const dist = Math.abs(newHead.x - f.x) + Math.abs(newHead.y - f.y);
        return dist <= eatRange;
      });

      if (eatenFood) {
        const fruitStats = FRUIT_TYPES.find(f => f.type === eatenFood.type) || FRUIT_TYPES[0];

        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => {
          setCombo(0);
          comboRef.current = 0;
        }, 4000);

        const points = fruitStats.score * newCombo;

        // Play sound with combo awareness
        if (fruitStats.effect) {
          play("power_up");
        } else {
          play("eat", newCombo);
          if (newCombo >= 5 && newCombo % 2 === 1) play("combo", newCombo);
        }

        // Floating score
        const color = {
          apple: "#ef5350", banana: "#FDD835", cherry: "#e91e63",
          ice: "#00E5FF", star: "#FFD700", shield: "#448AFF",
          magnet: "#FF5252", mushroom: "#FF7043",
        }[eatenFood.type] || "#FFF";

        if (points > 0) addFloatingScore(points, color, eatenFood.x, eatenFood.y);

        // Update run stats
        runStatsRef.current.totalEaten++;
        runStatsRef.current.fruitCounts[eatenFood.type] = (runStatsRef.current.fruitCounts[eatenFood.type] || 0) + 1;
        if (newCombo > runStatsRef.current.maxCombo) runStatsRef.current.maxCombo = newCombo;
        if (eatenFood.type === "star")   runStatsRef.current.powerUpsUsed.star++;
        if (eatenFood.type === "shield") runStatsRef.current.powerUpsUsed.shield++;
        if (eatenFood.type === "magnet") runStatsRef.current.powerUpsUsed.magnet++;

        triggerEffect(eatenFood, eatenFood.type);

        setScore(s => {
          const newScore = s + points;
          runStatsRef.current.score = newScore;
          if (!levelCompleteRef.current && newScore >= getLevelTarget(levelRef.current)) {
            levelCompleteRef.current = true;
            setLevelComplete(true);
            play("level_up");
            checkAchievements(runStatsRef.current);
          }
          return newScore;
        });

        const maxSpeed = difficulty === "HARD" ? 100 : 150;
        setSpeed(s => Math.max(maxSpeed, s + fruitStats.speedMod));

        if (fruitStats.grow > 0) addGrowth(fruitStats.grow - 1);
        else if (fruitStats.grow < 0) {
          const shrinkAmt = Math.abs(fruitStats.grow);
          for (let i = 0; i < shrinkAmt; i++) if (newSnake.length > 3) newSnake.pop();
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

        let evtDesc = points > 0 ? `+${points} Score` : "Special Effect!";
        if (eatenFood.type === "star")     evtDesc = "INVINCIBLE! 5s Immunity!";
        else if (eatenFood.type === "shield")  evtDesc = "SHIELD! Block 1 Crash!";
        else if (eatenFood.type === "magnet")  evtDesc = "MAGNET! Pulls nearby food!";
        else if (eatenFood.type === "ice")     evtDesc += " (FROST: Slowed!)";
        else if (eatenFood.type === "mushroom") evtDesc += " (SHRINK: -3 Tail!)";
        else if (eatenFood.type === "banana")  evtDesc += " (HASTE: Speed Up!)";
        else if (eatenFood.type === "cherry")  evtDesc += " (BIG BERRY +3 Tail!)";
        if (newCombo > 1 && points > 0) evtDesc += ` (x${newCombo} Combo!)`;

        triggerEvent(`Ate ${eatenFood.type.toUpperCase()}`, evtDesc, color);

        // Check eat-based achievements
        checkAchievements(runStatsRef.current);
      } else {
        if (growthBankRef.current > 0) growthBankRef.current -= 1;
        else newSnake.pop();
      }

      return newSnake;
    });
  }, [
    gameOver, isPaused, dir, isInvincible, hasShield, isMagnet,
    obstaclesRef, portalsRef, enemiesRef, destroyObstacle, foodsRef,
    growthBankRef, addGrowth, updateWorld, removeAndRespawnFood,
    difficulty, cols, rows, setSnake, activeEvent, lives,
    triggerEvent, play, addFloatingScore, triggerShake, checkAchievements,
  ]);

  // ── Keyboard controls ──
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p" || e.key === " ") {
        e.preventDefault();
        togglePause();
        return;
      }
      if (isPaused) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft")  turnLeft();
      if (e.key === "ArrowRight") turnRight();
      const key = e.key.toLowerCase();
      if (key === "a") turnLeft();
      if (key === "d") turnRight();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPaused, togglePause, turnLeft, turnRight]);

  return {
    snake, foods, obstacles, portals, enemies, effects, removeEffect,
    gameOver, score, distance, speed, moveSnake, resetGame: initGame,
    dir, setDir, isPaused, togglePause,
    isInvincible, hasShield, isMagnet,
    lives, level, combo,
    levelComplete, advanceLevel,
    activeEvent,
    floatingScores, removeFloatingScore,
    runStats,
    isShaking,
    newAchievement, clearNewAchievement,
    unlockedAchievements,
  };
};

export default useSnakeGame;
