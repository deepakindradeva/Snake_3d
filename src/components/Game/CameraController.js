// src/components/Game/CameraController.js
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

const CameraController = ({ snakeHead, dir }) => {
  const { camera } = useThree();

  // Settings for the camera view
  const DISTANCE_BEHIND = 12; // How far back the camera sits
  const CAMERA_HEIGHT = 6; // How high the camera sits
  const LOOK_AHEAD = 4; // Look slightly in front of the head

  useFrame((state, delta) => {
    if (!snakeHead || !dir) return;

    // 1. Calculate where the camera SHOULD be (Ideal Position)
    // We want to be behind the snake, so we subtract the direction vector
    // Note: In 3D, 'y' from logic is 'z' on screen.
    const idealOffset = new Vector3(
      -dir.x * DISTANCE_BEHIND,
      CAMERA_HEIGHT,
      -dir.y * DISTANCE_BEHIND,
    );

    const targetPos = new Vector3(snakeHead.x, 0, snakeHead.y).add(idealOffset);

    // 2. Smoothly move camera to that position (Lerp)
    // 'delta * 2' controls the swing speed.
    camera.position.lerp(targetPos, delta * 2.5);

    // 3. Look at a point slightly in front of the snake
    const targetLookAt = new Vector3(
      snakeHead.x + dir.x * LOOK_AHEAD,
      0,
      snakeHead.y + dir.y * LOOK_AHEAD,
    );

    // Smoothly rotate the camera to look at the target
    // We cheat slightly by using an invisible dummy vector to lerp the 'lookAt'
    const currentLookAt = camera.userData.currentLookAt || new Vector3();
    currentLookAt.lerp(targetLookAt, delta * 3);
    camera.lookAt(currentLookAt);

    // Store the current lookAt for the next frame smoothing
    camera.userData.currentLookAt = currentLookAt;
  });

  return null;
};

export default CameraController;
