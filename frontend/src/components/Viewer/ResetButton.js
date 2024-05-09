import React from 'react';

const ResetButton = ({ handleResetClick }) => (
  <div className="button-container">
    <span>Pose Reset:</span>
    <button id="reset" onClick={handleResetClick}>
      Reset
    </button>
  </div>
);

export default ResetButton;
