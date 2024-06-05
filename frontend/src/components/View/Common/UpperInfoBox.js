import UserInfo from './UserInfo';
import AssetContainer from './AssetButtonContainer';

import 'styles/viewer_style.css';

const UpperInfoBox = () => {
  return (
    <div className="upper-info-box">
      <UserInfo className="user-info" />
      <AssetContainer />
    </div>
  );
};

export default UpperInfoBox;
