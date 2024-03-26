import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

import '../styles/viewer_style.css';
import CanvasContainer from './CanvasContainer';
import ResetButton from './ResetButton';
import StepControl from './StepControl';

const Viewer = () => {
  const location = useLocation();
  const { userName, selectedModel, config } = location.state;
  const lastKeyPressedTime = useRef(0);
  const socketRef = useRef(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const initStepValue = 1;

  // console.log(step);

  useEffect(() => {
    const backendAddress = process.env.REACT_APP_BACKEND_URL;
    if (!socketRef.current) {
      socketRef.current = io(backendAddress);
    }

    socketRef.current.on('connect', () => {
      socketRef.current.emit('set_user_name', userName);
      socketRef.current.emit('get_init_image', selectedModel);
      console.log('Connected to Socket.IO server');
    });

    socketRef.current.on('response', (message) => {
      console.log('Received message from Socket.IO:', message);
    });

    socketRef.current.on('set_client_init_image', (base64Img) => {
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

    socketRef.current.on('set_client_main_image', (base64Img) => {
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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      console.log('Disconnected from Socket.IO server');
    };
  }, []);

  useEffect(() => {
    const keyEventHandler = (event) => {
      const currentTime = new Date().getTime();
      if (currentTime - lastKeyPressedTime.current > 30) {
        lastKeyPressedTime.current = currentTime;
        if (socketRef.current) {
          socketRef.current.emit('key_control', { key: event.key, step: step });
        }
        console.log(event.key);
      } else {
        console.log('Too many requests!');
      }
    };

    window.addEventListener('keypress', keyEventHandler, false);

    return () => {
      window.removeEventListener('keypress', keyEventHandler, false);
    };
  }, [step]);

  const handleResetClick = () => {
    if (socketRef.current) {
      socketRef.current.emit('get_init_image', selectedModel);
    }
    setStep(initStepValue);
  };

  const increaseStep = () => {
    setStep((prevStep) => {
      if (prevStep < 10) {
        prevStep += 1;
      } else {
        setMessage('The value cannot exceed 10.');
      }
      return prevStep;
    });
  };

  const decreaseStep = () => {
    setStep((prevStep) => {
      if (prevStep > 1) {
        prevStep -= 1;
      } else {
        setMessage('The value cannot be less than 1.');
      }
      return prevStep;
    });
  };

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
      <CanvasContainer />
      <ResetButton handleResetClick={handleResetClick} />
      <StepControl
        step={step}
        decreaseStep={decreaseStep}
        increaseStep={increaseStep}
        message={message}
      />
    </div>
  );
};

export default Viewer;
