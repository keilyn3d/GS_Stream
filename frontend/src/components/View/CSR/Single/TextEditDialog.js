import React, { useEffect, useRef, useState, useCallback } from 'react';

const TextEditDialog = ({ label, onChange, onSave, onCancel }) => {
  const inputRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const handleSave = useCallback(() => {
    onSave();
  }, [onSave]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        inputRef.current &&
        inputRef.current.contains(document.activeElement)
      ) {
        event.stopPropagation();
        if (event.key === 'Enter') {
          handleSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleSave]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: visible ? 'translate(-50%, -50%)' : 'translate(-50%, -45%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease-in-out, transform 0.25s ease-in-out',
      }}
    >
      <h3
        style={{
          margin: 0,
          paddingBottom: '5px',
        }}
      >
        Edit Marker Label
      </h3>
      <input
        ref={inputRef}
        type="text"
        value={label}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '5px',
          marginBottom: '10px',
          boxSizing: 'border-box',
        }}
      />
      <button onClick={handleSave} style={{ marginRight: '10px' }}>
        Save
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default TextEditDialog;
