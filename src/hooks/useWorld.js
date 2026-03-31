// src/hooks/useWorld.js
import { useState, useCallback, useRef } from "react";
import {
  getBiomeObstacleTypes,
  getRandomFruit,
  getRandomPos,
} from "../utils/gameUtils";
import { getLevelConfig, getBiome, BIOME_CONFIG } from "../utils/constants";

const MAX_FOOD_ITEMS = 6;

const useWorld = (cols, rows, difficulty) => {
  const [obstacles, setObstacles] = useState([]);
  const obstaclesRef = useRef([]);

  const [foods, setFoods] = useState([]);
  const foodsRef = useRef([]);

  const [portals, setPortals] = useState([]);
  const portalsRef = useRef([]);

  const [enemies, setEnemies] = useState([]);
  const enemiesRef = useRef([]);

  // Current biome ref so createFood can access it without re-creating
  const biomeRef = useRef("forest");

  const createFood = useCallback(
    (snakeBody, idOverride = null) => {
      const nextType = getRandomFruit(biomeRef.current);
      let foodX, foodY;
      let isOccupied = true;
      let attempts = 0;

      while (isOccupied && attempts < 100) {
        foodX = Math.floor(1 + Math.random() * (cols - 2));
        foodY = Math.floor(1 + Math.random() * (rows - 2));

        isOccupied = false;
        for (let obs of obstaclesRef.current) {
          if (obs.x === foodX && obs.y === foodY) { isOccupied = true; break; }
        }
        if (!isOccupied) {
          for (let segment of snakeBody) {
            if (segment.x === foodX && segment.y === foodY) { isOccupied = true; break; }
          }
        }
        attempts++;
      }

      return {
        x: foodX,
        y: foodY,
        type: nextType,
        id: idOverride || Date.now() + Math.random(),
      };
    },
    [cols, rows],
  );

  const resetWorld = useCallback(
    (initialSnake, level = 1) => {
      const biome = getBiome(level);
      biomeRef.current = biome;

      const biomeConfig = BIOME_CONFIG[biome] || BIOME_CONFIG.forest;
      const obstacleTypes = getBiomeObstacleTypes(biome);
      const enemyType = biomeConfig.enemyType || "spider";

      const config = getLevelConfig(level, difficulty);
      const obsCount = config.obstacles;

      const initialObs = [];
      const head = initialSnake[0];

      for (let i = 0; i < obsCount; i++) {
        let pos;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 100) {
          pos = getRandomPos(cols, rows);
          valid = true;
          if (Math.abs(pos.x - head.x) <= 5 && Math.abs(pos.y - head.y) <= 5) {
            valid = false;
          } else {
            for (let existing of initialObs) {
              if (existing.x === pos.x && existing.y === pos.y) { valid = false; break; }
            }
          }
          attempts++;
        }

        if (valid) {
          initialObs.push({
            ...pos,
            type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)],
            id: Date.now() + i,
            scale: 0.8 + Math.random() * 0.8,
          });
        }
      }
      setObstacles(initialObs);
      obstaclesRef.current = initialObs;

      const newPortals = [];
      for (let i = 0; i < 2; i++) {
        let pPos = getRandomPos(cols, rows);
        newPortals.push({ ...pPos, id: `portal-${i}` });
      }
      setPortals(newPortals);
      portalsRef.current = newPortals;

      const initialEnemies = [];
      const enemyCount = config.enemies;
      for (let i = 0; i < enemyCount; i++) {
        let pPos = getRandomPos(cols, rows);
        initialEnemies.push({ ...pPos, id: `enemy-${i}`, enemyType });
      }
      setEnemies(initialEnemies);
      enemiesRef.current = initialEnemies;

      const initialFoods = [];
      for (let i = 0; i < MAX_FOOD_ITEMS; i++) {
        initialFoods.push(createFood(initialSnake, `init-${i}`));
      }
      setFoods(initialFoods);
      foodsRef.current = initialFoods;
    },
    [cols, rows, difficulty, createFood],
  );

  const removeAndRespawnFood = useCallback(
    (eatenId, snakeBody) => {
      setFoods((prevFoods) => {
        const nextFoods = prevFoods.map((f) =>
          f.id === eatenId ? createFood(snakeBody, eatenId) : f
        );
        foodsRef.current = nextFoods;
        return nextFoods;
      });
    },
    [createFood],
  );

  const destroyObstacle = useCallback((id) => {
    setObstacles(prev => {
      const next = prev.filter(o => o.id !== id);
      obstaclesRef.current = next;
      return next;
    });
  }, []);

  const enemyTicksRef = useRef(0);

  const updateWorld = useCallback(
    (snakeHead, snakeDir) => {
      enemyTicksRef.current++;
      if (enemyTicksRef.current >= 4) {
        enemyTicksRef.current = 0;
        setEnemies(prev => {
          const next = prev.map(e => {
            let dx = Math.sign(snakeHead.x - e.x);
            let dy = Math.sign(snakeHead.y - e.y);

            let nx = e.x;
            let ny = e.y;
            if (Math.random() > 0.5) nx += dx;
            else ny += dy;

            if (nx < 0) nx = cols - 1; else if (nx >= cols) nx = 0;
            if (ny < 0) ny = rows - 1; else if (ny >= rows) ny = 0;

            let blocked = false;
            for (let obs of obstaclesRef.current) {
              if (obs.x === nx && obs.y === ny) { blocked = true; break; }
            }
            if (!blocked) return { ...e, x: nx, y: ny };
            return e;
          });
          enemiesRef.current = next;
          return next;
        });
      }
    },
    [cols, rows],
  );

  return {
    obstacles, obstaclesRef,
    foods, foodsRef,
    portals, portalsRef,
    enemies, enemiesRef,
    resetWorld, updateWorld,
    removeAndRespawnFood, destroyObstacle,
  };
};

export default useWorld;
