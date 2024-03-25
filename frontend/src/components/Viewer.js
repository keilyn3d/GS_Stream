import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

import '../styles/viewer_style.css';

const Viewer = () => {
  const location = useLocation();
  const { userName, selectedModel, config } = location.state;
  const lastKeyPressedTime = useRef(0);

  console.log(config);

  useEffect(() => {
    const backendAddress = process.env.REACT_APP_BACKEND_URL;
    const socket = io(backendAddress);

    socket.on('connect', () => {
      socket.emit('set_user_name', userName);
      socket.emit('get_init_image', selectedModel);
      console.log('Connected to Socket.IO server');
    });

    socket.on('response', (message) => {
      console.log('Received message from Socket.IO:', message);
    });

    socket.on('set_client_init_image', (base64Img) => {
      console.log('Received init image');
      const canvas = document.getElementById('myCanvas');
      const context = canvas.getContext('2d');

      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = `data:image/jpeg;base64,${base64Img}`;
    });

    socket.on('set_client_main_image', (base64Img) => {
      console.log('Received main image');
      const canvas = document.getElementById('myCanvas');
      const context = canvas.getContext('2d');

      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = `data:image/jpeg;base64,${base64Img}`;
    });

    var step = 1;
    const keyEventHandler = (event) => {
      const currentTime = new Date().getTime();
      if (currentTime - lastKeyPressedTime.current > 30) {
        lastKeyPressedTime.current = currentTime;
        socket.emit('key_control', { key: event.key, step: step });
        console.log(event.key);
      } else {
        console.log('Too many requests!');
      }
    };

    window.addEventListener('keypress', keyEventHandler, false);

    return () => {
      socket.disconnect();
      console.log('Disconnected from Socket.IO server');
      window.removeEventListener('keypress', keyEventHandler, false);
    };
  }, []);

  return (
    <div className="content">
      <h1>Web Inspector 2.0 </h1>
      User: {userName}, Model: {selectedModel} <br />
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
