// Title.js
import React, { useState, useEffect } from 'react';
import ConnectionStatus from './ConnectionStatus';

const Title = () => {
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
    <h1 className="title">
      TowerEye AI
      <span style={{ fontSize: '0.75em', verticalAlign: 'super' }}>
        ™
      </span>{' '}
      Registration
      <ConnectionStatus isConnected={isConnected} />
    </h1>
  );
};

export default Title;
