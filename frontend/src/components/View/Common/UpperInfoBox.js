import UserInfo from './UserInfo';
// import Preset from './Preset';

import 'styles/viewer_style.css';

const UpperInfoBox = () => {
  return (
    <div className="upper-info-box">
      <UserInfo className="user-info" />
      {/* <Preset /> */}
    </div>
  );
};

export default UpperInfoBox;
