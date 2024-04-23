import React, { useState, useEffect } from 'react';
import '../styles/style.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const backendAddress = process.env.REACT_APP_BACKEND_URL;

  const [userName, setUserName] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedModelIdForComparison, setSelectedModelIdForComparison] =
    useState('');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [selectedModelNameForComparison, setSelectedModelNameForComparison] =
    useState('');
  const [allModels, setAllModels] = useState([]);

  useEffect(() => {
    fetch(backendAddress + '/api/codes')
      .then((response) => response.json())
      .then((data) => {
        setAllModels(data);
      })
      .catch((error) => console.error('Fetching data failed', error));
  }, []);
  console.log(allModels);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedModelId) {
      // Notify the user (e.g., display an alert message)
      // Stop further processing and exit the function
      alert('Please select a code.');
      return;
    }

    try {
      // Request the selected code from the server
      const response = await fetch(
        `${backendAddress}/api/models/${selectedModelId}/config`,
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

      // Save the initial values received from the server to state or perform other logic
      // For example: update state, save to local storage, pass to other components, etc.

      if (selectedModelId && selectedModelIdForComparison) {
        navigate('/dual-view', {
          state: {
            userName,
            selectedModelId,
            selectedModelIdForComparison,
            selectedModelName,
            selectedModelNameForComparison,
            config,
          },
        });
      } else {
        navigate('/single-view', {
          state: {
            userName,
            selectedModelId,
            selectedModelName,
            config,
          },
        });
      }
    } catch (error) {
      console.error('Fetching initial values failed', error);
    }
  };

  return (
    <div>
      <h1 className="title">CViSS G.S. Inspector Registration</h1>
      <form onSubmit={handleSubmit} className="buttons">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label>Please Enter Email:</label>
          <input
            type="text"
            placeholder="something@gmail.com"
            name="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        If you select one model, you will go to the single view, and if you
        select two models, you will go to the dual view.
        <div className="join">
          <select
            name="model"
            value={selectedModelId}
            onChange={(e) => {
              const selectedIndex = e.target.options.selectedIndex;
              const selectedText = e.target.options[selectedIndex].text;

              setSelectedModelId(e.target.value);
              setSelectedModelName(selectedText);
            }}
          >
            <option value="">Please select a model</option>

            {allModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.model_name}
              </option>
            ))}
          </select>

          <select
            name="model-for-comparison"
            value={selectedModelIdForComparison}
            onChange={(e) => {
              const selectedIndex = e.target.options.selectedIndex;
              const selectedText = e.target.options[selectedIndex].text;

              setSelectedModelIdForComparison(e.target.value);
              setSelectedModelNameForComparison(selectedText);
            }}
            disabled={!selectedModelId}
          >
            <option value="">Please select a model</option>

            {allModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.model_name}
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
