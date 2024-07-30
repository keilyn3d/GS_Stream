import React, { useContext } from 'react';
import { UserContext } from '../../Common/UserContext';

const SingleViewUserInfo = () => {
  const { userName, selectedModelName } = useContext(UserContext);

  return (
    <>
      User: {userName}, Model: {selectedModelName} <br />
    </>
  );
};

export default SingleViewUserInfo;
