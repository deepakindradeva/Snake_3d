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
        // We ignore 'dir' so the map doesn't spin
        desiredOffset.set(0, 35, 10);
        desiredLookAtOffset.set(0, 0, 0);
        smoothing = 2; // Slower pan
        break;

      case "POV":
        // Inside the head, looking forward
        // We place camera slightly in front and above eyes
        desiredOffset.set(dir.x * 0.5, 0.6, dir.y * 0.5);
        desiredLookAtOffset.set(dir.x * 5, 0, dir.y * 5); // Look far ahead
        smoothing = 10; // Must be fast to prevent motion sickness
        break;

      case "FOLLOW":
      default:
        // Behind and above
        // We calculate "Behind" by inverting the direction
        desiredOffset.set(-dir.x * 6, 8, -dir.y * 6);
        desiredLookAtOffset.set(dir.x * 4, 0, dir.y * 4); // Look slightly ahead
        smoothing = 3; // Smooth cinematic follow
        break;
    }

    // 2. Calculate World Positions
    // Target Camera Position
    const finalCamPos = new THREE.Vector3(
      snakeHead.x + desiredOffset.x,
      desiredOffset.y, // Y is usually absolute, not relative to head Y (unless jumping)
      snakeHead.y + desiredOffset.z,
    );

    // Target Look-At Point
    const finalLookAt = new THREE.Vector3(
      snakeHead.x + desiredLookAtOffset.x,
      0,
      snakeHead.y + desiredLookAtOffset.z,
    );

    // 3. Smooth Interpolation (Lerp)
    // We smooth the current ref values, then apply to camera
    targetPos.current.lerp(finalCamPos, delta * smoothing);
    lookAtPos.current.lerp(finalLookAt, delta * smoothing);

    // 4. Apply to Camera
    camera.position.copy(targetPos.current);
    camera.lookAt(lookAtPos.current);
  });

  return null;
};

export default CameraController;
