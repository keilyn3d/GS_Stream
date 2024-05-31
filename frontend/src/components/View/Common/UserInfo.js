import React, { useContext } from 'react';
import { UserContext } from '../Single/SingleViewContext';

const UserInfo = () => {
  const { userName, selectedModelName } = useContext(UserContext);

  return (
    <>
      User: {userName}, Model: {selectedModelName} <br />
    </>
  );
};

export default UserInfo;
