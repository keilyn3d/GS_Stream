import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import SingleViewHeader from '../../SSR/Single/SingleViewHeader';

const SplatRenderer = ({ splatData }) => {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI; // Flip the points so they face the camera
    }
  }, []);

  useEffect(() => {
    if (splatData) {
      console.log('Splat data provided');
    } else {
      console.log('No splat data provided');
      return;
    }

    const geometry = new THREE.BufferGeometry();
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4; // 32 bytes per vertex
    const vertexCount = Math.floor(splatData.length / rowLength);

    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const scales = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      const offset = i * rowLength;

      // Extract position
      positions[i * 3] = new Float32Array(splatData.buffer, offset, 1)[0];
      positions[i * 3 + 1] = new Float32Array(
        splatData.buffer,
        offset + 4,
        1,
      )[0];
      positions[i * 3 + 2] = new Float32Array(
        splatData.buffer,
        offset + 8,
        1,
      )[0];

      // Extract color
      colors[i * 3] = splatData[offset + 24] / 255;
      colors[i * 3 + 1] = splatData[offset + 25] / 255;
      colors[i * 3 + 2] = splatData[offset + 26] / 255;

      // Extract scale
      scales[i * 3] = new Float32Array(splatData.buffer, offset + 12, 1)[0];
      scales[i * 3 + 1] = new Float32Array(splatData.buffer, offset + 16, 1)[0];
      scales[i * 3 + 2] = new Float32Array(splatData.buffer, offset + 20, 1)[0];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('splatColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: `
          attribute vec3 scale;
          attribute vec3 splatColor;
          varying vec3 vColor;
          void main() {
            vColor = splatColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = scale.x * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
      fragmentShader: `
          varying vec3 vColor;
          void main() {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
          }
        `,
      vertexColors: true,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
  }, [splatData]);

  // useFrame(() => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.001;
  //   }
  // });

  return <points ref={meshRef} />;
};

const WebglSingleView = () => {
  const location = useLocation();
  const [splatData, setSplatData] = useState(null);

  useEffect(() => {
    if (location.state && location.state.response) {
      const reader = new FileReader();
      reader.onload = () => {
        setSplatData(new Uint8Array(reader.result));
      };
      reader.readAsArrayBuffer(location.state.response);
    }
  }, [location]);

  return (
    <div className="content">
      <SingleViewHeader />
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />
          {splatData && <SplatRenderer splatData={splatData} />}
        </Canvas>
      </div>
    </div>
  );
};

export default WebglSingleView;
