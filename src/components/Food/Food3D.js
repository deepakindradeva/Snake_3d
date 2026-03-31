// src/components/Food/Food3D.js
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Forest fruit models ─────────────────────────────────────────────────────

const Apple = () => (
  <group>
    <mesh position={[0, 0.4, 0]} castShadow>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color="#D32F2F" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.3]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
  </group>
);

const Banana = () => (
  <group scale={0.6}>
    <mesh position={[0, 0.4, 0]}>
      <sphereGeometry args={[0.4, 12, 8]} />
      <meshStandardMaterial color="#FFEB3B" roughness={0.2} />
    </mesh>
  </group>
);

const Cherry = () => (
  <group scale={0.6}>
    <mesh position={[0, 0.4, 0]}>
      <sphereGeometry args={[0.4, 12, 8]} />
      <meshStandardMaterial color="#880E4F" roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.3]} />
      <meshStandardMaterial color="#33691E" />
    </mesh>
  </group>
);

const IceCube = () => (
  <mesh position={[0, 0.4, 0]}>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <meshStandardMaterial color="cyan" opacity={0.7} transparent roughness={0} metalness={0.9} />
  </mesh>
);

const Mushroom = () => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 0.4]} />
      <meshStandardMaterial color="#FFF3E0" />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <coneGeometry args={[0.5, 0.4, 16]} />
      <meshStandardMaterial color="#E53935" />
    </mesh>
    <mesh position={[0.2, 0.55, 0.2]}><sphereGeometry args={[0.08]} /><meshStandardMaterial color="white" /></mesh>
    <mesh position={[-0.2, 0.6, -0.1]}><sphereGeometry args={[0.08]} /><meshStandardMaterial color="white" /></mesh>
  </group>
);

const Star = () => (
  <mesh position={[0, 0.5, 0]} castShadow>
    <dodecahedronGeometry args={[0.4, 0]} />
    <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.6} roughness={0.1} metalness={0.8} />
  </mesh>
);

const ShieldIcon = () => (
  <group position={[0, 0.5, 0]}>
    <mesh>
      <cylinderGeometry args={[0.4, 0.4, 0.1, 3]} />
      <meshStandardMaterial color="#2979FF" metalness={0.5} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0, 0.06]}><boxGeometry args={[0.4, 0.2, 0.05]} /><meshStandardMaterial color="white" /></mesh>
    <mesh position={[0, 0, 0.06]}><boxGeometry args={[0.15, 0.5, 0.05]} /><meshStandardMaterial color="white" /></mesh>
  </group>
);

const Magnet = () => (
  <group position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
    <mesh position={[0, 0.25, 0]}><boxGeometry args={[0.2, 0.3, 0.2]} /><meshStandardMaterial color="#D32F2F" /></mesh>
    <mesh position={[0, -0.25, 0]}><boxGeometry args={[0.2, 0.3, 0.2]} /><meshStandardMaterial color="#D32F2F" /></mesh>
    <mesh position={[-0.2, 0, 0]}><boxGeometry args={[0.2, 0.8, 0.2]} /><meshStandardMaterial color="#B0BEC5" /></mesh>
  </group>
);

// ─── Desert fruit models ─────────────────────────────────────────────────────

const Date = () => (
  <group position={[0, 0.4, 0]}>
    <mesh scale={[0.65, 1.2, 0.65]}>
      <sphereGeometry args={[0.35, 10, 8]} />
      <meshStandardMaterial color="#795548" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.44, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.18]} />
      <meshStandardMaterial color="#4E342E" />
    </mesh>
  </group>
);

const CactusFruit = () => (
  <group position={[0, 0.4, 0]}>
    <mesh scale={[0.7, 0.9, 0.7]}>
      <sphereGeometry args={[0.38, 10, 8]} />
      <meshStandardMaterial color="#E91E63" roughness={0.4} />
    </mesh>
    {[0, 1.2, 2.4, 3.6, 4.8].map((a, i) => (
      <mesh key={i} position={[Math.cos(a) * 0.3, Math.sin(i * 0.7) * 0.1, Math.sin(a) * 0.3]}>
        <sphereGeometry args={[0.06, 5, 5]} />
        <meshStandardMaterial color="#FCE4EC" />
      </mesh>
    ))}
  </group>
);

const Mirage = () => (
  <mesh position={[0, 0.45, 0]}>
    <icosahedronGeometry args={[0.35, 0]} />
    <meshStandardMaterial color="#80DEEA" emissive="#00E5FF" emissiveIntensity={0.6} roughness={0} metalness={0.5} transparent opacity={0.75} />
  </mesh>
);

