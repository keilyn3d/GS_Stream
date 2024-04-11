import React from 'react';
import WelcomeMessage from './WelcomeMessage';

const SingleViewHeader = ({ userName, leftModel, rightModel }) => {
  return (
    <>
      <h1>Web Inspector 2.0 </h1>
      User: {userName}, Left Model: {leftModel}, Right Modle: {rightModel}{' '}
      <br />
      <WelcomeMessage />
    </>
  );
};

export default SingleViewHeader;
