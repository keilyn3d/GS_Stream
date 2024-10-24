import { useCallback, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fragmentShaderSource, vertexShaderSource } from './SplatShaders';

// Removed global worker import
// const worker = new Worker(new URL('./SplatSortWorker', import.meta.url));

const computeFocalLengths = (width, height, fov, aspect, dpr) => {
  const fovRad = THREE.MathUtils.degToRad(fov);
  const fovXRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
  const fy = (dpr * height) / (2 * Math.tan(fovRad / 2));
  const fx = (dpr * width) / (2 * Math.tan(fovXRad / 2));
  return new THREE.Vector2(fx, fy);
};

export function Splat({
  url = 'https://antimatter15.com/splat-data/train.splat',
  maxSplats = Infinity,
  splatScaleFactor = 1,
}) {
  // Allow direct access to the mesh
  const ref = useRef(null);

  // Create a worker ref
  const workerRef = useRef(null);

  // Listen to screen and viewport
  const {
    size: { width, height },
    camera: { fov, aspect },
    viewport: { dpr },
  } = useThree();

  // Initialize uniforms
  const [uniforms] = useState({
    viewport: {
      value: new THREE.Vector2(width * dpr, height * dpr),
    },
    focal: {
      value: computeFocalLengths(width, height, fov, aspect, dpr),
    },
    splatScaleFactor: {
      value: splatScaleFactor,
    },
  });

  // Update uniforms when window changes
  useEffect(() => {
    uniforms.focal.value = computeFocalLengths(width, height, fov, aspect, dpr);
    uniforms.viewport.value = new THREE.Vector2(width * dpr, height * dpr);
    uniforms.splatScaleFactor.value = splatScaleFactor;
  }, [width, height, fov, aspect, dpr, splatScaleFactor]);

  // Initialize attribute buffers
  const [buffers, setBuffers] = useState({
    index: new Uint16Array([0, 1, 2, 2, 3, 0]),
    position: new Float32Array([1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0]),
    color: new Float32Array([1, 0, 1, 1, 1, 1, 0, 1]),
    quat: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]),
    scale: new Float32Array([1, 1, 1, 2, 0.5, 0.5]),
    center: new Float32Array([0, 0, 0, 2, 0, 0]),
  });

  // Create and manage the worker
  useEffect(() => {
    // Create a new worker
    workerRef.current = new Worker(
      new URL('./SplatSortWorker', import.meta.url),
    );

    // Receive sorted buffers from sorting worker
    workerRef.current.onmessage = (e) => {
      const { quat, scale, center, color } = e.data;
      setBuffers((buffers) => ({ ...buffers, quat, scale, center, color }));
    };

    return () => {
      // Terminate the worker when the component unmounts
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Send current camera pose to splat sorting worker
  useFrame((state, _delta, _xrFrame) => {
    const mesh = ref.current;
    if (mesh == null || !workerRef.current) {
      return;
    }
    const camera = state.camera;
    const viewProj = new THREE.Matrix4()
      .multiply(camera.projectionMatrix)
      .multiply(camera.matrixWorldInverse)
      .multiply(mesh.matrixWorld);
    workerRef.current.postMessage({ view: viewProj.elements, maxSplats });
  });

  // Load splat file from url
  useEffect(() => {
    let stopLoading = false;
    const loadModel = async () => {
      const req = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      });
      if (
        req.status !== 200 ||
        req.body == null ||
        req.headers == null ||
        req.headers.get('content-length') == null
      ) {
        throw new Error(req.status + ' Unable to load ' + req.url);
      }
      const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
      const reader = req.body.getReader();
      let splatData = new Uint8Array(
        parseInt(req.headers.get('content-length')),
      );
      let vertexCount = 0;
      let lastVertexCount = -1;
      let bytesRead = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done || stopLoading) break;
        splatData.set(value, bytesRead);
        bytesRead += value.length;

        vertexCount = Math.floor(bytesRead / rowLength);
        const alignedBytesRead = vertexCount * rowLength;

        if (vertexCount > lastVertexCount) {
          if (workerRef.current) {
            workerRef.current.postMessage(
              {
                buffer: splatData.buffer.slice(0, alignedBytesRead),
                vertexCount,
              },
              [splatData.buffer.slice(0, alignedBytesRead)],
            );
          }
          lastVertexCount = vertexCount;
        }
      }
      if (!stopLoading && workerRef.current) {
        vertexCount = Math.floor(bytesRead / rowLength);
        const alignedBytesRead = vertexCount * rowLength;
        workerRef.current.postMessage(
          {
            buffer: splatData.buffer.slice(0, alignedBytesRead),
            vertexCount,
          },
          [splatData.buffer.slice(0, alignedBytesRead)],
        );
      }
    };
    loadModel();
    return () => {
      stopLoading = true;
    };
  }, [url]);

  // Signal to Three that attributes change when their buffer change
  const update = useCallback((self) => {
    self.needsUpdate = true;
  }, []);

  // Count number of instances to feed where needed
  const instanceCount = Math.min(buffers.quat.length / 4, maxSplats);

  return (
    <mesh ref={ref} renderOrder={10}>
      <instancedBufferGeometry
        key={instanceCount}
        instanceCount={instanceCount}
      >
        <bufferAttribute
          attach="index"
          onUpdate={update}
          array={buffers.index}
          itemSize={1}
          count={6}
        />
        <bufferAttribute
          attach="attributes-position"
          onUpdate={update}
          array={buffers.position}
          itemSize={3}
          count={4}
        />
        <instancedBufferAttribute
          attach="attributes-color"
          onUpdate={update}
          array={buffers.color}
          itemSize={4}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-quat"
          onUpdate={update}
          array={buffers.quat}
          itemSize={4}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-scale"
          onUpdate={update}
          array={buffers.scale}
          itemSize={3}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-center"
          onUpdate={update}
          array={buffers.center}
          itemSize={3}
          count={instanceCount}
        />
      </instancedBufferGeometry>
      <rawShaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShaderSource}
        vertexShader={vertexShaderSource}
        depthTest={true}
        depthWrite={false}
        transparent={true}
      />
    </mesh>
  );
}
