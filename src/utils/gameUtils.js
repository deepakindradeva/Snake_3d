// src/utils/gameUtils.js

export const MAP_SIZE = 60;

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Base forest fruit types (original set).
export const FRUIT_TYPES = [
  { type: "apple",    chance: 0.35, score: 1, speedMod: -5,  grow: 1 },
  { type: "banana",   chance: 0.15, score: 2, speedMod: -30, grow: 1 },
  { type: "cherry",   chance: 0.10, score: 5, speedMod: 0,   grow: 3 },
  { type: "ice",      chance: 0.10, score: 1, speedMod: 20,  grow: 1 },
  { type: "mushroom", chance: 0.10, score: 2, speedMod: 0,   grow: -3 },
  { type: "star",     chance: 0.05, score: 0, speedMod: 0,   grow: 0, effect: "invincible" },
  { type: "shield",   chance: 0.08, score: 0, speedMod: 0,   grow: 0, effect: "shield" },
  { type: "magnet",   chance: 0.07, score: 0, speedMod: 0,   grow: 0, effect: "magnet" },
];

// Biome-specific fruit types — same mechanics as FRUIT_TYPES, different theme.
export const BIOME_FRUIT_TYPES = {
  // ── Desert ────────────────────────────────────────────────────────────────
  date:         { type: "date",         chance: 0.32, score: 1, speedMod: -5,  grow: 1 },
  cactus_fruit: { type: "cactus_fruit", chance: 0.18, score: 5, speedMod: 0,   grow: 3 },
  mirage:       { type: "mirage",       chance: 0.12, score: 1, speedMod: 20,  grow: 1 },
  scarab:       { type: "scarab",       chance: 0.10, score: 0, speedMod: 0,   grow: 0, effect: "magnet" },
  // ── Arctic ────────────────────────────────────────────────────────────────
  snowberry:    { type: "snowberry",    chance: 0.30, score: 1, speedMod: -5,  grow: 1 },
  icicle:       { type: "icicle",       chance: 0.15, score: 1, speedMod: 20,  grow: 1 },
  aurora_shard: { type: "aurora_shard", chance: 0.08, score: 0, speedMod: 0,   grow: 0, effect: "invincible" },
  hot_cocoa:    { type: "hot_cocoa",    chance: 0.15, score: 2, speedMod: -30, grow: 1 },
  // ── Volcano ───────────────────────────────────────────────────────────────
  ember_fruit:     { type: "ember_fruit",     chance: 0.30, score: 1, speedMod: -5,  grow: 1 },
  magma_crystal:   { type: "magma_crystal",   chance: 0.12, score: 1, speedMod: 20,  grow: 1 },
  phoenix_feather: { type: "phoenix_feather", chance: 0.06, score: 0, speedMod: 0,   grow: 0, effect: "invincible" },
  brimstone:       { type: "brimstone",       chance: 0.10, score: 2, speedMod: 0,   grow: -3 },
  // ── Ocean ─────────────────────────────────────────────────────────────────
  sea_grape: { type: "sea_grape", chance: 0.30, score: 1, speedMod: -5,  grow: 1 },
  kelp:      { type: "kelp",      chance: 0.15, score: 2, speedMod: -30, grow: 1 },
  pearl:     { type: "pearl",     chance: 0.10, score: 5, speedMod: 0,   grow: 3 },
  sea_star:  { type: "sea_star",  chance: 0.08, score: 0, speedMod: 0,   grow: 0, effect: "invincible" },
};

// Merged lookup for useSnakeGame fruit stat resolution.
export const ALL_FRUIT_TYPES = [
  ...FRUIT_TYPES,
  ...Object.values(BIOME_FRUIT_TYPES),
];

export const OBSTACLE_TYPES = ["tree", "rock", "bush", "tree", "tree"];

export const getBiomeObstacleTypes = (biome) => {
  const map = {
    forest:  ["tree", "rock", "bush", "tree", "tree"],
    desert:  ["cactus", "dune", "skull", "cactus", "cactus"],
    arctic:  ["ice_spire", "snowdrift", "frozen_log", "ice_spire", "ice_spire"],
    volcano: ["lava_rock", "stalagmite", "ash_pillar", "lava_rock", "lava_rock"],
    ocean:   ["coral", "anemone", "shipwreck", "coral", "coral"],
  };
  return map[biome] || map.forest;
};

const BIOME_FRUIT_POOLS = {
  forest:  ["apple", "banana", "cherry", "ice", "mushroom", "star", "shield", "magnet"],
  desert:  ["date", "cactus_fruit", "mirage", "scarab", "shield", "star", "magnet"],
  arctic:  ["snowberry", "icicle", "aurora_shard", "hot_cocoa", "shield", "star", "magnet"],
  volcano: ["ember_fruit", "magma_crystal", "phoenix_feather", "brimstone", "shield", "star", "magnet"],
  ocean:   ["sea_grape", "kelp", "pearl", "sea_star", "shield", "star", "magnet"],
};

export const getRandomFruit = (biome = "forest") => {
  const pool = BIOME_FRUIT_POOLS[biome] || BIOME_FRUIT_POOLS.forest;
  const types = pool
    .map((t) => ALL_FRUIT_TYPES.find((f) => f.type === t))
    .filter(Boolean);
  const totalChance = types.reduce((s, f) => s + f.chance, 0);
  const r = Math.random() * totalChance;
  let accumulated = 0;
  for (const fruit of types) {
    accumulated += fruit.chance;
    if (r <= accumulated) return fruit.type;
  }
  return types[0].type;
};

export const getRandomPos = (cols, rows) => ({
  x: Math.floor(Math.random() * cols),
  y: Math.floor(Math.random() * rows),
});
