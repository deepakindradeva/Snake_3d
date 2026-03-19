import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SpiderCreature = () => (
  <group>
    {/* Abdomen */}
    <mesh position={[0, 0.3, -0.2]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
    </mesh>
    {/* Thorax/Head */}
    <mesh position={[0, 0.2, 0.15]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#222" roughness={0.7} />
    </mesh>
    
    {/* Glowing Red Eyes */}
    <mesh position={[0.08, 0.28, 0.3]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
    </mesh>
    <mesh position={[-0.08, 0.28, 0.3]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
    </mesh>

    {/* 8 Legs */}
    {[...Array(4)].map((_, i) => (
        <group key={`leg-r-${i}`} position={[0.15, 0.2, 0.1 - i * 0.12]} rotation={[0, 0, -Math.PI / 3]}>
            <mesh position={[0.2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.01, 0.5]} />
                <meshStandardMaterial color="#111" />
            </mesh>
        </group>
    ))}
    {[...Array(4)].map((_, i) => (
        <group key={`leg-l-${i}`} position={[-0.15, 0.2, 0.1 - i * 0.12]} rotation={[0, 0, Math.PI / 3]}>
            <mesh position={[-0.2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.01, 0.5]} />
                <meshStandardMaterial color="#111" />
            </mesh>
        </group>
    ))}
  </group>
);

const Enemy3D = ({ position }) => {
  const ref = useRef();
  
  useFrame((state, delta) => {
    if (ref.current) {
        // Aggressive scurrying hop
        ref.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.15;
        // Wiggle side-to-side mimicking frantic movement
        ref.current.rotation.y += (Math.sin(state.clock.elapsedTime * 25) * 0.1 - ref.current.rotation.y) * delta * 10;
        // Jitter rotation Z for extra creepiness
        ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 30) * 0.05;
    }
  });

  return (
    <group position={[position.x, 0, position.y]}>
      <group ref={ref}>
        <SpiderCreature />
      </group>
    </group>
  );
};
export default Enemy3D;