const Scarab = () => (
  <group position={[0, 0.35, 0]}>
    <mesh scale={[1.1, 0.5, 1.4]}>
      <sphereGeometry args={[0.32, 10, 8]} />
      <meshStandardMaterial color="#1B5E20" roughness={0.3} metalness={0.6} />
    </mesh>
    {[-0.2, 0.2].map((x, i) => (
      <mesh key={i} position={[x, 0.05, 0]} rotation={[0, 0, x > 0 ? -0.4 : 0.4]}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.4} metalness={0.5} />
      </mesh>
    ))}
    <mesh position={[0, 0.08, 0.28]} rotation={[0.3, 0, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.22]} />
      <meshStandardMaterial color="#33691E" />
    </mesh>
  </group>
);

// ─── Arctic fruit models ─────────────────────────────────────────────────────

const Snowberry = () => (
  <group position={[0, 0.38, 0]}>
    {[[0,0,0],[0.18,0.1,0.1],[-0.16,0.08,-0.12],[0.1,-0.1,0.2]].map(([x,y,z],i) => (
      <mesh key={i} position={[x,y,z]}>
        <sphereGeometry args={[0.18 - i * 0.02, 8, 8]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.2} />
      </mesh>
    ))}
  </group>
);

const Icicle = () => (
  <group position={[0, 0.1, 0]}>
    {[-0.1, 0, 0.1].map((x, i) => (
      <mesh key={i} position={[x, 0.4 + i * 0.12, 0]}>
        <coneGeometry args={[0.07 - i * 0.01, 0.5 + i * 0.1, 5]} />
        <meshStandardMaterial color="#B3E5FC" roughness={0.05} metalness={0.3} transparent opacity={0.85} />
      </mesh>
    ))}
  </group>
);

const AuroraShard = () => (
  <group position={[0, 0.1, 0]}>
    <mesh position={[0, 0.5, 0]}>
      <octahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color="#80D8FF" emissive="#00B0FF" emissiveIntensity={0.9} roughness={0.05} transparent opacity={0.9} />
    </mesh>
    <mesh position={[0, 0.5, 0]} scale={[1.15, 1.15, 1.15]}>
      <octahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color="#E1F5FE" emissive="#40C4FF" emissiveIntensity={0.3} roughness={0.0} transparent opacity={0.3} side={THREE.BackSide} />
    </mesh>
  </group>
);

const HotCocoa = () => (
  <group position={[0, 0.2, 0]}>
    <mesh>
      <cylinderGeometry args={[0.3, 0.25, 0.5, 10]} />
      <meshStandardMaterial color="#5D4037" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.28, 0]}>
      <cylinderGeometry args={[0.28, 0.28, 0.06, 10]} />
      <meshStandardMaterial color="#4E342E" roughness={0.4} />
    </mesh>
    {/* Steam */}
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.2, 8, 6]} />
      <meshStandardMaterial color="#FAFAFA" transparent opacity={0.25} roughness={1.0} />
    </mesh>
    {/* Handle */}
    <mesh position={[0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.12, 0.03, 6, 12, Math.PI]} />
      <meshStandardMaterial color="#5D4037" roughness={0.6} />
    </mesh>
  </group>
);

// ─── Volcano fruit models ────────────────────────────────────────────────────

const EmberFruit = () => (
  <mesh position={[0, 0.4, 0]}>
    <sphereGeometry args={[0.38, 14, 14]} />
    <meshStandardMaterial color="#FF7043" emissive="#FF3D00" emissiveIntensity={0.7} roughness={0.3} />
  </mesh>
);

const MagmaCrystal = () => (
  <group position={[0, 0.1, 0]}>
    <mesh position={[0, 0.45, 0]}>
      <octahedronGeometry args={[0.38, 0]} />
      <meshStandardMaterial color="#B71C1C" emissive="#FF1744" emissiveIntensity={1.0} roughness={0.1} metalness={0.3} />
    </mesh>
    <pointLight position={[0, 0.45, 0]} color="#FF1744" intensity={1.5} distance={4} decay={2} />
  </group>
);

const PhoenixFeather = () => (
  <group position={[0, 0.2, 0]}>
    <mesh position={[0, 0.5, 0]} scale={[0.3, 1.2, 0.3]}>
      <capsuleGeometry args={[0.2, 0.5, 6, 12]} />
      <meshStandardMaterial color="#FF6D00" emissive="#FF3D00" emissiveIntensity={0.8} roughness={0.1} />
    </mesh>
    {[-0.15, 0.15].map((x, i) => (
      <mesh key={i} position={[x, 0.6, 0]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]} scale={[0.4, 0.9, 0.2]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color="#FFCA28" emissive="#FF6D00" emissiveIntensity={0.6} roughness={0.1} transparent opacity={0.8} />
      </mesh>
    ))}
  </group>
);

const Brimstone = () => (
  <group position={[0, 0.35, 0]}>
    <mesh>
      <dodecahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color="#37474F" roughness={0.95} />
    </mesh>
    <mesh scale={[1.1, 1.1, 1.1]}>
      <dodecahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color="#FF6F00" emissive="#FF6D00" emissiveIntensity={0.25} roughness={0.8} transparent opacity={0.3} />
    </mesh>
  </group>
);

