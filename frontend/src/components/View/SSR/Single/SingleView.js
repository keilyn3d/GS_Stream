import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useSocket from './SingleViewSocket';

import { useKeyControl } from '../CommonSSR/UseKeyControl';

import { UserContext } from '../../Common/UserContext';

import 'styles/viewer_style.css';
import SingleViewHeader from './SingleViewHeader';
import SingleViewUpperInfoBox from './SingleViewUpperInfoBox';
import CanvasContainer from '../CommonSSR/CanvasContainer';
import ResetButton from '../../Common/ResetButton';
import StepControl from '../../Common/StepControl';
import InformationBox from '../../Common/InformationBox';

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

  const handleAssetButtonClick = (index) => {
    console.log('Asset Button Clicked: ', index);
    const data = {
      selectedModelId: [selectedModelId],
      index: index,
    };
    socketRef.current.emit('get_asset_pose', data);
  };

  const userContextValue = {
    userName,
    selectedModelName,
    handleAssetButtonClick: handleAssetButtonClick,
  };

  const lastKeyPressedTime = useRef(0);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const initStepValue = 1;
  const [resetKey, setResetKey] = useState(0);
  const [mainImage, setMainImage] = useState('');
  const [nnImages, setNnImages] = useState(['', '', '']);
  const [elevation, setElevation] = useState(0);
  const [heading, setHeading] = useState(0);

  const { socketRef } = useSocket(userName, selectedModelId, {
    setMainImage,
    setNnImages,
    setElevation,
    setHeading,
  });

  useKeyControl(step, lastKeyPressedTime, socketRef);

  const handleResetClick = () => {
    setResetKey((prevKey) => prevKey + 1);
    setStep(initStepValue);
    setNnImages(['', '', '']);
    if (socketRef.current) {
      socketRef.current.emit('get_init_image', selectedModelId);
      socketRef.current.emit('reset_pose', selectedModelId);
    }
    setElevation(0);
    setHeading(0);
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
      <SingleViewHeader />
      <div>
        <UserContext.Provider value={userContextValue}>
          <SingleViewUpperInfoBox />
        </UserContext.Provider>
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
      </div>
      <div className="information-box">
        <InformationBox elevation={elevation} heading={heading} />
      </div>
      <div className="viewer-control-box">
        <StepControl
          step={step}
          decreaseStep={decreaseStep}
          increaseStep={increaseStep}
          message={message}
        />
        <ResetButton handleResetClick={handleResetClick} />
      </div>
      <div id="message">{message}</div>
    </div>
  );
};

export default SingleView;
