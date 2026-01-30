// src/components/Effects/FoodEffects.js
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Re-usable geometry/material to save performance
const particleGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const particleMat = new THREE.MeshBasicMaterial({
  color: "#FFF",
  transparent: true,
});

const SingleEffect = ({ position, color, onComplete }) => {
  const group = useRef();

  // Create random velocities for particles
  const particles = useMemo(() => {
    return new Array(8).fill(0).map(() => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 10, // Explode outward X
        (Math.random() - 0.5) * 10, // Explode outward Y
        (Math.random() - 0.5) * 10, // Explode outward Z
      ),
      offset: new THREE.Vector3(0, 0, 0),
      scale: 1,
    }));
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    let allDone = true;

    // Animate each particle
    group.current.children.forEach((mesh, i) => {
      const p = particles[i];

      // Move particle
      p.offset.addScaledVector(p.velocity, delta);
      mesh.position.copy(p.offset);

      // Apply Gravity/Drag
      p.velocity.y -= delta * 5; // Gravity
      p.velocity.multiplyScalar(0.95); // Friction

      // Shrink
      p.scale -= delta * 2;
      if (p.scale > 0) {
        mesh.scale.setScalar(p.scale);
        allDone = false;
      } else {
        mesh.scale.setScalar(0);
      }
    });

    // Remove effect when animation is done
    if (allDone && onComplete) {
      onComplete();
    }
  });

  return (
    <group position={[position.x, 0.5, position.y]} ref={group}>
      {particles.map((_, i) => (
        <mesh key={i} geometry={particleGeo} material={particleMat}>
          {/* Tint the particles based on food type color */}
          <meshBasicMaterial color={color} transparent />
        </mesh>
      ))}
    </group>
  );
};

const FoodEffects = ({ effects, removeEffect }) => {
  return (
    <>
      {effects.map((effect) => (
        <SingleEffect
          key={effect.id}
          position={effect}
          color={effect.color}
          onComplete={() => removeEffect(effect.id)}
        />
      ))}
    </>
  );
};

export default FoodEffects;
