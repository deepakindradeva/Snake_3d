// src/components/Obstacle/BiomeObstacles3D.js
// Biome-aware obstacle renderer — dispatches per-biome 3D meshes.
import React, { useMemo } from "react";
import * as THREE from "three";

// ── Shared geometries (module-level, created once) ──────────────────────────

// Forest
const trunkGeo     = new THREE.CylinderGeometry(0.15, 0.25, 0.6, 6);
const coneGeoLow   = new THREE.ConeGeometry(0.8, 1.2, 7);
const coneGeoMid   = new THREE.ConeGeometry(0.6, 1.0, 7);
const coneGeoTop   = new THREE.ConeGeometry(0.4, 0.8, 7);
const rockGeo      = new THREE.DodecahedronGeometry(0.5, 0);
const rockDetailGeo = new THREE.DodecahedronGeometry(0.25, 0);
const bushGeoBig   = new THREE.SphereGeometry(0.4, 6, 6);
const bushGeoMid   = new THREE.SphereGeometry(0.3, 6, 6);
const bushGeoSmall = new THREE.SphereGeometry(0.35, 6, 6);

// Desert
const cactusBodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8);
const cactusArmGeo  = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
const duneGeo       = new THREE.SphereGeometry(0.8, 8, 6);
const skullGeo      = new THREE.SphereGeometry(0.35, 8, 8);

// Arctic
const spireGeo      = new THREE.ConeGeometry(0.15, 1.6, 5);
const spireBase     = new THREE.ConeGeometry(0.22, 0.5, 5);
const snowdriftGeo  = new THREE.SphereGeometry(0.55, 8, 6);
const logGeo        = new THREE.CylinderGeometry(0.18, 0.22, 1.2, 8);

// Volcano
const lavaRockGeo   = new THREE.DodecahedronGeometry(0.55, 0);
const stalagGeo     = new THREE.ConeGeometry(0.2, 1.4, 6);
const ashPillarGeo  = new THREE.CylinderGeometry(0.22, 0.28, 1.1, 8);

// Ocean
const coralSegGeo   = new THREE.CylinderGeometry(0.07, 0.12, 0.6, 6);
const anemoneBodyGeo = new THREE.SphereGeometry(0.3, 8, 8);
const tentacleGeo   = new THREE.CylinderGeometry(0.03, 0.06, 0.5, 5);
const wreckPlankGeo = new THREE.BoxGeometry(1.0, 0.08, 0.2);

// ── Shared materials ─────────────────────────────────────────────────────────

// Forest
const trunkMat     = new THREE.MeshStandardMaterial({ color: "#3E2723" });
const leafDark     = new THREE.MeshStandardMaterial({ color: "#2E7D32" });
const leafLight    = new THREE.MeshStandardMaterial({ color: "#43A047" });
const leafAncient  = new THREE.MeshStandardMaterial({ color: "#1B5E20" });
const leafBright   = new THREE.MeshStandardMaterial({ color: "#66BB6A" });
const rockMat      = new THREE.MeshStandardMaterial({ color: "#78909C", roughness: 0.9 });
const rockDetail   = new THREE.MeshStandardMaterial({ color: "#607D8B", roughness: 0.9 });
const bushMat1     = new THREE.MeshStandardMaterial({ color: "#66BB6A" });
const bushMat2     = new THREE.MeshStandardMaterial({ color: "#4CAF50" });
const bushMat3     = new THREE.MeshStandardMaterial({ color: "#81C784" });
const bushMat4     = new THREE.MeshStandardMaterial({ color: "#388E3C" });

// Desert
const cactusMat    = new THREE.MeshStandardMaterial({ color: "#558B2F", roughness: 0.9 });
const duneMat      = new THREE.MeshStandardMaterial({ color: "#FFE082", roughness: 1.0 });
const boneMat      = new THREE.MeshStandardMaterial({ color: "#F5F5DC", roughness: 0.8 });

// Arctic
const iceMat       = new THREE.MeshStandardMaterial({ color: "#B3E5FC", roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.85 });
const snowMat      = new THREE.MeshStandardMaterial({ color: "#ECEFF1", roughness: 0.9 });
const frozenLogMat = new THREE.MeshStandardMaterial({ color: "#78909C", roughness: 0.8 });

