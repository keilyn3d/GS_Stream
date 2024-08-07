// StepControl.js
import React from 'react';

const StepControl = ({ step, decreaseStep, increaseStep }) => (
  <div className="step-control">
    <span>Step:</span>
    <button id="decrease" onClick={decreaseStep}>
      -
    </button>
    <input
      type="text"
      id="stepValue"
      value={step}
      readOnly
      style={{ width: '30px', textAlign: 'center' }}
    ></input>
    <button id="increase" onClick={increaseStep}>
      +
    </button>
  </div>
);

export default StepControl;
