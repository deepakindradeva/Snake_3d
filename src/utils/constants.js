// src/utils/constants.js
export const CELL_SIZE = 25;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const OBSTACLE_COUNT = 15;

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Cumulative score needed to complete level N.
export const getLevelTarget = (level) => 5 * level * (level + 1);

// Returns world-config values that scale with level and difficulty.
export const getLevelConfig = (level, difficulty) => {
  const baseSpeed   = difficulty === "HARD" ? 150 : difficulty === "EASY" ? 350 : 250;
  const minSpeed    = difficulty === "HARD" ? 100 : 150;
  const baseObs     = difficulty === "EASY" ? 50  : difficulty === "HARD" ? 120 : 80;
  const baseEnemies = difficulty === "EASY" ? 0   : difficulty === "HARD" ? 4   : 2;
  return {
    speed:       Math.max(minSpeed, baseSpeed - (level - 1) * 15),
    obstacles:   Math.min(180,      baseObs   + (level - 1) * 8),
    enemies:     Math.min(15,       baseEnemies + Math.floor((level - 1) / 2)),
    scoreTarget: getLevelTarget(level),
  };
};

// Returns the biome name for a given level.
export const getBiome = (level) => {
  if (level <= 4)  return "forest";
  if (level <= 8)  return "desert";
  if (level <= 12) return "arctic";
  if (level <= 16) return "volcano";
  return "ocean";
};

// Per-biome theming config: visuals, obstacle types, enemy type, fruit pool.
export const BIOME_CONFIG = {
  forest: {
    name: "Forest",
    day: "#80DEEA",
    night: "#1A237E",
    floorColor1: "#66BB6A",
    floorColor2: "#43A047",
    floorRoughness: 0.8,
    fogNear: 12,
    fogFar: 40,
    envPreset: "park",
    obstacleTypes: ["tree", "tree", "tree", "tree", "rock", "bush", "tree"],
    enemyType: "spider",
    fruitPool: ["apple", "banana", "cherry", "ice", "mushroom", "star", "shield", "magnet"],
    shadowColor: "#2E7D32",
  },
  desert: {
    name: "Desert",
    day: "#FFB74D",
    night: "#4E342E",
    floorColor1: "#FFCC80",
    floorColor2: "#FFA726",
    floorRoughness: 1.0,
    fogNear: 14,
    fogFar: 45,
    envPreset: "sunset",
    obstacleTypes: ["cactus", "dune", "skull", "cactus", "cactus"],
    enemyType: "scorpion",
    fruitPool: ["date", "cactus_fruit", "mirage", "scarab", "shield", "star", "magnet"],
    shadowColor: "#E65100",
  },
  arctic: {
    name: "Arctic",
    day: "#E3F2FD",
    night: "#283593",
    floorColor1: "#ECEFF1",
    floorColor2: "#B0BEC5",
    floorRoughness: 0.3,
    fogNear: 10,
    fogFar: 35,
    envPreset: "dawn",
    obstacleTypes: ["ice_spire", "snowdrift", "frozen_log", "ice_spire", "ice_spire"],
    enemyType: "wolf",
    fruitPool: ["snowberry", "icicle", "aurora_shard", "hot_cocoa", "shield", "star", "magnet"],
    shadowColor: "#37474F",
  },
  volcano: {
    name: "Volcano",
    day: "#FF7043",
    night: "#1A0000",
    floorColor1: "#4E342E",
    floorColor2: "#3E2723",
    floorRoughness: 1.0,
    fogNear: 10,
    fogFar: 32,
    envPreset: "sunset",
    obstacleTypes: ["lava_rock", "stalagmite", "ash_pillar", "lava_rock", "lava_rock"],
    enemyType: "fire_sprite",
    fruitPool: ["ember_fruit", "magma_crystal", "phoenix_feather", "brimstone", "shield", "star", "magnet"],
    shadowColor: "#BF360C",
  },
  ocean: {
    name: "Ocean",
    day: "#29B6F6",
    night: "#0D47A1",
    floorColor1: "#0288D1",
    floorColor2: "#01579B",
    floorRoughness: 0.4,
    fogNear: 12,
    fogFar: 38,
    envPreset: "dawn",
    obstacleTypes: ["coral", "anemone", "shipwreck", "coral", "coral"],
    enemyType: "jellyfish",
    fruitPool: ["sea_grape", "kelp", "pearl", "sea_star", "shield", "star", "magnet"],
    shadowColor: "#01579B",
  },
};
