// src/components/Snake/Snake3D.js
import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import { Trail } from "@react-three/drei";
import { DEFAULT_CHARACTER } from "../../utils/characters";

const Snake3D = ({ snake, isInvincible, hasShield, isMagnet, character = DEFAULT_CHARACTER }) => {
  const meshRef = useRef();
  const headRef = useRef();
  const tailRef = useRef();

  const [colorMap, normalMap] = useLoader(TextureLoader, [
    "/snake-skin.jpg",
    "/snake-normal.jpg",
  ]);

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

  // Derive material props from character.visual — falls back to default skin textures
  const skinProps = useMemo(() => {
    const v = character?.visual;
    if (!v) {
      return { color: "#81C784", map: colorMap, normalMap, roughness: 0.4, metalness: 0.1 };
    }
    // Characters with no texture (non-default skin ids) use solid colour
    const useTexture = character.skin === "default";
    return {
      color: v.bodyColor,
      emissive: v.emissive,
      emissiveIntensity: v.emissiveIntensity,
      roughness: v.roughness,
      metalness: v.metalness,
      map: useTexture ? colorMap : null,
      normalMap: useTexture ? normalMap : null,
    };
  }, [character, colorMap, normalMap]);

  const eyeColor   = character?.visual?.eyeColor   ?? "#FFEB3B";
  const tongueColor = character?.visual?.tongueColor ?? "#D50000";
  const trailColor  = character?.visual?.trailColor  ?? null;

  const [visualPoints, setVisualPoints] = useState(
    snake.map((p) => new THREE.Vector3(p.x, 0, p.y)),
  );

  useEffect(() => {
    if (snake.length > visualPoints.length) {
      const tail = visualPoints[visualPoints.length - 1];
      setVisualPoints((prev) => [...prev, tail.clone()]);
    } else if (snake.length < visualPoints.length) {
      setVisualPoints(snake.map((p) => new THREE.Vector3(p.x, 0, p.y)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snake.length]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speed = delta * 12;
    const time = state.clock.elapsedTime;

    snake.forEach((target, i) => {
      if (visualPoints[i]) {
        const targetVec = new THREE.Vector3(target.x, 0, target.y);

        if (i > 0) {
          const prev = snake[i - 1] || snake[0];
          const curr = snake[i];
          const dx = prev.x - curr.x;
          const dy = prev.y - curr.y;
          const waveFreq = 0.6;
          const waveAmp  = 0.18;
          const waveSpeed = 8;
          const wave = Math.sin(time * waveSpeed + i * waveFreq) * waveAmp;
          if (Math.abs(dx) > Math.abs(dy)) targetVec.z += wave;
          else                              targetVec.x += wave;
        }
        visualPoints[i].lerp(targetVec, speed);
      }
    });

    const curve = new THREE.CatmullRomCurve3(visualPoints);
    curve.curveType = "centripetal";
    curve.tension   = 0.5;

    const segments       = snake.length * 5;
    const radialSegments = 8;

    const geometry = new THREE.TubeGeometry(curve, segments, 0.25, radialSegments, false);

    // Taper tail
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i); const y = pos.getY(i); const z = pos.getZ(i);
      const p = new THREE.Vector3(x, y, z);
      const ringIndex = Math.floor(i / (radialSegments + 1));
      const u = ringIndex / segments;
      let thickness = 1.0;
      if (u > 0.7) thickness = 1.0 - ((u - 0.7) / 0.3) * 0.9;
      const center = curve.getPointAt(Math.min(u, 1));
      const dir = new THREE.Vector3().subVectors(p, center);
      dir.y *= 0.85;
      dir.multiplyScalar(thickness);
      const newPos = new THREE.Vector3().addVectors(center, dir);
      pos.setXYZ(i, newPos.x, newPos.y, newPos.z);
    }
    geometry.computeVertexNormals();

    if (colorMap) {
      colorMap.repeat.y  = snake.length * 0.5;
      normalMap.repeat.y = snake.length * 0.5;
    }

    meshRef.current.geometry.dispose();
    meshRef.current.geometry = geometry;

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

    // Invincibility flash
    if (isInvincible) {
      const flash = Math.sin(state.clock.elapsedTime * 15) * 0.5 + 0.5;
      meshRef.current.material.opacity = 0.5 + flash * 0.5;
      meshRef.current.material.transparent = true;
      meshRef.current.material.emissive.setHex(0xffffff);
      meshRef.current.material.emissiveIntensity = 0.3 * flash;
    } else {
      meshRef.current.material.opacity = 1.0;
      meshRef.current.material.transparent = false;
      meshRef.current.material.emissive.setStyle(skinProps.emissive || "#000000");
      meshRef.current.material.emissiveIntensity = skinProps.emissiveIntensity || 0;
    }
  });

  return (
    <group>
      {/* BODY */}
      <mesh ref={meshRef} castShadow>
        <bufferGeometry />
        <meshStandardMaterial
          {...skinProps}
          normalScale={new THREE.Vector2(0.8, 0.8)}
        />
      </mesh>

      {/* HEAD */}
      <group ref={headRef} scale={[0.65, 0.65, 0.65]}>
        <mesh>
          <sphereGeometry args={[0.44, 16, 16]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>

        {hasShield && (
          <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#448AFF" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        )}
        {isMagnet && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.6, 32]} />
            <meshBasicMaterial color="#FF5252" transparent opacity={0.6} />
          </mesh>
        )}

        {/* Eyes */}
        <group position={[0, 0.2, 0.25]}>
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.15, 0, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
          </mesh>
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
          <meshStandardMaterial color={tongueColor} roughness={0.1} />
        </mesh>
      </group>

      {/* TAIL */}
      <mesh ref={tailRef} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial {...skinProps} />
        {trailColor && (
          <Trail width={0.5} color={trailColor} length={10} decay={2}>
            <mesh>
              <sphereGeometry args={[0.1]} />
              <meshBasicMaterial opacity={0} transparent />
            </mesh>
          </Trail>
        )}
      </mesh>
    </group>
  );
};

export default Snake3D;
