import React from 'react';

const CanvasContainer = () => (
  <div className="viewer-container">
    <div className="viewport-container">
      <canvas id="myCanvas" width="800" height="600"></canvas>
    </div>
    <div className="closest-imgs-container">
      <canvas id="nnImg_1" width="266" height="198"></canvas>
      <canvas id="nnImg_2" width="266" height="198"></canvas>
      <canvas id="nnImg_3" width="266" height="198"></canvas>
    </div>
  </div>
);

export default CanvasContainer;
