// src/components/Snake/Snake3D.js
import React, { useRef, useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

const Snake3D = ({ snake, isInvincible, hasShield, isMagnet }) => {
  const meshRef = useRef();
  const headRef = useRef();
  const tailRef = useRef();

  // 1. LOAD TEXTURES
  const [colorMap, normalMap] = useLoader(TextureLoader, [
    "/snake-skin.jpg",
    "/snake-normal.jpg",
  ]);

  // 2. CONFIGURE TEXTURES
  useEffect(() => {
    [colorMap, normalMap].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 1);
    });
    return () => {
      colorMap.dispose();
      normalMap.dispose();
    };
  }, [colorMap, normalMap]);

  // 3. VISUAL STATE
  const [visualPoints, setVisualPoints] = useState(
    snake.map((p) => new THREE.Vector3(p.x, 0, p.y)),
  );

  // Sync visual points size with logical snake size
  useEffect(() => {
    if (snake.length > visualPoints.length) {
      const tail = visualPoints[visualPoints.length - 1];
      setVisualPoints((prev) => [...prev, tail.clone()]);
    } else if (snake.length < visualPoints.length) {
      setVisualPoints(snake.map((p) => new THREE.Vector3(p.x, 0, p.y)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snake.length]);

  // 4. ANIMATION LOOP
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // --- A. SMOOTH MOVEMENT & SLITHER LOGIC ---
    const speed = delta * 12;
    const time = state.clock.elapsedTime;

    snake.forEach((target, i) => {
      if (visualPoints[i]) {
        const targetVec = new THREE.Vector3(target.x, 0, target.y);

        // SLITHER CALCULATION (Moderate Wiggle from before)
        if (i > 0) {
          const prev = snake[i - 1] || snake[0];
          const curr = snake[i];

          const dx = prev.x - curr.x;
          const dy = prev.y - curr.y;

          const waveFreq = 0.6;
          const waveAmp = 0.18;
          const waveSpeed = 8;
          const wave = Math.sin(time * waveSpeed + i * waveFreq) * waveAmp;

          if (Math.abs(dx) > Math.abs(dy)) {
            targetVec.z += wave;
          } else {
            targetVec.x += wave;
          }
        }
        visualPoints[i].lerp(targetVec, speed);
      }
    });

    // --- B. GENERATE GEOMETRY ---
    const curve = new THREE.CatmullRomCurve3(visualPoints);
    curve.curveType = "centripetal";
    curve.tension = 0.5;

    const segments = snake.length * 5;
    const radialSegments = 8;

    // Geometry props (Radius 0.25)
    const geometry = new THREE.TubeGeometry(
      curve,
      segments,
      0.25,
      radialSegments,
      false,
    );

    // --- C. TAPER TAIL LOGIC ---
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      const p = new THREE.Vector3(x, y, z);
      const ringIndex = Math.floor(i / (radialSegments + 1));
      const u = ringIndex / segments;

      let thickness = 1.0;
      if (u > 0.7) {
        thickness = 1.0 - ((u - 0.7) / 0.3) * 0.9;
      }

      const center = curve.getPointAt(Math.min(u, 1));
      const dir = new THREE.Vector3().subVectors(p, center);

      dir.y *= 0.85;
      dir.multiplyScalar(thickness);

      const newPos = new THREE.Vector3().addVectors(center, dir);
      pos.setXYZ(i, newPos.x, newPos.y, newPos.z);
    }
    geometry.computeVertexNormals();

    colorMap.repeat.y = snake.length * 0.5;
    normalMap.repeat.y = snake.length * 0.5;

    meshRef.current.geometry.dispose();
    meshRef.current.geometry = geometry;

    // --- D. UPDATE HEAD & TAIL ---
    if (headRef.current && visualPoints[0] && visualPoints[1]) {
      headRef.current.position.copy(visualPoints[0]);
      headRef.current.lookAt(visualPoints[1]);
      headRef.current.rotateY(Math.PI);
    }

    if (tailRef.current && visualPoints.length > 1) {
      const lastIndex = visualPoints.length - 1;
      tailRef.current.position.copy(visualPoints[lastIndex]);
      tailRef.current.scale.set(0.08, 0.08, 0.08);
    }

    // --- E. EFFECTS (Invincibility only) ---
    if (isInvincible) {
      const flash = Math.sin(state.clock.elapsedTime * 15) * 0.5 + 0.5;
      meshRef.current.material.opacity = 0.5 + flash * 0.5;
      meshRef.current.material.transparent = true;
      meshRef.current.material.emissive.setHex(0xffffff);
      meshRef.current.material.emissiveIntensity = 0.3 * flash;
    } else {
      meshRef.current.material.opacity = 1.0;
      meshRef.current.material.transparent = false;
      // Reset to original (No glow)
      meshRef.current.material.emissive.setHex(0x000000);
      meshRef.current.material.emissiveIntensity = 0;
    }
  });

  return (
    <group>
      {/* BODY */}
      <mesh ref={meshRef} castShadow>
        <bufferGeometry />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.4}
          metalness={0.1}
          color="#81C784" // <--- Reverted to Original Green
        />
      </mesh>

      {/* HEAD */}
      <group ref={headRef} scale={[0.65, 0.65, 0.65]}>
        <mesh>
          <sphereGeometry args={[0.44, 16, 16]} />
          <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            roughness={0.4}
            color="#81C784" // <--- Reverted to Original Green
          />
        </mesh>

        {/* Shield Bubble */}
        {hasShield && (
          <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial
              color="#448AFF"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        {/* Magnet Ring */}
        {isMagnet && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.6, 32]} />
            <meshBasicMaterial color="#FF5252" transparent opacity={0.6} />
          </mesh>
        )}

        {/* Eyes - Reverted to Original Yellow/Gold */}
        <group position={[0, 0.2, 0.25]}>
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial
              color="#FFEB3B"
              emissive="#FBC02D"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[-0.15, 0, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial
              color="#FFEB3B"
              emissive="#FBC02D"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Pupils */}
          <mesh position={[0.18, 0.05, 0.08]} scale={[0.5, 1.5, 0.5]}>
            <sphereGeometry args={[0.06]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[-0.18, 0.05, 0.08]} scale={[0.5, 1.5, 0.5]}>
            <sphereGeometry args={[0.06]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </group>
        {/* Tongue */}
        <mesh position={[0, -0.1, 0.4]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.08, 0.4]} />
          <meshStandardMaterial color="#D50000" roughness={0.1} />
        </mesh>
      </group>

      {/* TAIL */}
      <mesh ref={tailRef} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughness={0.4}
          color="#81C784" // <--- Reverted to Original Green
        />
      </mesh>
    </group>
  );
};

export default Snake3D;
