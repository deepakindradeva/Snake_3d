// src/hooks/useWorld.js
import { useState, useCallback, useRef } from "react";
import {
  OBSTACLE_TYPES,
  getRandomFruit,
  getRandomPos,
} from "../utils/gameUtils";

const RENDER_DISTANCE = 25;

const useWorld = (cols, rows) => {
  const [obstacles, setObstacles] = useState([]);
  const [food, setFood] = useState({ x: 0, y: 0, type: "apple" });
  const obstaclesRef = useRef([]);

  // Initialize World
  const resetWorld = useCallback(
    (snakeHead) => {
      const initialObs = [];
      // Spawn 30 initial obstacles away from snake
      for (let i = 0; i < 30; i++) {
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
      setFood({ x: snakeHead.x + 10, y: snakeHead.y, type: "apple" });
    },
    [cols, rows],
  );

  // The "Infinite Window" Logic
  const updateWorld = useCallback(
    (snakeHead, snakeDir) => {
      // 1. Filter old obstacles (behind us)
      let currentObs = obstaclesRef.current.filter((o) => {
        const dx = Math.abs(o.x - snakeHead.x);
        const dy = Math.abs(o.y - snakeHead.y);
        return dx < RENDER_DISTANCE && dy < RENDER_DISTANCE;
      });

      // 2. Spawn new obstacles (ahead of us)
      if (Math.random() < 0.2) {
        // 20% chance
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
    [cols, rows],
  );

  const respawnFood = useCallback(
    (snakeHead) => {
      const nextType = getRandomFruit();
      // Spawn food roughly near the player
      const foodX = Math.min(
        Math.max(2, snakeHead.x + (Math.random() * 20 - 10)),
        cols - 2,
      );
      const foodY = Math.min(
        Math.max(2, snakeHead.y + (Math.random() * 20 - 10)),
        rows - 2,
      );
      setFood({ x: Math.floor(foodX), y: Math.floor(foodY), type: nextType });
    },
    [cols, rows],
  );

  return {
    obstacles,
    obstaclesRef,
    food,
    setFood,
    resetWorld,
    updateWorld,
    respawnFood,
  };
};

export default useWorld;
