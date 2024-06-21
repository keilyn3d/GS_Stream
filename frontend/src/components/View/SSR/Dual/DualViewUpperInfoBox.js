import DualViewUserInfo from './DualViewUserInfo';
import AssetContainer from '../../Common/AssetButtonContainer';

import 'styles/viewer_style.css';

const DualViewUpperInfoBox = () => {
  return (
    <div className="upper-info-box">
      <DualViewUserInfo className="user-info" />
      <AssetContainer />
    </div>
  );
};

export default DualViewUpperInfoBox;
