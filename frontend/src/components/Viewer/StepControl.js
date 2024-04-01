// StepControl.js
import React from 'react';

const StepControl = ({ step, decreaseStep, increaseStep, message }) => (
  <>
    Step
    <div>
      <button id="decrease" onClick={decreaseStep}>
        -
      </button>
      <input
        type="text"
        id="stepValue"
        value={step}
        readOnly
        style={{ textAlign: 'center' }}
      ></input>
      <button id="increase" onClick={increaseStep}>
        +
      </button>
    </div>
    <div id="message">{message}</div>
  </>
);

export default StepControl;
