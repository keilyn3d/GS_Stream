import React from 'react';
import WelcomeMessage from './WelcomeMessage';

const SingleViewHeader = ({ userName, selectedModelName }) => (
  <>
    <h1>Web Inspector 2.0 </h1>
    User: {userName}, Model: {selectedModelName} <br />
    <WelcomeMessage />
  </>
);

export default SingleViewHeader;
