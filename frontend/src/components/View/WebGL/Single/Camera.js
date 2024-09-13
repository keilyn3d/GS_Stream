import React, { Suspense } from 'react';
import { PerspectiveCamera } from '@react-three/drei';

const Camera = () => {
  const cameraPosition = [0, 0, 150];

  return (
    <Suspense fallback={null}>
      <PerspectiveCamera
        makeDefault
        position={cameraPosition}
        near={1} // Near Clipping Plane 설정
        far={500} // Far Clipping Plane 설정
      />
    </Suspense>
  );
};

export default Camera;
