// ViewTitle.js
import React from 'react';
import StyledLink from './StyledLink';

const ViewTitle = () => {
  return (
    <center>
      <h1>
        <StyledLink to="/">
          TowerEye AI
          <span style={{ fontSize: '0.75em', verticalAlign: 'super' }}>™</span>
        </StyledLink>
      </h1>
    </center>
  );
};

export default ViewTitle;
