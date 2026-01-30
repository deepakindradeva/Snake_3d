// src/components/Game/GameScene.js
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";

// Game Components
import CameraController from "./CameraController";
import Arena from "./Arena";
import Snake3D from "../Snake/Snake3D";
import Food3D from "../Food/Food3D";
import Obstacles3D from "../Obstacle/Obstacles3D";
import FoodEffects from "../Effects/FoodEffects";

// --- INTERNAL COMPONENT: SYNCED GAME LOOP ---
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

// --- MAIN SCENE COMPONENT ---
const GameScene = ({
  snake,
  foods,
  obstacles,
  effects,
  removeEffect,
  dir,
  cols,
  rows,
  isInvincible,
  hasShield,
  isMagnet,
  cameraMode,
  moveSnake,
  speed,
  isPaused,
  gameOver,
}) => {
  const isMobile = window.innerWidth < 768;

  return (
    <Canvas
      shadows={!isMobile}
      dpr={[1, 1.5]}
      performance={{ min: 0.1 }}
      gl={{
        antialias: false,
        powerPreference: "default",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          console.log("Context lost! Attempting restore...");
        });
      }}>
      {/* 1. THE GAME LOOP */}
      <GameLoop
        moveSnake={moveSnake}
        speed={speed}
        isPaused={isPaused}
        gameOver={gameOver}
      />

      {/* 2. CAMERA */}
      <CameraController snakeHead={snake[0]} dir={dir} mode={cameraMode} />

      {/* 3. LIGHTING & ENV */}
      <color attach="background" args={["#80DEEA"]} />
      <fog attach="fog" args={["#80DEEA", 12, 40]} />

      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.5}
        castShadow={!isMobile}
        shadow-mapSize={[512, 512]}
      />
      <Environment preset="park" />

      {/* 4. WORLD OBJECTS */}
      <Arena width={cols} height={rows} />

      {/* REMOVED: PathGuides (The lines are gone) */}

      <Snake3D
        snake={snake}
        isInvincible={isInvincible}
        hasShield={hasShield}
        isMagnet={isMagnet}
      />

      {/* Render Multiple Foods */}
      {foods.map((foodItem) => (
        <Food3D key={foodItem.id} position={foodItem} type={foodItem.type} />
      ))}

      {/* Particle Effects */}
      <FoodEffects effects={effects} removeEffect={removeEffect} />

      <Obstacles3D obstacles={obstacles} />

      {/* Shadows on the floor */}
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
