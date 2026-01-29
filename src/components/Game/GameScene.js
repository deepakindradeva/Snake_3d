// src/components/Game/GameScene.js
import React from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";

import CameraController from "./CameraController";
import Arena from "./Arena";
import Snake3D from "../Snake/Snake3D";
import Food3D from "../Food/Food3D";
import Obstacles3D from "../Obstacle/Obstacles3D";

const GameScene = ({
  snake,
  food,
  obstacles,
  dir,
  cols,
  rows,
  isInvincible,
}) => {
  return (
    <Canvas shadows dpr={[1, 2]} performance={{ min: 0.5 }}>
      <CameraController snakeHead={snake[0]} dir={dir} />

      <color attach="background" args={["#80DEEA"]} />
      <fog attach="fog" args={["#80DEEA", 12, 40]} />

      <ambientLight intensity={0.7} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Environment preset="park" />

      <Arena width={cols} height={rows} />
      <Snake3D snake={snake} isInvincible={isInvincible} />
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