// ─── Ocean fruit models ──────────────────────────────────────────────────────

const SeaGrape = () => (
  <group position={[0, 0.3, 0]}>
    {[[0,0.1,0],[0.16,0.25,0.08],[-0.14,0.2,-0.1],[0.08,0.38,0.12],[-0.1,0.35,-0.08]].map(([x,y,z],i) => (
      <mesh key={i} position={[x,y,z]}>
        <sphereGeometry args={[0.14 - i * 0.01, 8, 8]} />
        <meshStandardMaterial color="#7B1FA2" roughness={0.3} />
      </mesh>
    ))}
  </group>
);

const Kelp = () => (
  <group position={[0, 0.1, 0]}>
    {[0, 0.22, 0.42, 0.6].map((y, i) => (
      <mesh key={i} position={[Math.sin(i * 1.1) * 0.08, y, Math.cos(i * 0.9) * 0.06]}>
        <sphereGeometry args={[0.14, 7, 7]} />
        <meshStandardMaterial color="#388E3C" roughness={0.5} />
      </mesh>
    ))}
  </group>
);

const Pearl = () => (
  <mesh position={[0, 0.4, 0]}>
    <sphereGeometry args={[0.36, 16, 16]} />
    <meshStandardMaterial color="#F5F5F5" roughness={0.05} metalness={0.9} envMapIntensity={2} />
  </mesh>
);

const SeaStar = () => (
  <group position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
    {Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return (
        <mesh key={i} position={[Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0]}>
          <capsuleGeometry args={[0.07, 0.28, 4, 6]} />
          <meshStandardMaterial color="#FFD740" emissive="#FF6D00" emissiveIntensity={0.3} roughness={0.4} />
        </mesh>
      );
    })}
    <mesh>
      <cylinderGeometry args={[0.14, 0.14, 0.08, 10]} />
      <meshStandardMaterial color="#FF8F00" roughness={0.4} />
    </mesh>
  </group>
);

// ─── Light color lookup ──────────────────────────────────────────────────────
const LIGHT_COLORS = {
  apple: "#FFEB3B", banana: "#FFEB3B", cherry: "#FF4081", ice: "#00E5FF",
  mushroom: "#FFEB3B", star: "#FFD700", shield: "#2979FF", magnet: "#FF1744",
  // Desert
  date: "#FFCC80", cactus_fruit: "#E91E63", mirage: "#00E5FF", scarab: "#76FF03",
  // Arctic
  snowberry: "#E3F2FD", icicle: "#80D8FF", aurora_shard: "#40C4FF", hot_cocoa: "#FFCC80",
  // Volcano
  ember_fruit: "#FF6D00", magma_crystal: "#FF1744", phoenix_feather: "#FFCA28", brimstone: "#FF6F00",
  // Ocean
  sea_grape: "#CE93D8", kelp: "#66BB6A", pearl: "#E0E0E0", sea_star: "#FFD740",
};

// ─── Main component ──────────────────────────────────────────────────────────
const Food3D = ({ position, type }) => {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.03;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.15 + 0.2;
    }
  });

  const lightColor = LIGHT_COLORS[type] || "#FFEB3B";

  const renderModel = () => {
    switch (type) {
      // Forest
      case "apple":    return <Apple />;
      case "banana":   return <Banana />;
      case "cherry":   return <Cherry />;
      case "ice":      return <IceCube />;
      case "mushroom": return <Mushroom />;
      case "star":     return <Star />;
      case "shield":   return <ShieldIcon />;
      case "magnet":   return <Magnet />;
      // Desert
      case "date":         return <Date />;
      case "cactus_fruit": return <CactusFruit />;
      case "mirage":       return <Mirage />;
      case "scarab":       return <Scarab />;
      // Arctic
      case "snowberry":    return <Snowberry />;
      case "icicle":       return <Icicle />;
      case "aurora_shard": return <AuroraShard />;
      case "hot_cocoa":    return <HotCocoa />;
      // Volcano
      case "ember_fruit":     return <EmberFruit />;
      case "magma_crystal":   return <MagmaCrystal />;
      case "phoenix_feather": return <PhoenixFeather />;
      case "brimstone":       return <Brimstone />;
      // Ocean
      case "sea_grape": return <SeaGrape />;
      case "kelp":      return <Kelp />;
      case "pearl":     return <Pearl />;
      case "sea_star":  return <SeaStar />;
      default:          return <Apple />;
    }
  };

  return (
    <group position={[position.x, 0, position.y]}>
      <pointLight position={[0, 0.5, 0]} intensity={2} distance={8} decay={2} color={lightColor} />
      {/* Beacon beam */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.05, 0.3, 20, 8]} />
        <meshBasicMaterial color={lightColor} transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <group ref={ref} scale={1.5}>
        {renderModel()}
      </group>
    </group>
  );
};

export default Food3D;
