import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// ── Leg geometry constants ─────────────────────────────────────────────────
const FEMUR_TILT = 0.18;                          // slight upward angle (~10°)
const FEMUR_LEN  = 0.38;
const fx = Math.cos(FEMUR_TILT) * FEMUR_LEN;     // ≈ 0.373 — femur reach in X
const fy = Math.sin(FEMUR_TILT) * FEMUR_LEN;     // ≈ 0.068 — femur lift in Y

// Tibia vector in knee-local space (further out + down to ground)
const tx = 0.13;
const ty = -0.23;
const TIB_LEN = Math.sqrt(tx * tx + ty * ty);    // ≈ 0.265

// Cylinder rotations: align default Y-axis cylinder to target direction [dx, dy, 0]
// Rotation Z that maps Y → [cos(angle), sin(angle), 0] is: angle - π/2
const FEMUR_ROT_Z = FEMUR_TILT - Math.PI / 2;   // ≈ -1.39
const TIBIA_ROT_Z = Math.atan2(-tx, ty);         // ≈ -2.62

// Hip attachment points on the cephalothorax
const HIP_X  = 0.16;
const HIP_Y  = 0.175;
const LEG_Z  = [0.11, 0.04, -0.03, -0.10];      // Z offsets per leg pair (front→back)

// Spread angles: negative = forward, positive = backward (for right side)
const SPREADS = [-0.60, -0.20, 0.20, 0.60];

// Alternating tetrapod gait: diagonal leg pairs move together
const getGaitPhase = (side, index) => {
  const inGroupA = side > 0 ? index % 2 === 0 : index % 2 === 1;
  return inGroupA ? 0 : Math.PI;
};

// ── Shared materials ───────────────────────────────────────────────────────
const FemurMat  = () => <meshStandardMaterial color="#1c1c1c" roughness={0.72} metalness={0.12} />;
const TibiaMat  = () => <meshStandardMaterial color="#161616" roughness={0.80} metalness={0.07} />;
const JointMat  = () => <meshStandardMaterial color="#131313" roughness={0.88} metalness={0.06} />;

// ── Single animated leg ────────────────────────────────────────────────────
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

        {/* Femur ─ upper segment from hip outward */}
        <mesh position={[side * fx / 2, fy / 2, 0]} rotation={[0, 0, side * FEMUR_ROT_Z]} castShadow>
          <cylinderGeometry args={[0.023, 0.016, FEMUR_LEN, 7]} />
          <FemurMat />
        </mesh>

        {/* Knee joint sphere */}
        <mesh position={[side * fx, fy, 0]}>
          <sphereGeometry args={[0.021, 8, 8]} />
          <JointMat />
        </mesh>

        {/* Tibia ─ lower segment, animated lift from knee pivot */}
        <group ref={kneeRef} position={[side * fx, fy, 0]}>
          <mesh position={[side * tx / 2, ty / 2, 0]} rotation={[0, 0, side * TIBIA_ROT_Z]} castShadow>
            <cylinderGeometry args={[0.016, 0.010, TIB_LEN, 6]} />
            <TibiaMat />
          </mesh>
          {/* Tarsus (foot tip) */}
          <mesh position={[side * tx, ty, 0]}>
            <sphereGeometry args={[0.012, 7, 7]} />
            <JointMat />
          </mesh>
        </group>

      </group>
    </group>
  );
};

