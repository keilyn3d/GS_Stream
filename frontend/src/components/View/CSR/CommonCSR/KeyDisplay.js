import React from 'react';
import { keyActions } from './KeyActions';

const KeyDisplay = ({ keysPressed }) => {
  // Filter the keysPressed object to get the keys that are currently pressed
  const pressedKeys = Object.keys(keysPressed).filter(
    (key) => keysPressed[key],
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        borderRadius: '5px',
        maxWidth: '300px',
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: '0 0 10px 0' }}>Keys Pressed:</h3>
      {pressedKeys.length === 0 ? (
        <p>No keys pressed.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {pressedKeys.map((key) => (
            <li key={key} style={{ marginBottom: '5px' }}>
              <strong>{key}</strong>: {keyActions[key] || 'Unknown action'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default KeyDisplay;
