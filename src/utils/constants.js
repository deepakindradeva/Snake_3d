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
