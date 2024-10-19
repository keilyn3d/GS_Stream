import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

const CameraControls = ({
  controlsRef,
  keysPressed,
  delta,
  rotationDelta,
  maxPanX,
  maxPanY,
  maxPanZ,
  setCameraPose,
}) => {
  const { camera } = useThree();

  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = camera;
      console.log('controlsRef.current set to camera:', camera);
    }
  }, [controlsRef, camera]);

  useFrame(() => {
    // Store previous camera position and quaternion before movement
    const prevCameraPosition = camera.position.clone();
    const prevCameraQuaternion = camera.quaternion.clone();

    // Calculate effective rotation delta based on delta
    const effectiveRotationDelta = delta * rotationDelta * 0.1;

    // Handle camera movement (q, e, a, w, s, d)
    if (keysPressed['KeyQ']) {
      camera.translateY(-delta); // Move Down
    }
    if (keysPressed['KeyE']) {
      camera.translateY(delta); // Move Up
    }
    if (keysPressed['KeyA']) {
      camera.translateX(-delta); // Move Left
    }
    if (keysPressed['KeyD']) {
      camera.translateX(delta); // Move Right
    }
    if (keysPressed['KeyW']) {
      camera.translateZ(-delta); // Move Forward
    }
    if (keysPressed['KeyS']) {
      camera.translateZ(delta); // Move Backward
    }

    // Handle camera rotation (u, o, j, l, k, i)
    // Calculate the local axis for rotation based on the camera's local space
    const localXAxis = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(camera.quaternion)
      .normalize();
    const localYAxis = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(camera.quaternion)
      .normalize();
    const localZAxis = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(camera.quaternion)
      .normalize();

    // Roll
    if (keysPressed['KeyU']) {
      console.log('KeyU pressed - Rolling Left');
      const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(
        localZAxis,
        effectiveRotationDelta,
      );
      camera.quaternion.multiplyQuaternions(rollQuaternion, camera.quaternion);
    }
    if (keysPressed['KeyO']) {
      console.log('KeyO pressed - Rolling Right');
      const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(
        localZAxis,
        -effectiveRotationDelta,
      );
      camera.quaternion.multiplyQuaternions(rollQuaternion, camera.quaternion);
    }

    // Yaw
    if (keysPressed['KeyJ']) {
      console.log('KeyJ pressed - Yaw Left');
      const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(
        localYAxis,
        effectiveRotationDelta,
      );
      camera.quaternion.multiplyQuaternions(yawQuaternion, camera.quaternion);
    }
    if (keysPressed['KeyL']) {
      console.log('KeyL pressed - Yaw Right');
      const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(
        localYAxis,
        -effectiveRotationDelta,
      );
      camera.quaternion.multiplyQuaternions(yawQuaternion, camera.quaternion);
    }

    // Pitch
    if (keysPressed['KeyK']) {
      console.log('KeyK pressed - Pitch Down');
      const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(
        localXAxis,
        -effectiveRotationDelta,
      );
      camera.quaternion.multiplyQuaternions(pitchQuaternion, camera.quaternion);
    }
    if (keysPressed['KeyI']) {
      console.log('KeyI pressed - Pitch Up');
      const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(
        localXAxis,
        effectiveRotationDelta,
      );
      camera.quaternion.multiplyQuaternions(pitchQuaternion, camera.quaternion);
    }

    // Normalize quaternion
    camera.quaternion.normalize();

    // Limit camera position
    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      -maxPanX,
      maxPanX,
    );
    camera.position.y = THREE.MathUtils.clamp(
      camera.position.y,
      -maxPanY,
      maxPanY,
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      -maxPanZ,
      maxPanZ,
    );

    // Restore previous state if clamped
    const isClamped =
      camera.position.x === -maxPanX ||
      camera.position.x === maxPanX ||
      camera.position.y === -maxPanY ||
      camera.position.y === maxPanY ||
      camera.position.z === -maxPanZ ||
      camera.position.z === maxPanZ;

    if (isClamped) {
      camera.position.copy(prevCameraPosition);
      camera.quaternion.copy(prevCameraQuaternion);
    }

    // Update pose data
    const poseData = {
      position: camera.position.clone(),
      rotation: {
        x: THREE.MathUtils.radToDeg(camera.rotation.x),
        y: THREE.MathUtils.radToDeg(camera.rotation.y),
        z: THREE.MathUtils.radToDeg(camera.rotation.z),
      },
    };
    if (setCameraPose) {
      setCameraPose(poseData);
    }
  });

  return null;
};

export default CameraControls;
