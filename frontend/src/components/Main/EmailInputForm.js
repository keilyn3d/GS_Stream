import React from 'react';

const EmailInputForm = ({ setUserName }) => {
  return (
    <div className="email-input-form">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label htmlFor="email">Please Enter Email:</label>
        <input
          type="text"
          placeholder="something@gmail.com"
          name="name"
          id="email"
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
    </div>
  );
};

export default EmailInputForm;
