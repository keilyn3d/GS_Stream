import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CameraControls = ({
  orbitControlsRef,
  keysPressed,
  delta,
  rotationDelta,
  maxPanX,
  maxPanY,
  maxPanZ,
}) => {
  useFrame(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      const camera = controls.object;

      // **Store previous camera and target positions before movement**
      const prevCameraPosition = camera.position.clone();
      const prevTargetPosition = controls.target.clone();

      // Camera movement handling (q, e, a, w, s, d)
      if (keysPressed['KeyQ']) {
        // Move camera down (negative Y-axis)
        camera.position.y -= delta;
        controls.target.y -= delta;
      }
      if (keysPressed['KeyE']) {
        // Move camera up (positive Y-axis)
        camera.position.y += delta;
        controls.target.y += delta;
      }
      if (keysPressed['KeyA']) {
        // Move camera left (negative X-axis)
        camera.position.x -= delta;
        controls.target.x -= delta;
      }
      if (keysPressed['KeyD']) {
        // Move camera right (positive X-axis)
        camera.position.x += delta;
        controls.target.x += delta;
      }
      if (keysPressed['KeyW']) {
        // Move camera forward (negative Z-axis)
        camera.position.z -= delta;
        controls.target.z -= delta;
      }
      if (keysPressed['KeyS']) {
        // Move camera backward (positive Z-axis)
        camera.position.z += delta;
        controls.target.z += delta;
      }

      // Get current azimuthal and polar angles
      const azimuthalAngle = controls.getAzimuthalAngle(); // Horizontal angle (rotation around Y-axis)
      const polarAngle = controls.getPolarAngle(); // Vertical angle (rotation around X-axis)

      // Camera rotation handling (u, o, j, l, k, i)
      if (keysPressed['KeyU']) {
        // Rotate camera counter-clockwise around Z-axis
        camera.up.applyAxisAngle(
          camera.getWorldDirection(new THREE.Vector3()),
          -rotationDelta,
        );
        camera.updateProjectionMatrix();
      }
      if (keysPressed['KeyO']) {
        // Rotate camera clockwise around Z-axis
        camera.up.applyAxisAngle(
          camera.getWorldDirection(new THREE.Vector3()),
          rotationDelta,
        );
        camera.updateProjectionMatrix();
      }
      if (keysPressed['KeyJ']) {
        // Rotate camera left (decrease azimuthal angle)
        controls.setAzimuthalAngle(azimuthalAngle - rotationDelta);
      }
      if (keysPressed['KeyL']) {
        // Rotate camera right (increase azimuthal angle)
        controls.setAzimuthalAngle(azimuthalAngle + rotationDelta);
      }
      if (keysPressed['KeyK']) {
        // Rotate camera up (decrease polar angle)
        controls.setPolarAngle(polarAngle - rotationDelta);
      }
      if (keysPressed['KeyI']) {
        // Rotate camera down (increase polar angle)
        controls.setPolarAngle(polarAngle + rotationDelta);
      }

      // **Store target position before clamping (after movement and rotation)**
      const targetPositionBeforeClamping = controls.target.clone();

      // **Clamp camera target to limit panning range**
      controls.target.x = Math.max(
        -maxPanX,
        Math.min(maxPanX, controls.target.x),
      );
      controls.target.y = Math.max(
        -maxPanY,
        Math.min(maxPanY, controls.target.y),
      );
      controls.target.z = Math.max(
        -maxPanZ,
        Math.min(maxPanZ, controls.target.z),
      );

      // **Check if clamping occurred by comparing target positions**
      const isTargetClamped = !controls.target.equals(
        targetPositionBeforeClamping,
      );

      // **If panning limit is reached, revert to previous camera and target positions**
      if (isTargetClamped) {
        camera.position.copy(prevCameraPosition);
        controls.target.copy(prevTargetPosition);
      }

      // Update controls to apply changes
      controls.update();
    }
  });

  return null;
};

export default CameraControls;
