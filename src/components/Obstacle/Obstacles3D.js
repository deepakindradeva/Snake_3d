// src/components/Obstacle/Obstacles3D.js
import React, { useMemo } from "react";
import * as THREE from "three";

// 🌲 GRAND PINE TREE
const PineTree = ({ position, scale = 1 }) => {
  // Use scale to make taller trees
  // If scale is huge (>1.5), we make the foliage darker to look "ancient"
  const isAncient = scale > 1.5;
  const color1 = isAncient ? "#1B5E20" : "#2E7D32";
  const color2 = isAncient ? "#2E7D32" : "#43A047";

  return (
    <group
      position={[position.x, 0, position.y]}
      scale={[scale, scale * 1.2, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 0.6]} />
        <meshStandardMaterial color="#3E2723" />
      </mesh>

      {/* Layers of leaves */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[0.8, 1.2, 8]} />
        <meshStandardMaterial color={color1} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.6, 1.0, 8]} />
        <meshStandardMaterial color={color2} />
      </mesh>

      {/* Ancient trees get a 3rd top layer */}
      {isAncient && (
        <mesh position={[0, 2.2, 0]} castShadow>
          <coneGeometry args={[0.4, 0.8, 8]} />
          <meshStandardMaterial color="#66BB6A" />
        </mesh>
      )}
    </group>
  );
};

// 🪨 GRAND ROCK
const Rock = ({ position, scale = 1 }) => {
  // Random rotation for variety
  const rotY = useMemo(() => Math.random() * Math.PI, []);

  return (
    <group
      position={[position.x, 0, position.y]}
      rotation={[0, rotY, 0]}
      scale={[scale, scale, scale]}>
      {/* Main Boulder */}
      <mesh position={[0, 0.3 * scale, 0]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#78909C" roughness={0.9} />
      </mesh>
      {/* Smaller Detail Rock */}
      <mesh position={[0.4, 0.2, 0.2]} castShadow>
        <dodecahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#607D8B" roughness={0.9} />
      </mesh>
    </group>
  );
};

// 🌳 DENSE BUSH
const Bush = ({ position, scale = 1 }) => {
  return (
    <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#66BB6A" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.1]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.2]} castShadow>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#81C784" />
      </mesh>
      <mesh position={[0, 0.2, -0.3]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#388E3C" />
      </mesh>
    </group>
  );
};

const Obstacles3D = React.memo(({ obstacles }) => (
  <>
    {obstacles.map((obs) => {
      // Pass the scale property to the components
      if (obs.type === "rock")
        return <Rock key={obs.id} position={obs} scale={obs.scale} />;
      if (obs.type === "bush")
        return <Bush key={obs.id} position={obs} scale={obs.scale} />;
      return <PineTree key={obs.id} position={obs} scale={obs.scale} />;
    })}
  </>
));

export default Obstacles3D;
