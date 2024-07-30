import SingleViewUserInfo from './SingleViewUserInfo';
import AssetContainer from '../../Common/AssetButtonContainer';

import 'styles/viewer_style.css';

const SingleViewUpperInfoBox = () => {
  return (
    <div className="upper-info-box">
      <SingleViewUserInfo className="user-info" />
      <AssetContainer />
    </div>
  );
};

export default SingleViewUpperInfoBox;
