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
    (snakeBody, idOverride = null) => {
      const nextType = getRandomFruit();
      let foodX, foodY;
      let isOccupied = true;
      let attempts = 0;

      while (isOccupied && attempts < 100) {
        foodX = Math.floor(1 + Math.random() * (cols - 2));
        foodY = Math.floor(1 + Math.random() * (rows - 2));

        isOccupied = false;
        for (let obs of obstaclesRef.current) {
          if (obs.x === foodX && obs.y === foodY) {
            isOccupied = true;
            break;
          }
        }
        if (!isOccupied) {
          for (let segment of snakeBody) {
            if (segment.x === foodX && segment.y === foodY) {
              isOccupied = true;
              break;
            }
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
    (initialSnake) => {
      let obsCount = 40;
      if (difficulty === "EASY") obsCount = 20;
      if (difficulty === "HARD") obsCount = 80;

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
              if (existing.x === pos.x && existing.y === pos.y) {
                valid = false;
                break;
              }
            }
          }
          attempts++;
        }

        if (valid) {
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
        initialFoods.push(createFood(initialSnake, `init-${i}`));
      }
      setFoods(initialFoods);
      foodsRef.current = initialFoods;
    },
    [cols, rows, difficulty, createFood],
  ); // FIX: Added createFood to deps

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
  ); // FIX: Added createFood to deps

  const updateWorld = useCallback(
    (snakeHead, snakeDir) => {
      // Obstacles are static on the wrapping map; no updates needed.
    },
    [],
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
