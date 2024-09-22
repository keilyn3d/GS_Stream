// src/components/View/CSR/Single/CsrCanvas.js
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraControls from './CameraControls';
import SplatComponent from 'components/View/CSR/Splat/SplatComponent';
import { Environment } from '@react-three/drei';
import KeyDisplay from './KeyDisplay';

const CsrCanvas = ({
  controlsRef,
  delta,
  rotationDelta,
  handleResetCamera,
  splatUrl,
  modelPosition,
  maxPanX,
  maxPanY,
  maxPanZ,
  cameraSettings,
}) => {
  const [keysPressed, setKeysPressed] = useState({});
  const [cameraPose, setCameraPose] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  });

  useEffect(() => {
    if (handleResetCamera) {
      handleResetCamera();
    }
  }, [handleResetCamera]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      setKeysPressed((prevKeys) => ({ ...prevKeys, [event.code]: true }));
    };

    const handleKeyUp = (event) => {
      setKeysPressed((prevKeys) => ({ ...prevKeys, [event.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div>
      <KeyDisplay keysPressed={keysPressed} />
      <div>
        <h3>Camera Pose</h3>
        <p>
          Position: x: {cameraPose.position.x.toFixed(2)}, y:{' '}
          {cameraPose.position.y.toFixed(2)}, z:{' '}
          {cameraPose.position.z.toFixed(2)}
        </p>
        <p>
          Rotation: x: {cameraPose.rotation.x.toFixed(2)}°, y:{' '}
          {cameraPose.rotation.y.toFixed(2)}°, z:{' '}
          {cameraPose.rotation.z.toFixed(2)}°
        </p>
      </div>

      <Canvas
        style={{ width: '800px', height: '600px' }}
        className="bg-background"
        gl={{ antialias: false }}
        dpr={1}
        camera={cameraSettings}
      >
        <axesHelper args={[5]} /> {/* Displays coordinate axes with size 5 */}
        <CameraControls
          controlsRef={controlsRef}
          keysPressed={keysPressed}
          delta={delta}
          rotationDelta={rotationDelta}
          maxPanX={maxPanX}
          maxPanY={maxPanY}
          maxPanZ={maxPanZ}
          setCameraPose={setCameraPose}
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

export default CsrCanvas;
