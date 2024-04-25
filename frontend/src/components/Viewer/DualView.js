import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import io from 'socket.io-client';

import DualViewHeader from './DualViewHeader';
import CanvasContainer from './CanvasContainer';
import ResetButton from './ResetButton';
import StepControl from './StepControl';

const DualView = () => {
  let userName = 'defaultUserName';
  let leftModelId = 0;
  let rightModelId = 0;
  let leftModelName = 'defaultLeftModelName';
  let rightModelName = 'defaultRightModelName';

  const location = useLocation();
  if (location && location.state) {
    userName = location.state.userName || userName;
    leftModelId = location.state.selectedModelId || leftModelId;
    rightModelId = location.state.selectedModelIdForComparison || rightModelId;
    leftModelName = location.state.selectedModelName || leftModelName;
    rightModelName =
      location.state.selectedModelNameForComparison || rightModelName;
  }

  // Socket
  const socketRef = useRef(null);

  // Main Canvas
  const [leftMainImage, setLeftMainImage] = useState('');
  const [rightMainImage, setRightMainImage] = useState('');

  // NN Images Canvas
  const [leftNnImages, setLeftNnImages] = useState(['', '', '']);
  const [rightNnImages, setRightNnImages] = useState(['', '', '']);

  const lastKeyPressedTime = useRef(0);

  const [leftResetKey, setLeftResetKey] = useState('left-0');
  const [rightResetKey, setRightResetKey] = useState('right-0');

  const [step, setStep] = useState(1);
  const initStepValue = 1;
  const [message, setMessage] = useState('');

  useEffect(() => {
    const backendAddress = process.env.REACT_APP_BACKEND_URL;
    if (!socketRef.current) {
      socketRef.current = io(backendAddress);
    }

    socketRef.current.on('connect', () => {
      socketRef.current.emit('set_user_data', {
        unserName: userName,
        modelIds: [leftModelId, rightModelId],
      });
      console.log('Connected to Socket.IO server');
      socketRef.current.emit('get_init_image', leftModelId);
      socketRef.current.emit('get_init_image', rightModelId);
    });

    socketRef.current.on('response', (message) => {
      console.log('Received message from Socket.IO:', message);
    });

    socketRef.current.on('set_client_init_image', (data) => {
      console.log('Received init image');
      if (data.modelId === leftModelId) setLeftMainImage(data.image);
      if (data.modelId === rightModelId) setRightMainImage(data.image);
    });

    socketRef.current.on('set_client_main_image', (data) => {
      console.log('Received main image');
      if (data.modelId === leftModelId) setLeftMainImage(data.image);
      if (data.modelId === rightModelId) setRightMainImage(data.image);
    });

    socketRef.current.on('nnImg', (data) => {
      console.log('Received nnImages');
      const entries = Object.entries(data.images);

      if (data.modelId === leftModelId)
        setLeftNnImages(entries.map(([, image]) => image));
      if (data.modelId === rightModelId)
        setRightNnImages(entries.map(([, image]) => image));
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
    setStep(initStepValue);
    setLeftNnImages(['', '', '']);
    setRightNnImages(['', '', '']);

    setLeftResetKey((prevKey) => {
      const numberPart = parseInt(prevKey.split('-')[1], 10);
      return `left-${numberPart + 1}`;
    });
    setRightResetKey((prevKey) => {
      const numberPart = parseInt(prevKey.split('-')[1], 10);
      return `right-${numberPart + 1}`;
    });
    if (socketRef.current) {
      socketRef.current.emit('get_init_image', leftModelId);
      socketRef.current.emit('get_init_image', rightModelId);
      socketRef.current.emit('reset_pose', leftModelId);
      socketRef.current.emit('reset_pose', rightModelId);
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
      <DualViewHeader
        userName={userName}
        leftModelName={leftModelName}
        rightModelName={rightModelName}
      />
      <div style={{ display: 'flex' }}>
        <CanvasContainer
          containerId="left-model"
          mainCanvasId="left-model-main-canvas"
          width="600"
          height="475"
          mainImage={leftMainImage}
          nnImages={leftNnImages}
          nnCanvasLocation="left"
          key={leftResetKey}
        />
        <CanvasContainer
          containerId="right-model"
          mainCanvasId="right-model-main-canvas"
          width="600"
          height="475"
          mainImage={rightMainImage}
          nnImages={rightNnImages}
          nnCanvasLocation="right"
          key={rightResetKey}
        />
      </div>
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

export default DualView;
