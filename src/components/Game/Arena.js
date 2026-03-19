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
      <Clouds>
        {/* Left Wall */}
        <Cloud 
          position={[-width / 2 - 2, 10, 0]} 
          bounds={[5, 20, height + 10]} 
          segments={120} 
          volume={width}
          color="#FFFFFF" 
          opacity={0.9} 
          speed={0.2} 
        />
        {/* Right Wall */}
        <Cloud 
          position={[width / 2 + 2, 10, 0]} 
          bounds={[5, 20, height + 10]} 
          segments={120} 
          volume={width}
          color="#FFFFFF" 
          opacity={0.9} 
          speed={0.2} 
        />
        {/* Top Wall */}
        <Cloud 
          position={[0, 10, -height / 2 - 2]} 
          bounds={[width + 10, 20, 5]} 
          segments={120} 
          volume={height}
          color="#FFFFFF" 
          opacity={0.9} 
          speed={0.2} 
        />
        {/* Bottom Wall */}
        <Cloud 
          position={[0, 10, height / 2 + 2]} 
          bounds={[width + 10, 20, 5]} 
          segments={120} 
          volume={height}
          color="#FFFFFF" 
          opacity={0.9} 
          speed={0.2} 
        />
      </Clouds>
    </group>
  );
};

export default Arena;
