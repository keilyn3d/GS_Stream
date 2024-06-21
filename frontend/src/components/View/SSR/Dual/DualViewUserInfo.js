import React, { useContext } from 'react';
import { UserContext } from '../../Common/UserContext';

const DualViewUserInfo = () => {
  const { userName, leftModelName, rightModelName } = useContext(UserContext);

  return (
    <>
      User: {userName}, Left Model: {leftModelName}, Right Model:
      {rightModelName}
      <br />
    </>
  );
};

export default DualViewUserInfo;
