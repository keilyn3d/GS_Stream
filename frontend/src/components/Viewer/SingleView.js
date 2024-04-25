import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

import 'styles/viewer_style.css';
import SingleViewHeader from './SingleViewHeader';
import CanvasContainer from './CanvasContainer';
import ResetButton from './ResetButton';
import StepControl from './StepControl';

const SingleView = () => {
  const location = useLocation();
  let userName = 'defaultUserName';
  let selectedModelId = 0;
  let selectedModelName = 'defaultSelectedModel';

  if (location && location.state) {
    userName = location.state.userName || userName;
    selectedModelId = location.state.selectedModelId || selectedModelId;
    selectedModelName = location.state.selectedModelName || selectedModelName;
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
      socketRef.current.emit('set_user_data', {
        userName: userName,
        modelIds: [selectedModelId],
      });
      console.log('Connected to Socket.IO server');
      socketRef.current.emit('get_init_image', selectedModelId);
    });

    socketRef.current.on('response', (message) => {
      console.log('Received message from Socket.IO:', message);
    });

    socketRef.current.on('set_client_init_image', (data) => {
      console.log('Received init image');
      setMainImage(data.image);
    });

    socketRef.current.on('set_client_main_image', (data) => {
      console.log('Received main image');
      setMainImage(data.image);
    });

    socketRef.current.on('nnImg', (data) => {
      console.log('Received nnImages');
      const entries = Object.entries(data.images);
      setNnImages(entries.map(([, image]) => image));
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
    setStep(initStepValue);
    setNnImages(['', '', '']);
    if (socketRef.current) {
      socketRef.current.emit('get_init_image', selectedModelId);
      socketRef.current.emit('reset_pose', selectedModelId);
    }
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
      <SingleViewHeader
        userName={userName}
        selectedModelName={selectedModelName}
      />
      <CanvasContainer
        containerId="main"
        mainCanvasId="main"
        width="800"
        height="600"
        mainImage={mainImage}
        nnImages={nnImages}
        nnCanvasLocation="right"
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

export default SingleView;
