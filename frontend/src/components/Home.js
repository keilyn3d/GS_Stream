import React, { useState, useEffect } from 'react';
import '../styles/style.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const serverAddress = 'http://127.0.0.1:5000';

  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!code) {
      // Notify the user (e.g., display an alert message)
      alert('Please select a code.');
      return; // Stop further processing and exit the function
    }

    try {
      // Request the selected code from the server
      const response = await fetch(
        `${serverAddress}/api/models/${code}/config`,
        {
          method: 'GET', // or POST, depending on server implementation
          headers: {
            // Set headers if necessary
            'Content-Type': 'application/json',
          },
          // body: JSON.stringify({ code }) // for POST requests
        },
      );

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      const config = await response.json();
      console.log(config);

      // Save the initial values received from the server to state or perform other logic
      // For example: update state, save to local storage, pass to other components, etc.

      navigate('/viewer', { state: { config } });
    } catch (error) {
      console.error('Fetching initial values failed', error);
    }
  };

  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch(serverAddress + '/api/codes')
      .then((response) => response.json())
      .then((data) => {
        setModels(data);
      })
      .catch((error) => console.error('Fetching data failed', error));
  }, []);

  console.log(models);

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
            <option value="">Please select a model</option>

            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <button type="submit" name="join">
            Connect
          </button>
        </div>
      </form>
    </div>
  );
};

export default Home;
