// src/hooks/useWorld.js
import { useState, useCallback, useRef } from "react";
import {
  OBSTACLE_TYPES,
  getRandomFruit,
  getRandomPos,
} from "../utils/gameUtils";

const RENDER_DISTANCE = 25;
const MAX_FOOD_ITEMS = 6;

const useWorld = (cols, rows, difficulty) => {
  const [obstacles, setObstacles] = useState([]);
  const obstaclesRef = useRef([]);

  const [foods, setFoods] = useState([]);
  const foodsRef = useRef([]);

  // FIX: Wrapped in useCallback to satisfy linter
  const createFood = useCallback(
    (snakeHead, idOverride = null) => {
      const nextType = getRandomFruit();
      const range = 25;
      const foodX = Math.min(
        Math.max(2, snakeHead.x + (Math.random() * range * 2 - range)),
        cols - 2,
      );
      const foodY = Math.min(
        Math.max(2, snakeHead.y + (Math.random() * range * 2 - range)),
        rows - 2,
      );
      return {
        x: Math.floor(foodX),
        y: Math.floor(foodY),
        type: nextType,
        id: idOverride || Date.now() + Math.random(),
      };
    },
    [cols, rows],
  );

  const resetWorld = useCallback(
    (snakeHead) => {
      let obsCount = 20;
      if (difficulty === "EASY") obsCount = 10;
      if (difficulty === "HARD") obsCount = 50;

      const initialObs = [];
      for (let i = 0; i < obsCount; i++) {
        const pos = getRandomPos(cols, rows);
        if (
          Math.abs(pos.x - snakeHead.x) > 5 ||
          Math.abs(pos.y - snakeHead.y) > 5
        ) {
          initialObs.push({
            ...pos,
            type: OBSTACLE_TYPES[
              Math.floor(Math.random() * OBSTACLE_TYPES.length)
            ],
            id: Date.now() + i,
            scale: 0.8 + Math.random() * 0.8,
          });
        }
      }
      setObstacles(initialObs);
      obstaclesRef.current = initialObs;

      const initialFoods = [];
      for (let i = 0; i < MAX_FOOD_ITEMS; i++) {
        initialFoods.push(createFood(snakeHead, `init-${i}`));
      }
      setFoods(initialFoods);
      foodsRef.current = initialFoods;
    },
    [cols, rows, difficulty, createFood],
  ); // FIX: Added createFood to deps

  const removeAndRespawnFood = useCallback(
    (eatenId, snakeHead) => {
      setFoods((prevFoods) => {
        const filtered = prevFoods.filter((f) => f.id !== eatenId);
        const newFood = createFood(snakeHead);
        const nextFoods = [...filtered, newFood];
        foodsRef.current = nextFoods;
        return nextFoods;
      });
    },
    [createFood],
  ); // FIX: Added createFood to deps

  const updateWorld = useCallback(
    (snakeHead, snakeDir) => {
      let spawnChance = 0.2;
      if (difficulty === "EASY") spawnChance = 0.1;
      if (difficulty === "HARD") spawnChance = 0.4;

      let currentObs = obstaclesRef.current.filter((o) => {
        const dx = Math.abs(o.x - snakeHead.x);
        const dy = Math.abs(o.y - snakeHead.y);
        return dx < RENDER_DISTANCE && dy < RENDER_DISTANCE;
      });

      if (Math.random() < spawnChance) {
        const spawnDist = 15 + Math.floor(Math.random() * 10);
        const spawnX =
          snakeHead.x +
          snakeDir.x * spawnDist +
          (Math.floor(Math.random() * 10) - 5);
        const spawnY =
          snakeHead.y +
          snakeDir.y * spawnDist +
          (Math.floor(Math.random() * 10) - 5);

        if (spawnX > 0 && spawnX < cols && spawnY > 0 && spawnY < rows) {
          const isStacking = currentObs.some(
            (o) => o.x === spawnX && o.y === spawnY,
          );
          if (!isStacking) {
            currentObs.push({
              x: spawnX,
              y: spawnY,
              type: OBSTACLE_TYPES[
                Math.floor(Math.random() * OBSTACLE_TYPES.length)
              ],
              id: Date.now(),
              scale: 0.8 + Math.random() * 0.8,
            });
          }
        }
      }

      if (currentObs.length !== obstaclesRef.current.length) {
        setObstacles(currentObs);
        obstaclesRef.current = currentObs;
      }
    },
    [cols, rows, difficulty],
  );

  return {
    obstacles,
    obstaclesRef,
    foods,
    foodsRef,
    resetWorld,
    updateWorld,
    removeAndRespawnFood,
  };
};

export default useWorld;