// Volcano
const lavaRockMat  = new THREE.MeshStandardMaterial({ color: "#3E2723", roughness: 0.95 });
const lavGlow      = new THREE.MeshStandardMaterial({ color: "#FF3D00", emissive: "#FF3D00", emissiveIntensity: 0.6, roughness: 0.5 });
const ashMat       = new THREE.MeshStandardMaterial({ color: "#212121", roughness: 1.0 });

// Ocean
const coralMat     = new THREE.MeshStandardMaterial({ color: "#FF7043", roughness: 0.7 });
const coral2Mat    = new THREE.MeshStandardMaterial({ color: "#EC407A", roughness: 0.7 });
const anemMat      = new THREE.MeshStandardMaterial({ color: "#CE93D8", roughness: 0.5 });
const tentMat      = new THREE.MeshStandardMaterial({ color: "#7B1FA2", roughness: 0.6 });
const wreckMat     = new THREE.MeshStandardMaterial({ color: "#4E342E", roughness: 1.0 });

// ── Forest obstacles ─────────────────────────────────────────────────────────

const PineTree = React.memo(({ position, scale = 1 }) => {
  const isAncient = scale > 1.5;
  return (
    <group position={[position.x, 0, position.y]} scale={[scale, scale * 1.2, scale]}>
      <mesh position={[0, 0.3, 0]} geometry={trunkGeo} material={trunkMat} castShadow />
      <mesh position={[0, 0.8, 0]} geometry={coneGeoLow} material={isAncient ? leafAncient : leafDark} castShadow />
      <mesh position={[0, 1.6, 0]} geometry={coneGeoMid} material={isAncient ? leafDark : leafLight} castShadow />
      {isAncient && <mesh position={[0, 2.2, 0]} geometry={coneGeoTop} material={leafBright} castShadow />}
    </group>
  );
});

const Rock = React.memo(({ position, scale = 1 }) => {
  const rotY = useMemo(() => Math.random() * Math.PI, []);
  return (
    <group position={[position.x, 0, position.y]} rotation={[0, rotY, 0]} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.3 * scale, 0]} geometry={rockGeo} material={rockMat} castShadow />
      <mesh position={[0.4, 0.2, 0.2]} geometry={rockDetailGeo} material={rockDetail} castShadow />
    </group>
  );
});

const Bush = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.3, 0]} geometry={bushGeoBig} material={bushMat1} castShadow />
    <mesh position={[0.3, 0.2, 0.1]} geometry={bushGeoMid} material={bushMat2} castShadow />
    <mesh position={[-0.2, 0.2, 0.2]} geometry={bushGeoSmall} material={bushMat3} castShadow />
    <mesh position={[0, 0.2, -0.3]} geometry={bushGeoMid} material={bushMat4} castShadow />
  </group>
));

// ── Desert obstacles ─────────────────────────────────────────────────────────

const Cactus = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.6, 0]} geometry={cactusBodyGeo} material={cactusMat} castShadow />
    <mesh position={[0.32, 0.65, 0]} rotation={[0, 0, -Math.PI / 4]} geometry={cactusArmGeo} material={cactusMat} castShadow />
    <mesh position={[-0.32, 0.8, 0]} rotation={[0, 0, Math.PI / 4]} geometry={cactusArmGeo} material={cactusMat} castShadow />
    {/* Spines */}
    {[-0.22, 0, 0.22].map((z, i) => (
      <mesh key={i} position={[0.26, 0.5 + i * 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.18, 4]} />
        <meshStandardMaterial color="#8BC34A" />
      </mesh>
    ))}
  </group>
));

const Dune = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, -0.3, position.y]} scale={[scale * 1.4, scale * 0.45, scale * 1.0]}>
    <mesh geometry={duneGeo} material={duneMat} castShadow />
  </group>
));

