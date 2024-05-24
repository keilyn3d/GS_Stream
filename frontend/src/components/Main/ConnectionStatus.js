import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const backendAddress = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(backendAddress + '/health')
      .then((response) => {
        if (response.ok) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      })
      .catch((error) => {
        setIsConnected(false);
      });
  }, [backendAddress]);
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