// ── Spider body ────────────────────────────────────────────────────────────
const SpiderBody = () => (
  <group>

    {/* ── Abdomen (opisthosoma) — large rear section ── */}
    <mesh position={[0, 0.27, -0.23]} castShadow>
      <sphereGeometry args={[0.29, 22, 16]} />
      <meshStandardMaterial color="#0e0e0e" roughness={0.30} metalness={0.20} />
    </mesh>
    {/* Dorsal hourglass marking */}
    <mesh position={[0, 0.56, -0.18]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.4, 1]}>
      <sphereGeometry args={[0.055, 10, 10]} />
      <meshStandardMaterial color="#3a1200" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.56, -0.28]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.2, 1]}>
      <sphereGeometry args={[0.045, 10, 10]} />
      <meshStandardMaterial color="#3a1200" roughness={0.5} />
    </mesh>

    {/* ── Pedicel — narrow waist connecting the two body sections ── */}
    <mesh position={[0, 0.22, -0.02]}>
      <sphereGeometry args={[0.068, 10, 10]} />
      <meshStandardMaterial color="#111111" roughness={0.45} metalness={0.15} />
    </mesh>

    {/* ── Cephalothorax (prosoma) — front body section ── */}
    <mesh position={[0, 0.225, 0.10]} scale={[1, 0.85, 1.1]} castShadow>
      <sphereGeometry args={[0.215, 20, 14]} />
      <meshStandardMaterial color="#131313" roughness={0.28} metalness={0.22} />
    </mesh>
    {/* Fovea — small pit on top of cephalothorax */}
    <mesh position={[0, 0.44, 0.07]}>
      <sphereGeometry args={[0.022, 8, 8]} />
      <meshStandardMaterial color="#060606" roughness={0.8} />
    </mesh>

    {/* ── Chelicerae (fang bases) ── */}
    <mesh position={[ 0.062, 0.175, 0.295]} rotation={[0.55, 0.12, 0.05]} castShadow>
      <capsuleGeometry args={[0.038, 0.09, 6, 10]} />
      <meshStandardMaterial color="#121212" roughness={0.45} metalness={0.18} />
    </mesh>
    <mesh position={[-0.062, 0.175, 0.295]} rotation={[0.55, -0.12, -0.05]} castShadow>
      <capsuleGeometry args={[0.038, 0.09, 6, 10]} />
      <meshStandardMaterial color="#121212" roughness={0.45} metalness={0.18} />
    </mesh>
    {/* Fangs — curved tips on chelicerae */}
    <mesh position={[ 0.062, 0.115, 0.355]} rotation={[1.15, 0.12, 0.15]}>
      <capsuleGeometry args={[0.016, 0.065, 5, 8]} />
      <meshStandardMaterial color="#1c0000" roughness={0.38} metalness={0.32} />
    </mesh>
    <mesh position={[-0.062, 0.115, 0.355]} rotation={[1.15, -0.12, -0.15]}>
      <capsuleGeometry args={[0.016, 0.065, 5, 8]} />
      <meshStandardMaterial color="#1c0000" roughness={0.38} metalness={0.32} />
    </mesh>

    {/* ── Pedipalps — small leg-like sensory appendages at the front ── */}
    <mesh position={[ 0.11, 0.205, 0.27]} rotation={[0.25, 0.55, 0.30]}>
      <capsuleGeometry args={[0.017, 0.13, 5, 8]} />
      <meshStandardMaterial color="#1b1b1b" roughness={0.70} metalness={0.08} />
    </mesh>
    <mesh position={[-0.11, 0.205, 0.27]} rotation={[0.25, -0.55, -0.30]}>
      <capsuleGeometry args={[0.017, 0.13, 5, 8]} />
      <meshStandardMaterial color="#1b1b1b" roughness={0.70} metalness={0.08} />
    </mesh>

    {/* ── Eyes — 8 eyes in 2 rows on the front face of cephalothorax ── */}
    {/* Anterior median (front row, inner pair — largest eyes) */}
    {[[-0.038, 0.31, 0.315], [0.038, 0.31, 0.315]].map(([ex, ey, ez], i) => (
      <mesh key={`am${i}`} position={[ex, ey, ez]}>
        <sphereGeometry args={[0.033, 10, 10]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={2.2} roughness={0.08} />
      </mesh>
    ))}
    {/* Anterior lateral (front row, outer pair) */}
    {[[-0.10, 0.295, 0.29], [0.10, 0.295, 0.29]].map(([ex, ey, ez], i) => (
      <mesh key={`al${i}`} position={[ex, ey, ez]}>
        <sphereGeometry args={[0.024, 9, 9]} />
        <meshStandardMaterial color="#aa0000" emissive="#dd0000" emissiveIntensity={1.6} roughness={0.12} />
      </mesh>
    ))}
    {/* Posterior median (back row, inner pair) */}
    {[[-0.032, 0.345, 0.265], [0.032, 0.345, 0.265]].map(([ex, ey, ez], i) => (
      <mesh key={`pm${i}`} position={[ex, ey, ez]}>
        <sphereGeometry args={[0.020, 9, 9]} />
        <meshStandardMaterial color="#880000" emissive="#bb0000" emissiveIntensity={1.3} roughness={0.18} />
      </mesh>
    ))}
    {/* Posterior lateral (back row, outer pair) */}
    {[[-0.088, 0.335, 0.255], [0.088, 0.335, 0.255]].map(([ex, ey, ez], i) => (
      <mesh key={`pl${i}`} position={[ex, ey, ez]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#660000" emissive="#990000" emissiveIntensity={1.0} roughness={0.22} />
      </mesh>
    ))}

    {/* ── Spinnerets — rear of abdomen ── */}
    <mesh position={[ 0.042, 0.235, -0.49]} rotation={[-0.4, 0.1, 0]}>
      <capsuleGeometry args={[0.022, 0.045, 5, 8]} />
      <meshStandardMaterial color="#0f0f0f" roughness={0.90} />
    </mesh>
    <mesh position={[-0.042, 0.235, -0.49]} rotation={[-0.4, -0.1, 0]}>
      <capsuleGeometry args={[0.022, 0.045, 5, 8]} />
      <meshStandardMaterial color="#0f0f0f" roughness={0.90} />
    </mesh>

  </group>
);

// ── Full spider ─────────────────────────────────────────────────────────────
const SpiderCreature = () => (
  <group>
    <SpiderBody />
    {[0, 1, 2, 3].map(i => <SpiderLeg key={`r${i}`} side={ 1} index={i} />)}
    {[0, 1, 2, 3].map(i => <SpiderLeg key={`l${i}`} side={-1} index={i} />)}
  </group>
);

// ── Enemy wrapper ──────────────────────────────────────────────────────────
const Enemy3D = ({ position }) => {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    // Subtle body bob while walking
    ref.current.position.y = Math.sin(t * 6) * 0.012;
    // Slow predatory tracking rotation
    ref.current.rotation.y +=
      (Math.sin(t * 0.7) * 0.25 - ref.current.rotation.y) * 0.018;
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
