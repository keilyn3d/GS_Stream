// src/components/View/WebGL/Single/CameraControls.js
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

const CameraControls = ({
  controlsRef, // 카메라 참조용
  keysPressed,
  delta,
  rotationDelta,
  maxPanX,
  maxPanY,
  maxPanZ,
  setCameraPose,
}) => {
  const { camera } = useThree();

  // 카메라를 controlsRef.current에 할당
  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = camera;
      console.log('controlsRef.current set to camera:', camera);
    }
  }, [controlsRef, camera]);

  useFrame(() => {
    // **Store previous camera position and quaternion before movement**
    const prevCameraPosition = camera.position.clone();
    const prevCameraQuaternion = camera.quaternion.clone();

    // **Calculate effective rotation delta based on delta**
    const effectiveRotationDelta = delta * rotationDelta * 0.1;

    // **카메라 이동 처리 (q, e, a, w, s, d)**
    if (keysPressed['KeyQ']) {
      camera.translateY(-delta); // 아래로 이동
    }
    if (keysPressed['KeyE']) {
      camera.translateY(delta); // 위로 이동
    }
    if (keysPressed['KeyA']) {
      camera.translateX(-delta); // 왼쪽으로 이동
    }
    if (keysPressed['KeyD']) {
      camera.translateX(delta); // 오른쪽으로 이동
    }
    if (keysPressed['KeyW']) {
      camera.translateZ(-delta); // 앞으로 이동
    }
    if (keysPressed['KeyS']) {
      camera.translateZ(delta); // 뒤로 이동
    }

    // **카메라 회전 처리 (u, o, j, l, k, i)**
    // 로컬 축을 기준으로 회전하기 위해 현재 카메라의 로컬 축을 계산
    const localXAxis = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(camera.quaternion)
      .normalize();
    const localYAxis = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(camera.quaternion)
      .normalize();
    const localZAxis = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(camera.quaternion)
      .normalize();

    // **Roll**
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

    // **Yaw**
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

    // **Pitch**
    if (keysPressed['KeyK']) {
      console.log('KeyK pressed - Pitch Up');
      const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(
        localXAxis,
        effectiveRotationDelta,
      );
      camera.quaternion.multiplyQuaternions(pitchQuaternion, camera.quaternion);
    }
    if (keysPressed['KeyI']) {
      console.log('KeyI pressed - Pitch Down');
      const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(
        localXAxis,
        -effectiveRotationDelta,
      );
      camera.quaternion.multiplyQuaternions(pitchQuaternion, camera.quaternion);
    }

    // **Quaternion 정규화**
    camera.quaternion.normalize();

    // **카메라 위치 제한**
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

    // **위치 제한 시 이전 상태로 복구**
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

    // **Pose 데이터 업데이트**
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
