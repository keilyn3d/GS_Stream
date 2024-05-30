import React from 'react';
import ViewTitle from './ViewTitle';
import WelcomeMessage from './WelcomeMessage';

const SingleViewHeader = ({ userName, leftModelName, rightModelName }) => {
  return (
    <>
      <ViewTitle />
      User: {userName}, Left Model: {leftModelName}, Right Model:
      {rightModelName} <br />
      <WelcomeMessage />
    </>
  );
};

export default SingleViewHeader;
