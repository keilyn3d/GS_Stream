import React from 'react';
import ViewTitle from './ViewTitle';
import WelcomeMessage from './WelcomeMessage';

const SingleViewHeader = ({ userName, selectedModelName }) => (
  <>
    <ViewTitle />
    User: {userName}, Model: {selectedModelName} <br />
    <WelcomeMessage />
  </>
);

export default SingleViewHeader;
