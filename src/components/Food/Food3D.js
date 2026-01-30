// src/components/Food/Food3D.js
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- 1. FOOD GEOMETRIES ---

const Apple = () => (
  <group>
    <mesh position={[0, 0.4, 0]} castShadow>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color="#D32F2F" roughness={0.3} />
    </mesh>
    {/* Stem */}
    <mesh position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.3]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
  </group>
);

// 🍄 MUSHROOM (Red Cap, White Spots)
const Mushroom = () => (
  <group position={[0, 0.3, 0]}>
    {/* Stem */}
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 0.4]} />
      <meshStandardMaterial color="#FFF3E0" />
    </mesh>
    {/* Cap */}
    <mesh position={[0, 0.5, 0]}>
      <coneGeometry args={[0.5, 0.4, 16]} />
      <meshStandardMaterial color="#E53935" />
    </mesh>
    {/* Spots */}
    <mesh position={[0.2, 0.55, 0.2]}>
      <sphereGeometry args={[0.08]} />
      <meshStandardMaterial color="white" />
    </mesh>
    <mesh position={[-0.2, 0.6, -0.1]}>
      <sphereGeometry args={[0.08]} />
      <meshStandardMaterial color="white" />
    </mesh>
  </group>
);

// ⭐ STAR (Spinning Gold)
const Star = () => (
  <mesh position={[0, 0.5, 0]} castShadow>
    <dodecahedronGeometry args={[0.4, 0]} />
    <meshStandardMaterial
      color="#FFD700"
      emissive="#FFD700"
      emissiveIntensity={0.6}
      roughness={0.1}
      metalness={0.8}
    />
  </mesh>
);

// 🛡️ SHIELD (Blue Emblem)
const ShieldIcon = () => (
  <group position={[0, 0.5, 0]}>
    <mesh>
      <cylinderGeometry args={[0.4, 0.4, 0.1, 3]} /> {/* Triangle Shield */}
      <meshStandardMaterial color="#2979FF" metalness={0.5} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0, 0.06]}>
      <boxGeometry args={[0.4, 0.2, 0.05]} /> {/* Cross */}
      <meshStandardMaterial color="white" />
    </mesh>
    <mesh position={[0, 0, 0.06]}>
      <boxGeometry args={[0.15, 0.5, 0.05]} />
      <meshStandardMaterial color="white" />
    </mesh>
  </group>
);

// 🧲 MAGNET (U-Shape)
const Magnet = () => (
  <group position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
    {/* Red Tips */}
    <mesh position={[0, 0.25, 0]}>
      <boxGeometry args={[0.2, 0.3, 0.2]} />
      <meshStandardMaterial color="#D32F2F" />
    </mesh>
    <mesh position={[0, -0.25, 0]}>
      <boxGeometry args={[0.2, 0.3, 0.2]} />
      <meshStandardMaterial color="#D32F2F" />
    </mesh>
    {/* Grey Bar */}
    <mesh position={[-0.2, 0, 0]}>
      <boxGeometry args={[0.2, 0.8, 0.2]} />
      <meshStandardMaterial color="#B0BEC5" />
    </mesh>
  </group>
);

// --- 2. MAIN COMPONENT ---

const Food3D = ({ position, type }) => {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      // Rotation
      ref.current.rotation.y += 0.03;
      // Bobbing Up and Down
      ref.current.position.y =
        Math.sin(state.clock.elapsedTime * 4) * 0.15 + 0.2;
    }
  });

  // Determine light color based on type
  const getLightColor = () => {
    if (type === "star") return "#FFD700"; // Gold
    if (type === "ice") return "#00E5FF"; // Cyan
    if (type === "shield") return "#2979FF"; // Blue
    if (type === "magnet") return "#FF1744"; // Red
    return "#FFEB3B"; // Default Yellow warm light
  };

  return (
    <group position={[position.x, 0, position.y]}>
      {/* --- A. LIGHTING --- */}
      {/* Makes the food glow and light up the ground nearby */}
      <pointLight
        position={[0, 0.5, 0]}
        intensity={2}
        distance={8}
        decay={2}
        color={getLightColor()}
      />

      {/* --- B. BEACON BEAM --- */}
      {/* A tall, transparent cylinder reaching to the sky so you can see it from far away */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.05, 0.3, 20, 8]} />
        <meshBasicMaterial
          color={getLightColor()}
          transparent
          opacity={0.15}
          depthWrite={false} // Important: Prevents z-fighting with other transparent objects
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* --- C. THE FOOD MODEL --- */}
      <group ref={ref}>
        {/* Basic Fruits */}
        {(!type || type === "apple") && <Apple />}

        {type === "banana" && (
          <group scale={0.6}>
            <mesh>
              <sphereGeometry args={[0.4]} />
              <meshStandardMaterial color="#FFEB3B" roughness={0.2} />
            </mesh>
          </group>
        )}

        {type === "cherry" && (
          <group scale={0.6}>
            <mesh>
              <sphereGeometry args={[0.4]} />
              <meshStandardMaterial color="#880E4F" roughness={0.1} />
            </mesh>
          </group>
        )}

        {type === "ice" && (
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color="cyan"
              opacity={0.7}
              transparent
              roughness={0}
              metalness={0.9}
            />
          </mesh>
        )}

        {/* Special Items */}
        {type === "mushroom" && <Mushroom />}
        {type === "star" && <Star />}
        {type === "shield" && <ShieldIcon />}
        {type === "magnet" && <Magnet />}
      </group>
    </group>
  );
};

export default Food3D;
