import React, { useContext } from 'react';

import { UserContext } from './UserContext';

import AssetButton from './AssetButton';
import 'styles/viewer_style.css';

const AssetContainer = () => {
  const { handleAssetButtonClick } = useContext(UserContext);

  return (
    <div className="asset-button-container">
      {[1, 2, 3].map((item) => (
        <AssetButton
          key={item}
          index={item}
          handleAssetButtonClick={handleAssetButtonClick}
        />
      ))}
    </div>
  );
};

export default AssetContainer;
