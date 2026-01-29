// src/components/Game/GameScene.js
import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";

import CameraController from "./CameraController";
import Arena from "./Arena";
import Snake3D from "../Snake/Snake3D";
import Food3D from "../Food/Food3D";
import Obstacles3D from "../Obstacle/Obstacles3D";

// FIX: Added 'cameraMode' to this list
const GameScene = ({
  snake,
  food,
  obstacles,
  dir,
  cols,
  rows,
  isInvincible,
  hasShield,
  isMagnet,
  cameraMode,
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
      {/* FIX: Pass 'cameraMode' prop to the controller */}
      <CameraController snakeHead={snake[0]} dir={dir} mode={cameraMode} />

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

      <Arena width={cols} height={rows} />

      <Snake3D
        snake={snake}
        isInvincible={isInvincible}
        hasShield={hasShield}
        isMagnet={isMagnet}
      />

      <Food3D position={food} type={food.type} />
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
