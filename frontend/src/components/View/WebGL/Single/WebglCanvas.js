// src/components/View/WebGL/Single/WebglCanvas.js
import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraControls from './CameraControls';
import SplatComponent from 'components/SplatComponent';
import { Environment, OrbitControls } from '@react-three/drei';
import KeyDisplay from './KeyDisplay';
import * as THREE from 'three';

const WebglCanvas = ({
  controlsRef,
  delta,
  rotationDelta,
  handleResetCamera,
  splatUrl,
}) => {
  const orbitControlsRef = useRef(null);
  const [keysPressed, setKeysPressed] = useState({});

  // // delta와 rotationDelta 상태 관리
  // const [delta, setDelta] = useState(0.5);
  // const [rotationDelta, setRotationDelta] = useState(0.05);

  // 카메라의 초기 위치와 타겟 저장
  const initialCameraPosition = useRef(new THREE.Vector3(0, 0, 10)); // 예시 초기 위치
  const initialTargetPosition = useRef(new THREE.Vector3(0, 0, 0)); // 예시 초기 타겟

  // useEffect(() => {
  //   // Pass the resetCamera function to the parent component if handleResetCamera is provided
  //   if (handleResetCamera) {
  //     handleResetCamera(() => resetCamera());
  //   }
  // }, [handleResetCamera]);

  useEffect(() => {
    if (handleResetCamera) {
      handleResetCamera(() => {
        if (orbitControlsRef.current) {
          const controls = orbitControlsRef.current;
          controls.object.position.copy(initialCameraPosition.current);
          controls.target.copy(initialTargetPosition.current);
          controls.update();
        }
      });
    }
  }, [handleResetCamera]);

  useEffect(() => {
    // Function to handle key down events
    const handleKeyDown = (event) => {
      setKeysPressed((prevKeys) => ({ ...prevKeys, [event.code]: true }));
    };

    // Function to handle key up events
    const handleKeyUp = (event) => {
      setKeysPressed((prevKeys) => ({ ...prevKeys, [event.code]: false }));
    };

    // Add event listeners for keydown and keyup
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // // 카메라 리셋 함수
  // const resetCamera = () => {
  //   if (orbitControlsRef.current) {
  //     const controls = orbitControlsRef.current;
  //     controls.object.position.copy(initialCameraPosition.current);
  //     controls.target.copy(initialTargetPosition.current);
  //     controls.update();
  //   }
  // };

  const modelPosition = [0, 0, 0];
  const maxPanX = 50,
    maxPanY = 50,
    maxPanZ = 50;

  const setOrbitControls = (control) => {
    orbitControlsRef.current = control;
    if (controlsRef) {
      controlsRef.current = control;
      console.log(
        'controlsRef.current set to orbitControlsRef.current:',
        orbitControlsRef.current,
      );
    }
  };

  return (
    <div>
      <KeyDisplay keysPressed={keysPressed} />
      <Canvas
        style={{ width: '800px', height: '600px' }}
        className="bg-background"
        gl={{ antialias: false }}
        dpr={1}
      >
        {/* <Camera /> */}
        <OrbitControls
          ref={setOrbitControls}
          enableKeys={false} // 키보드 제어를 직접 처리하므로 비활성화
          enableRotate={false} // 회전 제어를 직접 처리하므로 비활성화
          enablePan={false} // 패닝 제어를 직접 처리하므로 비활성화
          target={modelPosition}
          minDistance={50}
          maxDistance={200}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={(Math.PI / 2) * 1.5}
          enableDamping={true}
          dampingFactor={0.05}
          // enablePan={true}
        />
        <CameraControls
          orbitControlsRef={orbitControlsRef}
          keysPressed={keysPressed}
          delta={delta}
          rotationDelta={rotationDelta}
          maxPanX={maxPanX}
          maxPanY={maxPanY}
          maxPanZ={maxPanZ}
        />
        <SplatComponent
          maxSplats={20000000}
          splatPos={modelPosition}
          splatRot={[Math.PI, 0, 0]}
          splatScale={17.8}
          splatUrl={splatUrl}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default WebglCanvas;
