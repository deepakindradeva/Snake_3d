// src/hooks/useSnake.js
import { useState, useCallback, useRef } from "react";
import { DIRECTIONS } from "../utils/gameUtils";

const useSnake = (cols, rows) => {
  const [snake, setSnake] = useState([]);
  const [dir, setDir] = useState(DIRECTIONS.RIGHT);

  // CHANGE: growthBank is now a Ref.
  // This is crucial. It allows us to track growth WITHOUT triggering
  // a re-render of the 'moveSnake' function in the parent hook.
  const growthBankRef = useRef(0);

  const dirRef = useRef(DIRECTIONS.RIGHT);

  const resetSnake = useCallback(() => {
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    setSnake(
      Array.from({ length: 5 }, (_, i) => ({ x: startX - i, y: startY })),
    );
    setDir(DIRECTIONS.RIGHT);
    dirRef.current = DIRECTIONS.RIGHT;
    growthBankRef.current = 0; // Reset ref
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

  // Helper to add growth safely
  const addGrowth = useCallback((amount) => {
    growthBankRef.current += amount;
  }, []);

  return {
    snake,
    setSnake,
    dir,
    setDir,
    dirRef,
    growthBankRef, // Export Ref instead of state
    addGrowth, // Export helper
    resetSnake,
    turnLeft,
    turnRight,
  };
};

export default useSnake;
