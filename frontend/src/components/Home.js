import React, { useState } from 'react';
import '../styles/style.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [code, setCode] = useState('1');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission here
    // For example, pass name and code to Viewer component
    // <Viewer name={name} code={code} />;
    navigate('/viewer');
  };

  return (
    <div>
      <h1 className="title">CViSS G.S. Inspector Registration</h1>
      <form onSubmit={handleSubmit} className="buttons">
        <h3>Please Enter Email:</h3>
        <div>
          <label>Name:</label>
          <input
            type="text"
            placeholder="something@gmail.com"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="join">
          <select
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          >
            <option value="1">1</option>
            {/* <option value="2">2</option> */}
          </select>
          <button
            type="submit"
            name="join"
            onClick={(event) => handleSubmit(event, name, code)}
          >
            Connect
          </button>
        </div>
      </form>
    </div>
  );
};

export default Home;