const Skull = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.35, 0]} geometry={skullGeo} material={boneMat} castShadow />
    {/* Eye sockets */}
    <mesh position={[-0.12, 0.4, 0.3]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    <mesh position={[0.12, 0.4, 0.3]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Jaw */}
    <mesh position={[0, 0.1, 0.2]} rotation={[0.3, 0, 0]}>
      <boxGeometry args={[0.45, 0.12, 0.25]} />
      <meshStandardMaterial color="#F5F5DC" roughness={0.8} />
    </mesh>
  </group>
));

// ── Arctic obstacles ─────────────────────────────────────────────────────────

const IceSpire = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.25, 0]} geometry={spireBase} material={iceMat} castShadow />
    <mesh position={[0, 1.05, 0]} geometry={spireGeo} material={iceMat} castShadow />
    {/* Inner glow crystal */}
    <mesh position={[0, 0.8, 0]} scale={[0.6, 0.6, 0.6]}>
      <octahedronGeometry args={[0.25]} />
      <meshStandardMaterial color="#E1F5FE" emissive="#B3E5FC" emissiveIntensity={0.4} roughness={0.05} transparent opacity={0.9} />
    </mesh>
  </group>
));

const Snowdrift = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, -0.25, position.y]} scale={[scale * 1.3, scale * 0.6, scale * 1.1]}>
    <mesh geometry={snowdriftGeo} material={snowMat} castShadow />
    <mesh position={[0.3, 0.15, 0.2]} scale={[0.7, 0.55, 0.7]}>
      <sphereGeometry args={[0.45, 8, 6]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.9} />
    </mesh>
  </group>
));

const FrozenLog = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0.1, position.y]} rotation={[0, Math.PI / 4, Math.PI / 2]} scale={[scale, scale, scale]}>
    <mesh geometry={logGeo} material={frozenLogMat} castShadow />
    {/* Ice coating */}
    <mesh scale={[1.06, 1.04, 1.06]}>
      <cylinderGeometry args={[0.19, 0.23, 1.22, 8]} />
      <meshStandardMaterial color="#E3F2FD" transparent opacity={0.4} roughness={0.05} />
    </mesh>
  </group>
));

// ── Volcano obstacles ─────────────────────────────────────────────────────────

const LavaRock = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.3, 0]} geometry={lavaRockGeo} material={lavaRockMat} castShadow />
    {/* Lava cracks glow */}
    <mesh position={[0.15, 0.35, 0.2]} scale={[0.4, 0.4, 0.4]}>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#FF6D00" emissive="#FF3D00" emissiveIntensity={0.8} roughness={0.4} />
    </mesh>
    <mesh position={[-0.2, 0.25, -0.1]} scale={[0.3, 0.3, 0.3]}>
      <dodecahedronGeometry args={[0.25, 0]} />
      <meshStandardMaterial color="#FF6D00" emissive="#FF3D00" emissiveIntensity={0.6} roughness={0.4} />
    </mesh>
  </group>
));

const Stalagmite = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.7, 0]} geometry={stalagGeo} material={ashMat} castShadow />
    <mesh position={[0.3, 0.45, 0.15]} rotation={[0.1, 0.3, 0.2]} scale={[0.65, 0.65, 0.65]}>
      <coneGeometry args={[0.15, 0.9, 6]} />
      <meshStandardMaterial color="#4E342E" roughness={0.95} />
    </mesh>
    {/* Base glow */}
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.28, 0.32, 0.1, 8]} />
      <meshStandardMaterial color="#BF360C" emissive="#FF3D00" emissiveIntensity={0.5} roughness={0.6} />
    </mesh>
  </group>
));

const AshPillar = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.55, 0]} geometry={ashPillarGeo} material={ashMat} castShadow />
    {/* Crumbled top */}
    <mesh position={[0, 1.12, 0]}>
      <cylinderGeometry args={[0.18, 0.24, 0.22, 8]} />
      <meshStandardMaterial color="#37474F" roughness={1.0} />
    </mesh>
    {/* Ember glow at base */}
    <mesh position={[0, 0.08, 0]}>
      <cylinderGeometry args={[0.3, 0.34, 0.12, 8]} />
      <meshStandardMaterial {...{ ...lavaRockMat }} color="#D84315" emissive="#FF3D00" emissiveIntensity={0.4} />
    </mesh>
  </group>
));

