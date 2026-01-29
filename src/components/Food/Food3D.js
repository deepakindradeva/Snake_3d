// src/components/Food/Food3D.js
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// ... (Keep Apple, Banana, Cherry, IceCube exactly as they were) ...
const Apple = () => (
  <group>
    {" "}
    <mesh position={[0, 0.4, 0]} castShadow>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color="#D32F2F" />
    </mesh>{" "}
  </group>
);
// ... (Shortened for brevity, use your existing code for older fruits) ...

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
      {" "}
      <sphereGeometry args={[0.08]} />{" "}
      <meshStandardMaterial color="white" />{" "}
    </mesh>
    <mesh position={[-0.2, 0.6, -0.1]}>
      {" "}
      <sphereGeometry args={[0.08]} />{" "}
      <meshStandardMaterial color="white" />{" "}
    </mesh>
  </group>
);

// ⭐ STAR (Spinning Gold)
const Star = () => (
  <mesh position={[0, 0.5, 0]} castShadow>
    <dodecahedronGeometry args={[0.4, 0]} /> {/* Simplified star shape */}
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
      {" "}
      <boxGeometry args={[0.2, 0.3, 0.2]} />{" "}
      <meshStandardMaterial color="#D32F2F" />{" "}
    </mesh>
    <mesh position={[0, -0.25, 0]}>
      {" "}
      <boxGeometry args={[0.2, 0.3, 0.2]} />{" "}
      <meshStandardMaterial color="#D32F2F" />{" "}
    </mesh>
    {/* Grey Bar */}
    <mesh position={[-0.2, 0, 0]}>
      {" "}
      <boxGeometry args={[0.2, 0.8, 0.2]} />{" "}
      <meshStandardMaterial color="#B0BEC5" />{" "}
    </mesh>
  </group>
);

const Food3D = ({ position, type }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.03;
      ref.current.position.y =
        Math.sin(state.clock.elapsedTime * 4) * 0.15 + 0.2;
    }
  });

  return (
    <group position={[position.x, 0, position.y]} ref={ref}>
      {/* Basic */}
      {(!type || type === "apple") && <Apple />}
      {type === "banana" && (
        <group scale={0.6}>
          <mesh>
            <sphereGeometry args={[0.4]} />
            <meshStandardMaterial color="yellow" />
          </mesh>
        </group>
      )}{" "}
      {/* Placeholder reuse */}
      {type === "cherry" && (
        <group scale={0.6}>
          <mesh>
            <sphereGeometry args={[0.4]} />
            <meshStandardMaterial color="purple" />
          </mesh>
        </group>
      )}
      {type === "ice" && (
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="cyan" opacity={0.6} transparent />
        </mesh>
      )}
      {/* New */}
      {type === "mushroom" && <Mushroom />}
      {type === "star" && <Star />}
      {type === "shield" && <ShieldIcon />}
      {type === "magnet" && <Magnet />}
    </group>
  );
};

export default Food3D;
