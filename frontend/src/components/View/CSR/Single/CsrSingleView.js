// src/components/View/CSR/Single/CsrSingleView.js
import React, { useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';

import WelcomeMessage from 'components/View/Common/WelcomeMessage';
import ViewTitle from 'components/View/Common/ViewTitle';
import CsrCanvas from './CsrCanvas';
import ControlButtons from './ControlButtons';

import { SINGLE_VIEW_SETTINGS } from './CsrSingleViewSettings';

const CsrSingleView = () => {
  const location = useLocation();
  const { modelUrl } = location.state || {};

  console.log('Model URL:', modelUrl);

  const controlsRef = useRef(null);

  // Managing state for delta and rotationDelta using initial constants
  const [delta, setDelta] = useState(SINGLE_VIEW_SETTINGS.delta);
  const [rotationDelta, setRotationDelta] = useState(
    SINGLE_VIEW_SETTINGS.rotationDelta,
  );

  // Pass the resetCamera handler to CsrCanvas
  const handleResetCamera = useCallback(() => {
    console.log('handleResetCamera called');
    if (controlsRef.current) {
      controlsRef.current.position.set(
        ...SINGLE_VIEW_SETTINGS.cameraSettings.position,
      ); // Reset to the initial position
      controlsRef.current.quaternion.set(0, 0, 0, 1); // Reset rotation (identity quaternion)
      controlsRef.current.lookAt(new THREE.Vector3(0, 0, 0)); // Set to look at the origin
    }
  }, [controlsRef]);

  return (
    <div
      className="webgl-single-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <ViewTitle />
      <WelcomeMessage />
      <CsrCanvas
        controlsRef={controlsRef}
        delta={delta}
        rotationDelta={rotationDelta}
        handleResetCamera={handleResetCamera}
        splatUrl={modelUrl}
        modelPosition={SINGLE_VIEW_SETTINGS.modelPosition}
        maxPanX={SINGLE_VIEW_SETTINGS.maxPanX}
        maxPanY={SINGLE_VIEW_SETTINGS.maxPanY}
        maxPanZ={SINGLE_VIEW_SETTINGS.maxPanZ}
        cameraSettings={SINGLE_VIEW_SETTINGS.cameraSettings}
      />
      <ControlButtons
        handleResetCamera={handleResetCamera}
        controlsRef={controlsRef}
        delta={delta}
        setDelta={setDelta}
        rotationDelta={rotationDelta}
        setRotationDelta={setRotationDelta}
      />
    </div>
  );
};

export default CsrSingleView;
