// src/utils/constants.js
export const CELL_SIZE = 25; // Size of each box in pixels
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const OBSTACLE_COUNT = 15; // How many walls to spawn

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Cumulative score needed to complete level N.
// Level 1: 200, Level 2: 500, Level 3: 900, Level 4: 1400 …
// Formula: 50 * level * (level + 3)
export const getLevelTarget = (level) => 5 * level * (level + 3);

// Returns world-config values that scale with level and difficulty.
export const getLevelConfig = (level, difficulty) => {
  const baseSpeed   = difficulty === "HARD" ? 150 : difficulty === "EASY" ? 350 : 250;
  const minSpeed    = difficulty === "HARD" ? 100 : 150;
  const baseObs     = difficulty === "EASY" ? 20  : difficulty === "HARD" ? 80  : 40;
  const baseEnemies = difficulty === "EASY" ? 0   : difficulty === "HARD" ? 3   : 1;
  return {
    speed:       Math.max(minSpeed, baseSpeed - (level - 1) * 15),
    obstacles:   Math.min(120,      baseObs   + (level - 1) * 5),
    enemies:     Math.min(8,        baseEnemies + Math.floor((level - 1) / 2)),
    scoreTarget: getLevelTarget(level),
  };
};
