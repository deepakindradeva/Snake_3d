// src/components/Game/GameScene.js
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

import CameraController from "./CameraController";
import Arena from "./Arena";
import Snake3D from "../Snake/Snake3D";
import Food3D from "../Food/Food3D";
import Obstacles3D from "../Obstacle/Obstacles3D";
import Portal3D from "../Obstacle/Portal3D";
import Enemy3D from "../Obstacle/Enemy3D";
import FoodEffects from "../Effects/FoodEffects";

// --- DAY/NIGHT CYCLE ---
const DayNightCycle = ({ colors }) => {
  const lightRef = useRef();
  
  useFrame(({ clock, scene }) => {
    const time = clock.elapsedTime * 0.1; // Slow wave
    const intensity = Math.sin(time) * 0.5 + 0.5; // 0 to 1

    const dayColor = new THREE.Color(colors.day);
    const nightColor = new THREE.Color(colors.night);
    const currentColor = dayColor.clone().lerp(nightColor, 1 - intensity);
    
    scene.background = currentColor;
    scene.fog.color = currentColor;

    if (lightRef.current) {
        lightRef.current.intensity = Math.max(0.2, intensity * 2.0);
        lightRef.current.position.y = Math.sin(time) * 20;
        lightRef.current.position.x = Math.cos(time) * 20;
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
const GameLoop = ({ moveSnake, speed, isPaused, gameOver }) => {
  const accumulator = useRef(0);
  useFrame((state, delta) => {
    if (isPaused || gameOver) return;
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
  snake,
  foods,
  obstacles,
  portals,
  enemies,
  effects,
  removeEffect,
  dir,
  cols,
  rows,
  isInvincible,
  hasShield,
  isMagnet,
  skin,
  cameraMode,
  moveSnake,
  speed,
  isPaused,
  gameOver,
  activeEvent,
  level = 1,
}) => {
  const isMobile = window.innerWidth < 768;

  const themeColors = React.useMemo(() => {
        if (level % 3 === 1) return { day: "#80DEEA", night: "#1A237E", c1: "#66BB6A", c2: "#43A047", env: "park" };
        if (level % 3 === 2) return { day: "#FFB74D", night: "#5D4037", c1: "#FFCC80", c2: "#FFA726", env: "sunset" };
        if (level % 3 === 0) return { day: "#ECEFF1", night: "#455A64", c1: "#E0F7FA", c2: "#B2EBF2", env: "dawn" };
  }, [level]);

  return (
    <Canvas
      shadows={!isMobile}
      dpr={[1, 1.5]}
      performance={{ min: 0.1 }}
      gl={{
        antialias: false,
        powerPreference: "default",
        preserveDrawingBuffer: false,
      }}>
      <GameLoop
        moveSnake={moveSnake}
        speed={speed}
        isPaused={isPaused}
        gameOver={gameOver}
      />

      <CameraController snakeHead={snake[0]} dir={dir} />

      <DayNightCycle colors={themeColors} />
      <fog attach="fog" args={[themeColors.day, 12, 40]} />
      <Environment preset={themeColors.env} />

      {/* REVERTED: Just pass width/height. No snakeHead prop. */}
      <Arena width={cols} height={rows} color1={themeColors.c1} color2={themeColors.c2} />

      <Snake3D
        snake={snake}
        isInvincible={isInvincible}
        hasShield={hasShield}
        isMagnet={isMagnet}
        skin={skin}
      />

      {foods.map((foodItem) => (
        <Food3D key={foodItem.id} position={foodItem} type={foodItem.type} />
      ))}

      {portals && portals.map((p) => (
        <Portal3D key={p.id} position={p} />
      ))}

      {enemies && enemies.map((e) => (
        <Enemy3D key={e.id} position={e} />
      ))}

      <FoodEffects effects={effects} removeEffect={removeEffect} />

      <Obstacles3D obstacles={obstacles} />

      <ContactShadows
        resolution={512}
        scale={50}
        blur={2}
        opacity={0.4}
        far={3}
        color="#2E7D32"
      />
    </Canvas>
  );
};

export default GameScene;
