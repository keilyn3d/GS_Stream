export const INITIAL_DELTA = 0.5;
export const INITIAL_ROTATION_DELTA = 0.5;

export const SINGLE_VIEW_SETTINGS = {
  delta: INITIAL_DELTA,
  rotationDelta: INITIAL_ROTATION_DELTA,
  modelPosition: [0, 0, 0],
  maxPanX: 200,
  maxPanY: 200,
  maxPanZ: 200,
  cameraSettings: {
    position: [0, 0, 30],
    fov: 75,
    near: 20,
    far: 1000,
  },
};
