// src/components/Game/Arena.js
import React, { useMemo } from "react";
import * as THREE from "three";

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
    </group>
  );
};

export default Arena;
