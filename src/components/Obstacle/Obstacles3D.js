// src/components/Obstacle/Obstacles3D.js
import React, { useMemo } from "react";
import * as THREE from "three";

// --- 1. DEFINE RESOURCES GLOBALLY (Created only ONCE) ---
// Shared Geometries
const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 0.6, 6); // Reduced segments to 6
const coneGeoLow = new THREE.ConeGeometry(0.8, 1.2, 7);
const coneGeoMid = new THREE.ConeGeometry(0.6, 1.0, 7);
const coneGeoTop = new THREE.ConeGeometry(0.4, 0.8, 7);
const rockGeo = new THREE.DodecahedronGeometry(0.5, 0);
const rockDetailGeo = new THREE.DodecahedronGeometry(0.25, 0);
const bushGeoBig = new THREE.SphereGeometry(0.4, 6, 6); // Low poly spheres
const bushGeoMid = new THREE.SphereGeometry(0.3, 6, 6);
const bushGeoSmall = new THREE.SphereGeometry(0.35, 6, 6);

// Shared Materials
const trunkMat = new THREE.MeshStandardMaterial({ color: "#3E2723" });
const leafMatLight = new THREE.MeshStandardMaterial({ color: "#43A047" });
const leafMatDark = new THREE.MeshStandardMaterial({ color: "#2E7D32" });
const leafMatAncient = new THREE.MeshStandardMaterial({ color: "#1B5E20" });
const rockMat = new THREE.MeshStandardMaterial({
  color: "#78909C",
  roughness: 0.9,
});
const rockDetailMat = new THREE.MeshStandardMaterial({
  color: "#607D8B",
  roughness: 0.9,
});
const bushMat1 = new THREE.MeshStandardMaterial({ color: "#66BB6A" });
const bushMat2 = new THREE.MeshStandardMaterial({ color: "#4CAF50" });
const bushMat3 = new THREE.MeshStandardMaterial({ color: "#81C784" });
const bushMat4 = new THREE.MeshStandardMaterial({ color: "#388E3C" });

// --- 2. COMPONENTS USE SHARED RESOURCES ---

const PineTree = React.memo(({ position, scale = 1 }) => {
  const isAncient = scale > 1.5;
  // Pick shared material based on logic, don't create new ones!
  const mat1 = isAncient ? leafMatAncient : leafMatDark;
  const mat2 = isAncient ? leafMatDark : leafMatLight;

  return (
    <group
      position={[position.x, 0, position.y]}
      scale={[scale, scale * 1.2, scale]}>
      <mesh
        position={[0, 0.3, 0]}
        geometry={trunkGeo}
        material={trunkMat}
        castShadow
      />
      <mesh
        position={[0, 0.8, 0]}
        geometry={coneGeoLow}
        material={mat1}
        castShadow
      />
      <mesh
        position={[0, 1.6, 0]}
        geometry={coneGeoMid}
        material={mat2}
        castShadow
      />
      {isAncient && (
        <mesh
          position={[0, 2.2, 0]}
          geometry={coneGeoTop}
          material={bushMat1}
          castShadow
        />
      )}
    </group>
  );
});

const Rock = React.memo(({ position, scale = 1 }) => {
  const rotY = useMemo(() => Math.random() * Math.PI, []);

  return (
    <group
      position={[position.x, 0, position.y]}
      rotation={[0, rotY, 0]}
      scale={[scale, scale, scale]}>
      <mesh
        position={[0, 0.3 * scale, 0]}
        geometry={rockGeo}
        material={rockMat}
        castShadow
      />
      <mesh
        position={[0.4, 0.2, 0.2]}
        geometry={rockDetailGeo}
        material={rockDetailMat}
        castShadow
      />
    </group>
  );
});

const Bush = React.memo(({ position, scale = 1 }) => {
  return (
    <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
      <mesh
        position={[0, 0.3, 0]}
        geometry={bushGeoBig}
        material={bushMat1}
        castShadow
      />
      <mesh
        position={[0.3, 0.2, 0.1]}
        geometry={bushGeoMid}
        material={bushMat2}
        castShadow
      />
      <mesh
        position={[-0.2, 0.2, 0.2]}
        geometry={bushGeoSmall}
        material={bushMat3}
        castShadow
      />
      <mesh
        position={[0, 0.2, -0.3]}
        geometry={bushGeoMid}
        material={bushMat4}
        castShadow
      />
    </group>
  );
});

const Obstacles3D = React.memo(({ obstacles }) => (
  <>
    {obstacles.map((obs) => {
      if (obs.type === "rock")
        return <Rock key={obs.id} position={obs} scale={obs.scale} />;
      if (obs.type === "bush")
        return <Bush key={obs.id} position={obs} scale={obs.scale} />;
      return <PineTree key={obs.id} position={obs} scale={obs.scale} />;
    })}
  </>
));

export default Obstacles3D;
