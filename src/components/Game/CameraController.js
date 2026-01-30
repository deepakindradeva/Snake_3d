// src/components/Game/CameraController.js
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";

const CameraController = ({ snakeHead, dir, mode }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtPos = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // Initial camera setup
    if (snakeHead) {
      camera.position.set(snakeHead.x, 15, snakeHead.y + 10);
    }
    // We intentionally ignore dependencies here because we only want
    // this to run ONCE on mount to set the start position.
    // Adding dependencies would cause the camera to snap-reset every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    if (!snakeHead) return;

    // 1. Determine Target Position based on Mode
    let desiredOffset = new THREE.Vector3();
    let desiredLookAtOffset = new THREE.Vector3();
    let smoothing = 4; // Higher = Snappier, Lower = Smoother

    switch (mode) {
      case "TOP":
        // High up, centered on snake, fixed orientation
        desiredOffset.set(0, 35, 10);
        desiredLookAtOffset.set(0, 0, 0);
        smoothing = 2; // Slower pan
        break;

      case "POV":
        // Inside the head, looking forward
        desiredOffset.set(dir.x * 0.5, 0.6, dir.y * 0.5);
        desiredLookAtOffset.set(dir.x * 5, 0, dir.y * 5); // Look far ahead
        smoothing = 10; // Must be fast to prevent motion sickness
        break;

      case "FOLLOW":
      default:
        // Behind and above
        desiredOffset.set(-dir.x * 6, 8, -dir.y * 6);
        desiredLookAtOffset.set(dir.x * 4, 0, dir.y * 4); // Look slightly ahead
        smoothing = 3; // Smooth cinematic follow
        break;
    }

    // 2. Calculate World Positions
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

    // 3. Smooth Interpolation (Lerp)
    targetPos.current.lerp(finalCamPos, delta * smoothing);
    lookAtPos.current.lerp(finalLookAt, delta * smoothing);

    // 4. Apply to Camera
    camera.position.copy(targetPos.current);
    camera.lookAt(lookAtPos.current);
  });

  return null;
};

export default CameraController;