// ── Ocean obstacles ───────────────────────────────────────────────────────────

const Coral = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    {[[-0.1, 0.3, 0], [0.15, 0.5, 0.1], [-0.2, 0.55, -0.15], [0.05, 0.7, -0.1], [-0.05, 0.35, 0.2]].map(([x, y, z], i) => (
      <mesh key={i} position={[x, y, z]}>
        <cylinderGeometry args={[0.05 + i * 0.01, 0.09 + i * 0.01, 0.5 + i * 0.1, 6]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#FF7043" : "#EC407A"} roughness={0.7} />
      </mesh>
    ))}
    {/* Base */}
    <mesh position={[0, 0.06, 0]}>
      <cylinderGeometry args={[0.3, 0.35, 0.12, 8]} />
      <meshStandardMaterial color="#5D4037" roughness={0.9} />
    </mesh>
  </group>
));

const Anemone = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.3, 0]} geometry={anemoneBodyGeo} material={anemMat} castShadow />
    {/* Tentacles */}
    {Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(angle) * 0.28, 0.55, Math.sin(angle) * 0.28]}
          rotation={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}>
          <cylinderGeometry args={[0.03, 0.06, 0.45, 5]} />
          <meshStandardMaterial color="#9C27B0" roughness={0.6} />
        </mesh>
      );
    })}
  </group>
));

const Shipwreck = React.memo(({ position, scale = 1 }) => (
  <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
    {/* Hull planks at angles */}
    <mesh position={[0, 0.18, 0]} rotation={[0, 0.3, 0.15]}>
      <boxGeometry args={[1.0, 0.1, 0.22]} />
      <meshStandardMaterial color="#4E342E" roughness={1.0} />
    </mesh>
    <mesh position={[0.1, 0.28, 0.15]} rotation={[0.2, -0.2, 0.25]}>
      <boxGeometry args={[0.8, 0.08, 0.18]} />
      <meshStandardMaterial color="#3E2723" roughness={1.0} />
    </mesh>
    {/* Barnacles */}
    {[[0.3, 0.35, 0.12], [-0.25, 0.3, -0.1], [0, 0.4, 0.2]].map(([x, y, z], i) => (
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#78909C" roughness={0.9} />
      </mesh>
    ))}
  </group>
));

// ── Dispatcher ───────────────────────────────────────────────────────────────

const BiomeObstacles3D = React.memo(({ obstacles, biome = "forest" }) => (
  <>
    {obstacles.map((obs) => {
      const { type, id, scale } = obs;

      // Forest
      if (type === "tree")    return <PineTree   key={id} position={obs} scale={scale} />;
      if (type === "rock")    return <Rock       key={id} position={obs} scale={scale} />;
      if (type === "bush")    return <Bush       key={id} position={obs} scale={scale} />;

      // Desert
      if (type === "cactus")  return <Cactus     key={id} position={obs} scale={scale} />;
      if (type === "dune")    return <Dune       key={id} position={obs} scale={scale} />;
      if (type === "skull")   return <Skull      key={id} position={obs} scale={scale} />;

      // Arctic
      if (type === "ice_spire")   return <IceSpire   key={id} position={obs} scale={scale} />;
      if (type === "snowdrift")   return <Snowdrift  key={id} position={obs} scale={scale} />;
      if (type === "frozen_log")  return <FrozenLog  key={id} position={obs} scale={scale} />;

      // Volcano
      if (type === "lava_rock")   return <LavaRock   key={id} position={obs} scale={scale} />;
      if (type === "stalagmite")  return <Stalagmite key={id} position={obs} scale={scale} />;
      if (type === "ash_pillar")  return <AshPillar  key={id} position={obs} scale={scale} />;

      // Ocean
      if (type === "coral")       return <Coral      key={id} position={obs} scale={scale} />;
      if (type === "anemone")     return <Anemone    key={id} position={obs} scale={scale} />;
      if (type === "shipwreck")   return <Shipwreck  key={id} position={obs} scale={scale} />;

      // Fallback to pine tree
      return <PineTree key={id} position={obs} scale={scale} />;
    })}
  </>
));

export default BiomeObstacles3D;
