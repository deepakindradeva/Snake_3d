// src/components/Game/GameScene.js
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Preload } from "@react-three/drei";
import * as THREE from "three";

import CameraController from "./CameraController";
import Arena from "./Arena";
import Snake3D from "../Snake/Snake3D";
import Food3D from "../Food/Food3D";
import BiomeObstacles3D from "../Obstacle/BiomeObstacles3D";
import Portal3D from "../Obstacle/Portal3D";
import BiomeEnemy3D from "../Obstacle/BiomeEnemy3D";
import FoodEffects from "../Effects/FoodEffects";
import { getBiome, BIOME_CONFIG } from "../../utils/constants";

// --- DAY/NIGHT CYCLE ---
const DayNightCycle = ({ colors }) => {
  const lightRef = useRef();

  useFrame(({ clock, scene }) => {
    const time = clock.elapsedTime * 0.1;
    const intensity = Math.sin(time) * 0.5 + 0.5;

    const dayColor   = new THREE.Color(colors.day);
    const nightColor = new THREE.Color(colors.night);
    const current    = dayColor.clone().lerp(nightColor, 1 - intensity);

    scene.background  = current;
    scene.fog.color   = current;

    if (lightRef.current) {
      lightRef.current.intensity   = Math.max(0.2, intensity * 2.0);
      lightRef.current.position.y  = Math.sin(time) * 20;
      lightRef.current.position.x  = Math.cos(time) * 20;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        ref={lightRef}
        position={[10, 20, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[512, 512]}
      />
    </>
  );
};

// --- GAME LOOP ---
const GameLoop = ({ moveSnake, speed, isPaused, gameOver, levelComplete }) => {
  const accumulator = useRef(0);
  useFrame((_, delta) => {
    if (isPaused || gameOver || levelComplete) return;
    accumulator.current += delta * 1000;
    if (accumulator.current >= speed) {
      moveSnake();
      accumulator.current -= speed;
    }
  });
  return null;
};

// --- MAIN SCENE ---
const GameScene = ({
  snake, foods, obstacles, portals, enemies, effects, removeEffect,
  dir, cols, rows,
  isInvincible, hasShield, isMagnet,
  snakeEffect,
  character,
  moveSnake, speed, isPaused, gameOver, levelComplete,
  activeEvent, level = 1,
}) => {
  const isMobile = window.innerWidth < 768;

  const biome      = getBiome(level);
  const biomeCfg   = BIOME_CONFIG[biome] || BIOME_CONFIG.forest;

  return (
    <Canvas
      shadows={!isMobile}
      dpr={[1, isMobile ? 1 : 1.2]}
      performance={{ min: 0.5 }}
      gl={{ antialias: false, powerPreference: "default", preserveDrawingBuffer: false }}
    >
      <Suspense fallback={null}>
        <GameLoop
          moveSnake={moveSnake} speed={speed}
          isPaused={isPaused} gameOver={gameOver} levelComplete={levelComplete}
        />

        <CameraController snakeHead={snake[0]} dir={dir} />

        <DayNightCycle colors={biomeCfg} />
        <fog attach="fog" args={[biomeCfg.day, biomeCfg.fogNear ?? 12, biomeCfg.fogFar ?? 40]} />
        <Environment preset={biomeCfg.envPreset} />

        <Arena width={cols} height={rows} biome={biome} />

        <Snake3D
          snake={snake}
          isInvincible={isInvincible}
          hasShield={hasShield}
          isMagnet={isMagnet}
          snakeEffect={snakeEffect}
          character={character}
        />

        {foods.map((f) => (
          <Food3D key={f.id} position={f} type={f.type} />
        ))}

        {portals && portals.map((p) => (
          <Portal3D key={p.id} position={p} />
        ))}

        {enemies && enemies.map((e) => (
          <BiomeEnemy3D key={e.id} position={e} enemyType={e.enemyType || biomeCfg.enemyType || "spider"} />
        ))}

        <FoodEffects effects={effects} removeEffect={removeEffect} />

        <BiomeObstacles3D obstacles={obstacles} biome={biome} />

        {!isMobile && (
          <ContactShadows
            resolution={256}
            scale={40}
            blur={1.5}
            opacity={0.3}
            far={3}
            frames={1}
            color={biomeCfg.shadowColor || "#2E7D32"}
          />
        )}

        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default GameScene;
