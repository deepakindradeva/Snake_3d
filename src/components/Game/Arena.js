// src/components/Game/Arena.js
import { useMemo } from "react";
import * as THREE from "three";
import { BIOME_CONFIG } from "../../utils/constants";

// Floor extends well beyond the fog far-clip so the edge is never visible.
const FLOOR_SCALE = 5;

const Arena = ({ width, height, biome = "forest" }) => {
  const cfg = BIOME_CONFIG[biome] || BIOME_CONFIG.forest;

  // Actual rendered plane size — large enough that the edge is always past fog.
  const floorW = width  * FLOOR_SCALE;
  const floorH = height * FLOOR_SCALE;

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width  = 4;
    canvas.height = 4;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = cfg.floorColor1;
    ctx.fillRect(0, 0, 2, 2);
    ctx.fillRect(2, 2, 2, 2);

    ctx.fillStyle = cfg.floorColor2;
    ctx.fillRect(2, 0, 2, 2);
    ctx.fillRect(0, 2, 2, 2);

    // Subtle biome detail: arctic gets faint cross-hatch, volcano gets crack lines
    if (biome === "arctic") {
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 0.3;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(4, i); ctx.stroke();
      }
    } else if (biome === "volcano") {
      ctx.strokeStyle = "rgba(255,61,0,0.35)";
      ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(3, 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(4, 1); ctx.stroke();
    } else if (biome === "ocean") {
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 4; i += 1.5) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(4, i + 0.5); ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter  = THREE.NearestFilter;
    tex.wrapS      = THREE.RepeatWrapping;
    tex.wrapT      = THREE.RepeatWrapping;
    // Maintain same checker density per world unit as the original grid-sized floor.
    tex.repeat.set(floorW / 2, floorH / 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [floorW, floorH, biome, cfg]);

  return (
    // Group stays centered on the grid; the plane just extends further in all directions.
    <group position={[width / 2 - 0.5, -0.5, height / 2 - 0.5]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorW, floorH]} />
        <meshStandardMaterial map={texture} roughness={cfg.floorRoughness ?? 0.8} />
      </mesh>
    </group>
  );
};

export default Arena;
