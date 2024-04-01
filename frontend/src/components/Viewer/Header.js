import React from 'react';

const Header = ({ userName, selectedModel }) => (
  <>
    <h1>Web Inspector 2.0 </h1>
    User: {userName}, Model: {selectedModel} <br />
    <p>
      Welcome to CViSS Lab's Web Inspection Tool!
      <br />
      Use q,e,a,w,s,d to control camera translation and u,o,i,j,k,l to control
      camera rotations. <br />
      Press Spacebar to get nearest images shown to the right of the viewport,
      press on an image view on main canvas. <br />
      Double-click on the main canvas to zoom-in and zoom-out.
    </p>
  </>
);

export default Header;
