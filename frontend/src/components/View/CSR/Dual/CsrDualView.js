// src/components/View/CSR/Dual/CsrDualView.js
import React, { useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';

import WelcomeMessage from 'components/View/Common/WelcomeMessage';
import ViewTitle from 'components/View/Common/ViewTitle';
import CsrCanvas from 'components/View/CSR/CommonCSR/CsrCanvas';
import ControlButtons from 'components/View/CSR/CommonCSR/ControlButtons';

import { DUAL_VIEW_SETTINGS } from './CsrDualViewSettings';

const CsrDualView = () => {
  const location = useLocation();
  const { modelUrl } = location.state || {};
  const { comparisonModelUrl } = location.state || {};

  console.log('Model URL:', modelUrl);
  console.log('Comparison Model URL:', comparisonModelUrl);

  const controlsRef1 = useRef(null);
  const controlsRef2 = useRef(null);

  // Managing state for delta and rotationDelta using initial constants
  const [delta, setDelta] = useState(DUAL_VIEW_SETTINGS.delta);
  const [rotationDelta, setRotationDelta] = useState(
    DUAL_VIEW_SETTINGS.rotationDelta,
  );

  // Pass the resetCamera handler to CsrCanvas
  const handleResetCamera = useCallback(() => {
    console.log('handleResetCamera called');
    if (controlsRef1.current) {
      controlsRef1.current.position.set(
        ...DUAL_VIEW_SETTINGS.cameraSettings.position,
      ); // Reset to the initial position
      controlsRef1.current.quaternion.set(0, 0, 0, 1); // Reset rotation (identity quaternion)
      controlsRef1.current.lookAt(new THREE.Vector3(0, 0, 0)); // Set to look at the origin
    }

    if (controlsRef2.current) {
      controlsRef2.current.position.set(
        ...DUAL_VIEW_SETTINGS.cameraSettings.position,
      ); // Reset to the initial position
      controlsRef2.current.quaternion.set(0, 0, 0, 1); // Reset rotation (identity quaternion)
      controlsRef2.current.lookAt(new THREE.Vector3(0, 0, 0)); // Set to look at the origin
    }
  }, [controlsRef1, controlsRef2]);

  return (
    <div
      className="webgl-dual-view"
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
      <div style={{ display: 'flex' }}>
        <CsrCanvas
          controlsRef={controlsRef1}
          delta={delta}
          rotationDelta={rotationDelta}
          handleResetCamera={handleResetCamera}
          splatUrl={modelUrl}
          modelPosition={DUAL_VIEW_SETTINGS.modelPosition}
          maxPanX={DUAL_VIEW_SETTINGS.maxPanX}
          maxPanY={DUAL_VIEW_SETTINGS.maxPanY}
          maxPanZ={DUAL_VIEW_SETTINGS.maxPanZ}
          cameraSettings={DUAL_VIEW_SETTINGS.cameraSettings}
        />
        <CsrCanvas
          controlsRef={controlsRef2}
          delta={delta}
          rotationDelta={rotationDelta}
          handleResetCamera={handleResetCamera}
          splatUrl={comparisonModelUrl}
          modelPosition={DUAL_VIEW_SETTINGS.modelPosition}
          maxPanX={DUAL_VIEW_SETTINGS.maxPanX}
          maxPanY={DUAL_VIEW_SETTINGS.maxPanY}
          maxPanZ={DUAL_VIEW_SETTINGS.maxPanZ}
          cameraSettings={DUAL_VIEW_SETTINGS.cameraSettings}
        />
      </div>
      <ControlButtons
        handleResetCamera={handleResetCamera}
        controlsRef={[controlsRef1, controlsRef2]}
        delta={delta}
        setDelta={setDelta}
        rotationDelta={rotationDelta}
        setRotationDelta={setRotationDelta}
      />
    </div>
  );
};

export default CsrDualView;
