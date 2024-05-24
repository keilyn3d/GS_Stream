import React, { useState, useEffect } from 'react';
import '../../styles/style.css';
import { useNavigate } from 'react-router-dom';
import Title from './MainTitle';

const Index = () => {
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
    const intervalId = setInterval(() => {
      setAllModels([]);
      fetch(backendAddress + '/api/codes')
        .then((response) => response.json())
        .then((data) => {
          setAllModels(data);
        })
        .catch((error) => console.error('Fetching data failed', error));
    }, 1000); // 1000ms = 1s

    // Clean up function
    return () => {
      clearInterval(intervalId);
    };
  }, [backendAddress]);
  console.log(allModels);

  const fetchConfig = async (modelId) => {
    try {
      const apiUrl = selectedModelIdForComparison
        ? `${backendAddress}/api/models/configs?ids=${selectedModelId},${selectedModelIdForComparison}`
        : `${backendAddress}/api/models/${selectedModelId}/config`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetching config failed', error);
      throw error; // Ensure the error is propagated if necessary
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedModelId) {
      alert('Please select a model.');
      return;
    }

    try {
      const config = await fetchConfig(selectedModelId);
      const route = selectedModelIdForComparison
        ? '/dual-view'
        : '/single-view';
      const state = {
        userName,
        selectedModelId,
        selectedModelName,
        config,
      };

      if (selectedModelIdForComparison) {
        state.selectedModelIdForComparison = selectedModelIdForComparison;
        state.selectedModelNameForComparison = selectedModelNameForComparison;
      }
      navigate(route, { state });
    } catch (error) {
      console.error('Error handling submit', error);
    }
  };

  return (
    <div>
      <Title />
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

export default Index;
