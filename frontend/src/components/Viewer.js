import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

import '../styles/viewer_style.css';

const Viewer = () => {
  useEffect(() => {
    const serverAddress = 'http://127.0.0.1:5000';
    const socket = io(serverAddress);

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('message', (message) => {
      console.log('Received message from Socket.IO:', message);
    });

    return () => {
      socket.disconnect();
      console.log('Disconnected from Socket.IO server');
    };
  }, []);

  const location = useLocation();

  const { config } = location.state;

  console.log('Viewer', config);

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
      <div className="button-container">
        <span>Pose Reset</span>
        <button id="reset" className="buttons">
          Reset
        </button>
      </div>
      Step
      <div>
        <button id="decrease">-</button>
        <input type="text" id="stepValue" value="1" readOnly></input>
        <button id="increase">+</button>
      </div>
      <div id="message"></div>
    </div>
  );
};

export default Viewer;
