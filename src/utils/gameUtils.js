// src/utils/gameUtils.js

/**
 * Game Configuration & Utility Functions
 * Contains the core balancing stat blocks and global constants for the game engine.
 */

export const MAP_SIZE = 60;

/**
 * Standard directional vectors for computing the upcoming snake body movements.
 */
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

/**
 * Loot Table for Consumables
 * Controls spawn probabilities, point values, tail growth scaling, and special power-ups natively.
 * 
 * @property {number} chance - The probability (0.0 to 1.0) of spawning this fruit
 * @property {number} score - Base score value (before combo multipliers)
 * @property {number} speedMod - How much this fruit modifies the engine tick speed (- lowers interval, making it faster)
 * @property {number} grow - How many segments to add to the snake tail (negative values shrink)
 * @property {string} effect - Special string identifier for handling unique buffs in useSnakeGame.js
 */
export const FRUIT_TYPES = [
  { type: "apple", chance: 0.35, score: 1, speedMod: -5, grow: 1 },
  { type: "banana", chance: 0.15, score: 2, speedMod: -30, grow: 1 },
  { type: "cherry", chance: 0.1, score: 5, speedMod: 0, grow: 3 },
  { type: "ice", chance: 0.1, score: 1, speedMod: 20, grow: 1 },
  { type: "mushroom", chance: 0.1, score: 2, speedMod: 0, grow: -3 },
  {
    type: "star",
    chance: 0.05,
    score: 0,
    speedMod: 0,
    grow: 0,
    effect: "invincible",
  },
  {
    type: "shield",
    chance: 0.08,
    score: 0,
    speedMod: 0,
    grow: 0,
    effect: "shield",
  },
  {
    type: "magnet",
    chance: 0.07,
    score: 0,
    speedMod: 0,
    grow: 0,
    effect: "magnet",
  },
];

export const OBSTACLE_TYPES = ["tree", "rock", "bush", "tree", "tree"];

export const getRandomFruit = () => {
  const r = Math.random();
  let accumulated = 0;
  for (let fruit of FRUIT_TYPES) {
    accumulated += fruit.chance;
    if (r <= accumulated) return fruit.type;
  }
  return "apple";
};

// Returns a random position within bounds
export const getRandomPos = (cols, rows) => ({
  x: Math.floor(Math.random() * cols),
  y: Math.floor(Math.random() * rows),
});
