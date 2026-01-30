// src/components/UI/PathGuides.js
import React from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

const PathGuides = ({ snakeHead, foods }) => {
  // Don't render if there's no snake head or no food
  if (!snakeHead || !foods || foods.length === 0) return null;

  // Helper to match path color to food type
  const getPathColor = (type) => {
    switch (type) {
      case "banana":
        return "#FFEB3B";
      case "cherry":
        return "#880E4F";
      case "ice":
        return "#00B0FF";
      case "star":
        return "#FFD700";
      case "shield":
        return "#2979FF";
      case "magnet":
        return "#FF1744";
      default:
        return "#D32F2F"; // Apple red
    }
  };

  return (
    // Raise slightly above the ground (y=0.08) to avoid Z-fighting with the floor
    <group position={[0, 0.08, 0]}>
      {foods.map((food) => {
        // Define start (snake head) and end (food) points
        const points = [
          new THREE.Vector3(snakeHead.x, 0, snakeHead.y),
          new THREE.Vector3(food.x, 0, food.y),
        ];
        const color = getPathColor(food.type);

        return (
          <Line
            key={food.id}
            points={points}
            color={color}
            opacity={0.25} // Very subtle transparency
            transparent
            lineWidth={2}
            dashed={true} // Make it a dashed line
            dashScale={10} // Controls the size of dashes and gaps
            dashSize={0.5}
            gapSize={0.5}
          />
        );
      })}
    </group>
  );
};

export default PathGuides;
