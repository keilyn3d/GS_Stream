import React from 'react';
import WelcomeMessage from './WelcomeMessage';

const SingleViewHeader = ({ userName, selectedModel }) => (
  <>
    <h1>Web Inspector 2.0 </h1>
    User: {userName}, Model: {selectedModel} <br />
    <WelcomeMessage />
  </>
);

export default SingleViewHeader;
