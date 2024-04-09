import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

import 'styles/viewer_style.css';
import Header from './Header';
import CanvasContainer from './CanvasContainer';
import ResetButton from './ResetButton';
import StepControl from './StepControl';

const SingleViewer = () => {
  const location = useLocation();
  let userName = 'defaultUserName';
  let selectedModel = 'defaultSelectedModel';

  if (location && location.state) {
    userName = location.state.userName || userName;
    selectedModel = location.state.selectedModel || selectedModel;
  }

  const lastKeyPressedTime = useRef(0);
  const socketRef = useRef(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const initStepValue = 1;
  const [resetKey, setResetKey] = useState(0);
  const [mainImage, setMainImage] = useState('');
  const [nnImages, setNnImages] = useState(['', '', '']);

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
      setMainImage(base64Img);
    });

    socketRef.current.on('set_client_main_image', (base64Img) => {
      console.log('Received main image');
      setMainImage(base64Img);
    });

    socketRef.current.on('nnImg', (data) => {
      console.log('Received nnImages');
      const entries = Object.entries(data);
      setNnImages(entries.map(([, base64Img]) => base64Img));
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
    setResetKey((prevKey) => prevKey + 1);
    if (socketRef.current) {
      socketRef.current.emit('get_init_image', selectedModel);
      socketRef.current.emit('reset_pose', selectedModel);
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
      <Header userName={userName} selectedModel={selectedModel} />
      <CanvasContainer
        containerId="main"
        mainCanvasId="main"
        width="800"
        height="600"
        mainImage={mainImage}
        nnImages={nnImages}
        key={resetKey}
      />
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

export default SingleViewer;
