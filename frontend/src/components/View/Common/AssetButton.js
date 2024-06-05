import React from 'react';

const AssetButton = ({ index, handleAssetButtonClick }) => {
  const buttonStyle = {
    backgroundColor: 'green',
    color: 'white',
    margin: '0 5px',
  };

  return (
    <button style={buttonStyle} onClick={() => handleAssetButtonClick(index)}>
      Asset {index}
    </button>
  );
};

export default AssetButton;
