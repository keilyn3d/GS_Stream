import React from 'react';
import { Tooltip } from 'react-tooltip';

const ConnectionStatus = ({ isConnected }) => {
  return (
    <>
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: isConnected ? 'green' : 'red',
          display: 'inline-block',
          marginLeft: '5px',
          verticalAlign: 'middle',
        }}
        data-tooltip-id="connection-tooltip"
        data-tooltip-content={isConnected ? 'Connected' : 'Not Connected'}
        data-tooltip-place="top"
      ></div>
      <Tooltip id="connection-tooltip" style={{ fontSize: '10px' }} />
    </>
  );
};

export default ConnectionStatus;
