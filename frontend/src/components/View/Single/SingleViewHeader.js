import React from 'react';
import ViewTitle from '../Common/ViewTitle';
import WelcomeMessage from '../Common/WelcomeMessage';

const SingleViewHeader = ({ userName, selectedModelName }) => (
  <>
    <ViewTitle />
    User: {userName}, Model: {selectedModelName} <br />
    <WelcomeMessage />
  </>
);

export default SingleViewHeader;
