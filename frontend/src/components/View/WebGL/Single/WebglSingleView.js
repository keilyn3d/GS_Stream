// src/components/View/WebGL/Single/WebglSingleView.js
import React, { useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // useLocation 훅을 통해 state 접근
import WebglCanvas from './WebglCanvas';
import ControlButtons from './ControlButtons';
import WelcomeMessage from 'components/View/Common/WelcomeMessage';
import ViewTitle from 'components/View/Common/ViewTitle';
import * as THREE from 'three';

const WebglSingleView = () => {
  const location = useLocation(); // location 객체를 통해 state 접근
  const { modelUrl } = location.state || {}; // state로 전달된 모델 URL을 가져옴

  console.log('Model URL:', modelUrl); // 모델 URL 출력

  const controlsRef = useRef(null);

  // delta와 rotationDelta 상태 관리
  const [delta, setDelta] = useState(0.5);
  const [rotationDelta, setRotationDelta] = useState(0.5);

  // WebglCanvas에 있는 resetCamera 핸들러 전달
  const handleResetCamera = useCallback(() => {
    console.log('handleResetCamera called'); // 추가된 로그
    if (controlsRef.current) {
      controlsRef.current.position.set(0, 0, 3); // 초기 위치로 리셋
      controlsRef.current.quaternion.set(0, 0, 0, 1); // 초기 회전(아이덴티티 쿼터니언)
      controlsRef.current.lookAt(new THREE.Vector3(0, 0, 0)); // 원점을 바라보도록 설정
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
      {/* Canvas 컴포넌트에 controlsRef 전달 */}
      <WebglCanvas
        controlsRef={controlsRef}
        delta={delta}
        rotationDelta={rotationDelta}
        handleResetCamera={handleResetCamera}
        splatUrl={modelUrl}
      />
      {/* ControlButtons에서 delta와 rotationDelta 값 조정 */}
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

export default WebglSingleView;
