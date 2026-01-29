// src/hooks/useSnake.js
import { useState, useCallback, useRef } from "react";
import { DIRECTIONS } from "../utils/gameUtils";

const useSnake = (cols, rows) => {
  const [snake, setSnake] = useState([]);
  const [dir, setDir] = useState(DIRECTIONS.RIGHT);
  const [growthBank, setGrowthBank] = useState(0);

  // Use ref for direction to avoid closure staleness in event listeners
  const dirRef = useRef(DIRECTIONS.RIGHT);

  const resetSnake = useCallback(() => {
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    setSnake(
      Array.from({ length: 5 }, (_, i) => ({ x: startX - i, y: startY })),
    );
    setDir(DIRECTIONS.RIGHT);
    dirRef.current = DIRECTIONS.RIGHT;
    setGrowthBank(0);
  }, [cols, rows]);

  const turnLeft = useCallback(() => {
    const newDir = { x: dirRef.current.y, y: -dirRef.current.x };
    setDir(newDir);
    dirRef.current = newDir;
  }, []);

  const turnRight = useCallback(() => {
    const newDir = { x: -dirRef.current.y, y: dirRef.current.x };
    setDir(newDir);
    dirRef.current = newDir;
  }, []);

  return {
    snake,
    setSnake,
    dir,
    setDir,
    dirRef,
    growthBank,
    setGrowthBank,
    resetSnake,
    turnLeft,
    turnRight,
  };
};

export default useSnake;
