// src/components/Game/CameraController.js
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";

const CameraController = ({ snakeHead, dir }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtPos = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (snakeHead) {
      camera.position.set(snakeHead.x - dir.x * 6, 8, snakeHead.y - dir.y * 6);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    if (!snakeHead || !dir) return;

    // Third-person trailing perspective: Behind and above the snake
    const desiredOffset = new THREE.Vector3(-dir.x * 6, 8, -dir.y * 6);
    const desiredLookAtOffset = new THREE.Vector3(dir.x * 4, 0, dir.y * 4);

    const finalCamPos = new THREE.Vector3(
      snakeHead.x + desiredOffset.x,
      desiredOffset.y,
      snakeHead.y + desiredOffset.z,
    );

    const finalLookAt = new THREE.Vector3(
      snakeHead.x + desiredLookAtOffset.x,
      0,
      snakeHead.y + desiredLookAtOffset.z,
    );

    // Smooth Interpolation
    targetPos.current.lerp(finalCamPos, delta * 3);
    lookAtPos.current.lerp(finalLookAt, delta * 3);

    // Apply to Camera
    camera.position.copy(targetPos.current);
    camera.lookAt(lookAtPos.current);
  });

  return null;
};

export default CameraController;
