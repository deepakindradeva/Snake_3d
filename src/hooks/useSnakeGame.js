// src/hooks/useSnakeGame.js
import { useState, useEffect, useCallback, useRef } from "react";
import useSnake from "./useSnake";
import useWorld from "./useWorld";
import useSounds from "./useSounds";
import { ALL_FRUIT_TYPES, FRUIT_TYPES } from "../utils/gameUtils";
import { getLevelTarget, getLevelConfig } from "../utils/constants";
import { DEFAULT_CHARACTER } from "../utils/characters";

// ─── Per-food snake body effect config (emissive glow + special type) ────────
const SNAKE_EFFECT_MAP = {
  banana:          { emissive: "#FFD600", intensity: 0.9, type: "haste",  duration: 1500 },
  hot_cocoa:       { emissive: "#FF8F00", intensity: 0.7, type: "haste",  duration: 1000 },
  cherry:          { emissive: "#e91e63", intensity: 1.1, type: "grow",   duration: 900  },
  mushroom:        { emissive: "#FF7043", intensity: 0.9, type: "shrink", duration: 700  },
  ice:             { emissive: "#00E5FF", intensity: 0.9, type: "frost",  duration: 2000 },
  icicle:          { emissive: "#B3E5FC", intensity: 0.8, type: "frost",  duration: 2000 },
  mirage:          { emissive: "#80DEEA", intensity: 0.7, type: "frost",  duration: 1500 },
  aurora_shard:    { emissive: "#80D8FF", intensity: 1.0, type: "frost",  duration: 2500 },
  snowberry:       { emissive: "#E1F5FE", intensity: 0.8, type: "frost",  duration: 1200 },
  ember_fruit:     { emissive: "#FF3D00", intensity: 1.0, type: "fire",   duration: 1200 },
  magma_crystal:   { emissive: "#FF1744", intensity: 1.2, type: "fire",   duration: 1500 },
  phoenix_feather: { emissive: "#FF6D00", intensity: 1.1, type: "fire",   duration: 2000 },
  brimstone:       { emissive: "#BF360C", intensity: 0.7, type: "fire",   duration: 900  },
  pearl:           { emissive: "#E0E0E0", intensity: 0.9, type: "ocean",  duration: 1000 },
  sea_star:        { emissive: "#FFD740", intensity: 1.0, type: "ocean",  duration: 1000 },
  sea_grape:       { emissive: "#CE93D8", intensity: 0.7, type: "ocean",  duration: 800  },
};

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
  try { return JSON.parse(localStorage.getItem("snake3d-global-stats") || "{}"); }
  catch { return {}; }
};

const saveGlobalStats = (s) => {
  try { localStorage.setItem("snake3d-global-stats", JSON.stringify(s)); } catch (_) {}
};

const loadUnlocked = () => {
  try { return JSON.parse(localStorage.getItem("snake3d-achievements") || "[]"); }
  catch { return []; }
};

const saveUnlocked = (arr) => {
  try { localStorage.setItem("snake3d-achievements", JSON.stringify(arr)); } catch (_) {}
};

