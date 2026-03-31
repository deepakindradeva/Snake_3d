// src/components/Obstacle/BiomeEnemy3D.js
// Biome-aware enemy renderer — 5 distinct animated enemy types.
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// ────────────────────────────────────────────────────────────────────────────
// 1. SPIDER (Forest) — original detailed 8-legged creature
// ────────────────────────────────────────────────────────────────────────────
const FEMUR_TILT = 0.18;
const FEMUR_LEN  = 0.38;
const fx = Math.cos(FEMUR_TILT) * FEMUR_LEN;
const fy = Math.sin(FEMUR_TILT) * FEMUR_LEN;
const tx = 0.13;
const ty = -0.23;
const TIB_LEN   = Math.sqrt(tx * tx + ty * ty);
const FEMUR_ROT_Z = FEMUR_TILT - Math.PI / 2;
const TIBIA_ROT_Z = Math.atan2(-tx, ty);
const HIP_X  = 0.16;
const HIP_Y  = 0.175;
const LEG_Z  = [0.11, 0.04, -0.03, -0.10];
const SPREADS = [-0.60, -0.20, 0.20, 0.60];
const getGaitPhase = (side, index) => {
  const inGroupA = side > 0 ? index % 2 === 0 : index % 2 === 1;
  return inGroupA ? 0 : Math.PI;
};

const SpiderLeg = ({ side, index }) => {
  const swingRef = useRef();
  const kneeRef  = useRef();
  const phase    = getGaitPhase(side, index);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 7 + phase;
    if (swingRef.current) swingRef.current.rotation.y = Math.sin(t) * 0.09;
    if (kneeRef.current)  kneeRef.current.rotation.z  = side * Math.max(0, Math.sin(t)) * 0.32;
  });
  const spreadY = -side * SPREADS[index];
  return (
    <group position={[side * HIP_X, HIP_Y, LEG_Z[index]]} rotation={[0, spreadY, 0]}>
      <group ref={swingRef}>
        <mesh position={[side * fx / 2, fy / 2, 0]} rotation={[0, 0, side * FEMUR_ROT_Z]} castShadow>
          <cylinderGeometry args={[0.023, 0.016, FEMUR_LEN, 7]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.72} metalness={0.12} />
        </mesh>
        <mesh position={[side * fx, fy, 0]}>
          <sphereGeometry args={[0.021, 8, 8]} />
          <meshStandardMaterial color="#131313" roughness={0.88} />
        </mesh>
        <group ref={kneeRef} position={[side * fx, fy, 0]}>
          <mesh position={[side * tx / 2, ty / 2, 0]} rotation={[0, 0, side * TIBIA_ROT_Z]} castShadow>
            <cylinderGeometry args={[0.016, 0.010, TIB_LEN, 6]} />
            <meshStandardMaterial color="#161616" roughness={0.80} />
          </mesh>
          <mesh position={[side * tx, ty, 0]}>
            <sphereGeometry args={[0.012, 7, 7]} />
            <meshStandardMaterial color="#131313" roughness={0.88} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const Spider = () => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 6) * 0.012;
    ref.current.rotation.y += (Math.sin(t * 0.7) * 0.25 - ref.current.rotation.y) * 0.018;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.27, -0.23]} castShadow>
        <sphereGeometry args={[0.29, 16, 12]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.225, 0.10]} scale={[1, 0.85, 1.1]} castShadow>
        <sphereGeometry args={[0.215, 16, 10]} />
        <meshStandardMaterial color="#131313" roughness={0.28} metalness={0.22} />
      </mesh>
      {[[-0.038, 0.31, 0.315], [0.038, 0.31, 0.315]].map(([ex, ey, ez], i) => (
        <mesh key={i} position={[ex, ey, ez]}>
          <sphereGeometry args={[0.033, 8, 8]} />
          <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={2.2} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map(i => <SpiderLeg key={`r${i}`} side={ 1} index={i} />)}
      {[0, 1, 2, 3].map(i => <SpiderLeg key={`l${i}`} side={-1} index={i} />)}
    </group>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// 2. SCORPION (Desert)
// ────────────────────────────────────────────────────────────────────────────
const ScorpionLeg = ({ side, index }) => {
  const ref = useRef();
  const phase = (index / 3) * Math.PI;
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.x = Math.sin(clock.elapsedTime * 8 + phase) * 0.25;
  });
  return (
    <group ref={ref} position={[side * 0.22, 0.1, -0.15 + index * 0.12]}>
      <mesh rotation={[0, 0, side * 0.5]}>
        <cylinderGeometry args={[0.025, 0.015, 0.35, 5]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.8} />
      </mesh>
    </group>
  );
};

