// src/components/UI/FoodMarkers.js
import React from "react";
import { Html } from "@react-three/drei";

const FoodMarkers = ({ foods }) => {
  if (!foods || foods.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case "banana":
        return "🍌";
      case "cherry":
        return "🍒";
      case "ice":
        return "🧊";
      case "star":
        return "⭐";
      case "shield":
        return "🛡️";
      case "magnet":
        return "🧲";
      case "mushroom":
        return "🍄";
      default:
        return "🍎";
    }
  };

  return (
    <group>
      {foods.map((food) => (
        <group key={food.id} position={[food.x, 2.5, food.y]}>
          <Html center distanceFactor={15} zIndexRange={[100, 0]}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "20px",
                fontWeight: "bold",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                border: "2px solid white",
                backdropFilter: "blur(4px)",
                animation: "float 2s ease-in-out infinite",
                pointerEvents: "none", // Let clicks pass through
                whiteSpace: "nowrap",
              }}>
              {getIcon(food.type)}
            </div>
          </Html>
        </group>
      ))}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}
      </style>
    </group>
  );
};

export default FoodMarkers;