// ─── Main Game Engine Hook ──────────────────────────────────────────────────
const useSnakeGame = (cols, rows, difficulty = "MEDIUM", character = DEFAULT_CHARACTER) => {
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

  const startLives = character?.stats?.startLives ?? 3;
  const [lives, setLives] = useState(startLives);
  const [activeEvent, setActiveEvent] = useState(null);
  const activeEventTimerRef = useRef(null);

  // ── Snake body visual effect (set on food eat, fades automatically) ──
  const [snakeEffect, setSnakeEffect] = useState(null);

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
    const base = difficulty === "HARD" ? 150 : difficulty === "EASY" ? 350 : 250;
    const bonus = character?.stats?.speedBonus ?? 0;
    return base + bonus;
  }, [difficulty, character]);

  const [speed, setSpeed] = useState(getInitialSpeed());

  // ── Abilities ──
  const [isInvincible, setIsInvincible] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [isMagnet, setIsMagnet] = useState(false);
  const [effects, setEffects] = useState([]);

  const { snake, setSnake, dir, setDir, growthBankRef, addGrowth, resetSnake, turnLeft, turnRight } = useSnake(cols, rows);
  const { obstacles, obstaclesRef, foods, foodsRef, portals, portalsRef, enemies, enemiesRef, resetWorld, updateWorld, removeAndRespawnFood, destroyObstacle, spawnObstacleNear } = useWorld(cols, rows, difficulty);

  // ── Survival timer ──
  const startTimeRef = useRef(null);

  const triggerEvent = useCallback((title, description, color) => {
    setActiveEvent({ title, description, color });
    if (activeEventTimerRef.current) clearTimeout(activeEventTimerRef.current);
    activeEventTimerRef.current = setTimeout(() => setActiveEvent(null), 1500);
  }, []);

  const triggerEffect = (position, type) => {
    let color = "#FFF";
    if (type === "apple" || type === "date" || type === "ember_fruit" || type === "sea_grape" || type === "snowberry")
      color = "#D32F2F";
    if (type === "banana" || type === "hot_cocoa" || type === "kelp")
      color = "#FFEB3B";
    if (type === "ice" || type === "icicle" || type === "mirage")
      color = "#00E5FF";
    if (type === "shield")
      color = "#2979FF";
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
    setLives(startLives);
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
  }, [respawn, difficulty, startLives]);

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
    const bonus = character?.stats?.speedBonus ?? 0;
    setSpeed(config.speed + bonus);

    resetWorld(currentSnake, nextLevel);

    levelCompleteRef.current = false;
    setLevelComplete(false);

    setIsInvincible(true);
    setTimeout(() => setIsInvincible(false), 2000);
  }, [difficulty, resetWorld, character]);

  // ─── CORE MOVE FUNCTION ────────────────────────────────────────────────────
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || activeEvent || levelCompleteRef.current) return;

    // Character passive helpers
    const passiveId = character?.passive?.id;
    const smashBonus = passiveId === "smash_bonus" ? 100 : 50;
    const comboWindow = passiveId === "longer_combo" ? 5000 : 4000;
    const growthMult = character?.stats?.growthMult ?? 1.0;
    const iceResist = passiveId === "ice_resist";
    const portalRush = passiveId === "portal_rush";

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
            triggerEvent("SMASH!", `+${smashBonus} Score`, "#FF9800");
            addFloatingScore(smashBonus, "#FF9800", newHead.x, newHead.y);
            setScore(s => s + smashBonus);
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
          const baseCooldown = Math.max(2, prevSnake.length);
          warpCooldownRef.current = portalRush ? Math.max(1, Math.floor(baseCooldown / 2)) : baseCooldown;
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
        const fruitStats = ALL_FRUIT_TYPES.find(f => f.type === eatenFood.type) || FRUIT_TYPES[0];

        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => {
          setCombo(0);
          comboRef.current = 0;
        }, comboWindow);

        const points = fruitStats.score * newCombo;

        if (fruitStats.effect) {
          play("power_up");
        } else {
          play("eat", newCombo);
          if (newCombo >= 5 && newCombo % 2 === 1) play("combo", newCombo);
        }

        const color = {
          apple: "#ef5350", banana: "#FDD835", cherry: "#e91e63",
          ice: "#00E5FF", star: "#FFD700", shield: "#448AFF",
          magnet: "#FF5252", mushroom: "#FF7043",
          date: "#FFCC80", cactus_fruit: "#9CCC65", mirage: "#80DEEA", scarab: "#8D6E63",
          snowberry: "#E3F2FD", icicle: "#B3E5FC", aurora_shard: "#80D8FF", hot_cocoa: "#795548",
          ember_fruit: "#FF7043", magma_crystal: "#FF1744", phoenix_feather: "#FF6D00", brimstone: "#4E342E",
          sea_grape: "#9575CD", kelp: "#66BB6A", pearl: "#F5F5F5", sea_star: "#FFD740",
        }[eatenFood.type] || "#FFF";

        // Build a concise floating label so food feedback never blocks the game
        let floatLabel;
        if (fruitStats.effect === "invincible")        floatLabel = "⭐ INVINCIBLE!";
        else if (fruitStats.effect === "shield")       floatLabel = "🛡️ SHIELD!";
        else if (fruitStats.effect === "magnet")       floatLabel = "🧲 MAGNET!";
        else if (points > 0) {
          floatLabel = `+${points}`;
          if (fruitStats.speedMod > 0)         floatLabel += " FROST";
          else if (fruitStats.grow < 0)        floatLabel += " SHRINK";
          else if (fruitStats.speedMod < -15)  floatLabel += " HASTE";
          else if (fruitStats.grow >= 3)       floatLabel += " +TAIL";
          if (newCombo > 1)                    floatLabel += ` x${newCombo}`;
        }
        if (floatLabel) addFloatingScore(points, color, eatenFood.x, eatenFood.y, floatLabel);

        // Snake body visual reaction — mapped per food type, else generic color pulse
        if (!fruitStats.effect) {
          const effCfg = SNAKE_EFFECT_MAP[eatenFood.type];
          if (effCfg) {
            setSnakeEffect({ ...effCfg, expiresAt: Date.now() + effCfg.duration });
          } else if (points > 0) {
            setSnakeEffect({ emissive: color, intensity: 0.6, type: "pulse", duration: 500, expiresAt: Date.now() + 500 });
          }
        }

        runStatsRef.current.totalEaten++;
        runStatsRef.current.fruitCounts[eatenFood.type] = (runStatsRef.current.fruitCounts[eatenFood.type] || 0) + 1;
        if (newCombo > runStatsRef.current.maxCombo) runStatsRef.current.maxCombo = newCombo;
        if (eatenFood.type === "star" || eatenFood.type === "aurora_shard" || eatenFood.type === "phoenix_feather" || eatenFood.type === "sea_star")
          runStatsRef.current.powerUpsUsed.star++;
        if (eatenFood.type === "shield") runStatsRef.current.powerUpsUsed.shield++;
        if (eatenFood.type === "magnet" || eatenFood.type === "scarab") runStatsRef.current.powerUpsUsed.magnet++;

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

        // Apply ice_resist passive to freeze-type fruits
        let effectiveSpeedMod = fruitStats.speedMod;
        if (iceResist && fruitStats.speedMod > 0) {
          effectiveSpeedMod = Math.floor(fruitStats.speedMod / 2);
        }

        const maxSpeed = difficulty === "HARD" ? 100 : 150;
        setSpeed(s => Math.max(maxSpeed, s + effectiveSpeedMod));

        const rawGrow = fruitStats.grow;
        const scaledGrow = rawGrow > 0 ? Math.max(1, Math.round(rawGrow * growthMult)) : rawGrow;

        if (scaledGrow > 0) addGrowth(scaledGrow - 1);
        else if (scaledGrow < 0) {
          const shrinkAmt = Math.abs(scaledGrow);
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

        // Spawn obstacles proportional to food eaten — world gets denser as you eat
        const obsPerFood = fruitStats.effect || fruitStats.grow >= 3 ? 2 : 1;
        spawnObstacleNear(newSnake, obsPerFood);

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
    spawnObstacleNear, character,
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
    dir, setDir, turnLeft, turnRight, isPaused, togglePause,
    isInvincible, hasShield, isMagnet,
    lives, level, combo,
    levelComplete, advanceLevel,
    activeEvent, snakeEffect,
    floatingScores, removeFloatingScore,
    runStats,
    isShaking,
    newAchievement, clearNewAchievement,
    unlockedAchievements,
  };
};

export default useSnakeGame;