const Scorpion = () => {
  const bodyRef = useRef();
  const tailRef = useRef();
  useFrame(({ clock }) => {
    if (!bodyRef.current) return;
    bodyRef.current.position.y = Math.sin(clock.elapsedTime * 5) * 0.02;
    if (tailRef.current) tailRef.current.rotation.x = Math.sin(clock.elapsedTime * 2) * 0.2 - 0.3;
  });
  return (
    <group ref={bodyRef}>
      {/* Body segments */}
      {[0, 0.18, 0.36].map((z, i) => (
        <mesh key={i} position={[0, 0.15, z]}>
          <sphereGeometry args={[0.18 - i * 0.03, 8, 8]} />
          <meshStandardMaterial color="#FFCC80" roughness={0.7} />
        </mesh>
      ))}
      {/* Claws */}
      {[-1, 1].map(side => (
        <group key={side} position={[side * 0.28, 0.15, -0.22]}>
          <mesh rotation={[0, side * 0.4, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.3, 6]} />
            <meshStandardMaterial color="#FFCC80" roughness={0.7} />
          </mesh>
          <mesh position={[side * 0.1, 0, 0.18]}>
            <boxGeometry args={[0.12, 0.08, 0.14]} />
            <meshStandardMaterial color="#FFCC80" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Tail */}
      <group ref={tailRef} position={[0, 0.18, 0.55]}>
        {[0, 0.15, 0.28, 0.38].map((z, i) => (
          <mesh key={i} position={[0, i * 0.08, z]} rotation={[i * -0.15, 0, 0]}>
            <sphereGeometry args={[0.12 - i * 0.015, 7, 7]} />
            <meshStandardMaterial color="#FFA726" roughness={0.7} />
          </mesh>
        ))}
        {/* Stinger */}
        <mesh position={[0, 0.32, 0.45]} rotation={[-0.8, 0, 0]}>
          <coneGeometry args={[0.06, 0.22, 6]} />
          <meshStandardMaterial color="#BF360C" roughness={0.5} />
        </mesh>
      </group>
      {/* Legs */}
      {[0, 1, 2, 3].map(i => <ScorpionLeg key={`r${i}`} side={ 1} index={i} />)}
      {[0, 1, 2, 3].map(i => <ScorpionLeg key={`l${i}`} side={-1} index={i} />)}
      {/* Eyes */}
      {[-0.07, 0.07].map((x, i) => (
        <mesh key={i} position={[x, 0.28, -0.3]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#FF6F00" emissive="#FF6F00" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// 3. WOLF (Arctic)
// ────────────────────────────────────────────────────────────────────────────
const WolfLeg = ({ xOff, zOff, phase }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.x = Math.sin(clock.elapsedTime * 9 + phase) * 0.35;
  });
  return (
    <group ref={ref} position={[xOff, 0.12, zOff]}>
      <mesh position={[0, -0.18, 0]}>
        <capsuleGeometry args={[0.06, 0.28, 4, 6]} />
        <meshStandardMaterial color="#ECEFF1" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.38, 0.04]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#CFD8DC" roughness={0.8} />
      </mesh>
    </group>
  );
};

const Wolf = () => {
  const bodyRef = useRef();
  useFrame(({ clock }) => {
    if (!bodyRef.current) return;
    bodyRef.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 8)) * 0.04;
    bodyRef.current.rotation.z = Math.sin(clock.elapsedTime * 8) * 0.04;
  });
  return (
    <group ref={bodyRef} position={[0, 0.3, 0]}>
      {/* Body */}
      <mesh scale={[0.85, 0.65, 1.15]}>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial color="#ECEFF1" roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.2, 0.38]} scale={[0.9, 0.85, 1.0]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#ECEFF1" roughness={0.85} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.1, 0.57]} scale={[0.65, 0.55, 1.0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#CFD8DC" roughness={0.8} />
      </mesh>
      {/* Ears */}
      {[-0.13, 0.13].map((x, i) => (
        <mesh key={i} position={[x, 0.42, 0.3]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
          <coneGeometry args={[0.07, 0.18, 5]} />
          <meshStandardMaterial color="#90A4AE" roughness={0.9} />
        </mesh>
      ))}
      {/* Eyes */}
      {[-0.09, 0.09].map((x, i) => (
        <mesh key={i} position={[x, 0.22, 0.56]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#00B0FF" emissive="#00B0FF" emissiveIntensity={1.2} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[0, 0.05, -0.42]} rotation={[-0.6, 0, 0]}>
        <capsuleGeometry args={[0.06, 0.35, 4, 6]} />
        <meshStandardMaterial color="#B0BEC5" roughness={0.9} />
      </mesh>
      {/* Legs */}
      <WolfLeg xOff={ 0.22} zOff={ 0.15} phase={0} />
      <WolfLeg xOff={-0.22} zOff={ 0.15} phase={Math.PI} />
      <WolfLeg xOff={ 0.22} zOff={-0.15} phase={Math.PI} />
      <WolfLeg xOff={-0.22} zOff={-0.15} phase={0} />
    </group>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// 4. FIRE SPRITE (Volcano) — floating glowing orb with orbiting ring
// ────────────────────────────────────────────────────────────────────────────
const FireSprite = () => {
  const bodyRef  = useRef();
  const ringRef  = useRef();
  const flameRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 2.5) * 0.18 + 0.45;
      bodyRef.current.material.emissiveIntensity = 1.2 + Math.sin(t * 8) * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 2.2;
      ringRef.current.rotation.x = Math.sin(t * 0.8) * 0.5;
    }
    if (flameRef.current) {
      flameRef.current.position.y = Math.sin(t * 3) * 0.12 + 0.75;
      flameRef.current.scale.y = 0.8 + Math.sin(t * 7) * 0.2;
    }
  });
  return (
    <group>
      {/* Main orb */}
      <mesh ref={bodyRef} position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.28, 14, 14]} />
        <meshStandardMaterial color="#FF6D00" emissive="#FF3D00" emissiveIntensity={1.5} roughness={0.2} />
      </mesh>
      {/* Orbiting ring */}
      <group ref={ringRef} position={[0, 0.45, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.44, 0.04, 8, 32]} />
          <meshStandardMaterial color="#FF9800" emissive="#FF6D00" emissiveIntensity={1.0} roughness={0.3} />
        </mesh>
      </group>
      {/* Flame tip */}
      <mesh ref={flameRef} position={[0, 0.75, 0]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color="#FFCA28" emissive="#FF6D00" emissiveIntensity={1.2} roughness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* Glow light */}
      <pointLight position={[0, 0.45, 0]} color="#FF6D00" intensity={2.5} distance={5} decay={2} />
    </group>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// 5. JELLYFISH (Ocean) — bell with trailing tentacles, gentle pulse
// ────────────────────────────────────────────────────────────────────────────
const Jellyfish = () => {
  const bellRef = useRef();
  const tentacleRefs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (bellRef.current) {
      bellRef.current.scale.y = 0.85 + Math.sin(t * 2.2) * 0.15;
      bellRef.current.scale.x = 1.0 + Math.sin(t * 2.2) * 0.05;
      bellRef.current.position.y = Math.sin(t * 1.5) * 0.12 + 0.55;
    }
    tentacleRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.rotation.x = Math.sin(t * 2 + i * 0.8) * 0.18;
        ref.rotation.z = Math.cos(t * 1.5 + i * 0.6) * 0.12;
        ref.position.y = Math.sin(t * 1.5) * 0.12 + 0.2;
      }
    });
  });

  const tentacleCount = 7;
  return (
    <group>
      {/* Bell */}
      <mesh ref={bellRef} position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#CE93D8" emissive="#9C27B0" emissiveIntensity={0.5} roughness={0.1} transparent opacity={0.75} side={2} />
      </mesh>
      {/* Underbelly */}
      <mesh position={[0, 0.55, 0]}>
        <circleGeometry args={[0.31, 12]} />
        <meshStandardMaterial color="#E1BEE7" emissive="#9C27B0" emissiveIntensity={0.3} roughness={0.1} transparent opacity={0.6} />
      </mesh>
      {/* Tentacles */}
      {Array.from({ length: tentacleCount }, (_, i) => {
        const angle = (i / tentacleCount) * Math.PI * 2;
        const r = 0.22;
        return (
          <group
            key={i}
            ref={el => (tentacleRefs.current[i] = el)}
            position={[Math.cos(angle) * r, 0.2, Math.sin(angle) * r]}
          >
            <mesh position={[0, -0.28, 0]}>
              <cylinderGeometry args={[0.018, 0.006, 0.55 + (i % 3) * 0.12, 5]} />
              <meshStandardMaterial color="#CE93D8" emissive="#9C27B0" emissiveIntensity={0.4} transparent opacity={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
      {/* Glow */}
      <pointLight position={[0, 0.55, 0]} color="#CE93D8" intensity={1.2} distance={4} decay={2} />
    </group>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Dispatcher
// ────────────────────────────────────────────────────────────────────────────
const BiomeEnemy3D = ({ position, enemyType = "spider" }) => {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    // Slow predatory y-rotation for all types
    ref.current.rotation.y += (Math.sin(clock.elapsedTime * 0.5) * 0.2 - ref.current.rotation.y) * 0.015;
  });

  const renderEnemy = () => {
    switch (enemyType) {
      case "scorpion":   return <Scorpion />;
      case "wolf":       return <Wolf />;
      case "fire_sprite": return <FireSprite />;
      case "jellyfish":  return <Jellyfish />;
      default:           return <Spider />;
    }
  };

  return (
    <group position={[position.x, 0, position.y]}>
      <group ref={ref}>
        {renderEnemy()}
      </group>
    </group>
  );
};

export default BiomeEnemy3D;
