import React from 'react';
import '../styles/viewer_style.css';

function Viewer() {
  return (
    <div className="content">
      <h1>WebInspector 2.0</h1>
      <p>
        Welcome to CViSS Lab's Web Inspection Tool!
        <br />
        Use q,e,a,w,s,d to control camera translation and u,o,i,j,k,l to control
        camera rotations. <br />
        Press Spacebar to get nearest images shown to the right of the viewport,
        press on an image view on main canvas. <br />
        Double-click on the main canvas to zoom-in and zoom-out.
      </p>
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
      <div class="button-container">
        <span>Pose Reset</span>
        <button id="reset" class="buttons">
          Reset
        </button>
      </div>
      Step
      <div>
        <button id="decrease">-</button>
        <input type="text" id="stepValue" value="1"></input>
        <button id="increase">+</button>
      </div>
      <div id="message"></div>
    </div>
  );
}

export default Viewer;
