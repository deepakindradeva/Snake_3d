import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Portal3D = ({ position }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += 0.05;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group position={[position.x, 0.5, position.y]}>
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.1, 16, 32]} />
        <meshStandardMaterial color="#E040FB" emissive="#AA00FF" emissiveIntensity={2} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.05]} />
        <meshBasicMaterial color="#AA00FF" transparent opacity={0.5} />
      </mesh>
      <pointLight color="#E040FB" intensity={1} distance={5} />
    </group>
  );
};
export default Portal3D;
