// Title.js
import React from 'react';
import ConnectionStatus from './ConnectionStatus';

const Title = () => {
  return (
    <h1 className="title">
      TowerEye AI
      <span style={{ fontSize: '0.75em', verticalAlign: 'super' }}>
        ™
      </span>{' '}
      Models
      <ConnectionStatus />
    </h1>
  );
};

export default Title;
