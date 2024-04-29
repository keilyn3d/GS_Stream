import React from 'react';
import WelcomeMessage from './WelcomeMessage';

const SingleViewHeader = ({ userName, leftModelName, rightModelName }) => {
  return (
    <>
      <h1>Web Inspector 2.0 </h1>
      User: {userName}, Left Model: {leftModelName}, Right Model:
      {rightModelName} <br />
      <WelcomeMessage />
    </>
  );
};

export default SingleViewHeader;
