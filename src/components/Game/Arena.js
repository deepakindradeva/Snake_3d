// src/components/Game/Arena.js
import React, { useMemo } from "react";
import * as THREE from "three";
import { Clouds, Cloud } from "@react-three/drei";

const Arena = ({ width, height, color1 = "#66BB6A", color2 = "#43A047" }) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const context = canvas.getContext("2d");

    context.fillStyle = color1;
    context.fillRect(0, 0, 1, 1);
    context.fillRect(1, 1, 1, 1);

    context.fillStyle = color2;
    context.fillRect(0, 1, 1, 1);
    context.fillRect(1, 0, 1, 1);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter; // Sharp pixels
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(width / 2, height / 2);
    tex.colorSpace = THREE.SRGBColorSpace;

    return tex;
  }, [width, height, color1, color2]);

  return (
    <group position={[width / 2 - 0.5, -0.5, height / 2 - 0.5]}>
      {/* Static Plane - No movement logic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.8} />
      </mesh>

      {/* Atmospheric Cloud Boundaries */}
      <Clouds material={THREE.MeshLambertMaterial} limit={400} renderOrder={2}>
        <Cloud 
          position={[-width / 2 - 4, 1, 0]} 
          bounds={[4, 6, height + 8]} 
          segments={40} 
          volume={width} 
          color="#ECEFF1" 
          opacity={0.8} 
          speed={0.2} 
        />
        <Cloud 
          position={[width / 2 + 4, 1, 0]} 
          bounds={[4, 6, height + 8]} 
          segments={40} 
          volume={width} 
          color="#ECEFF1" 
          opacity={0.8} 
          speed={0.2} 
        />
        <Cloud 
          position={[0, 1, -height / 2 - 4]} 
          bounds={[width + 8, 6, 4]} 
          segments={40} 
          volume={height} 
          color="#ECEFF1" 
          opacity={0.8} 
          speed={0.2} 
        />
        <Cloud 
          position={[0, 1, height / 2 + 4]} 
          bounds={[width + 8, 6, 4]} 
          segments={40} 
          volume={height} 
          color="#ECEFF1" 
          opacity={0.8} 
          speed={0.2} 
        />
      </Clouds>
    </group>
  );
};

export default Arena;
