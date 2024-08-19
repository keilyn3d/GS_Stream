import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import '../../styles/style.css';

import Title from './MainTitle';
import EmailInputForm from './EmailInputForm';
import SsrModelSelector from './SsrModelSelector';
import WebglModelSelector from './WebglModelSelector';

const Index = () => {
  const navigate = useNavigate();

  const backendAddress = process.env.REACT_APP_BACKEND_URL;
  const backendCsrAddress = process.env.REACT_APP_CSR_BACKEND_URL;

  const [userName, setUserName] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedModelIdForComparison, setSelectedModelIdForComparison] =
    useState('');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [selectedModelNameForComparison, setSelectedModelNameForComparison] =
    useState('');
  const [allModels, setAllModels] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isSubmitting) {
        // Skip fetch request if isSubmitting is true
        return;
      }

      fetch(backendAddress + '/api/model_ids')
        .then((response) => response.json())
        .then((data) => {
          // Only update state if data has changed
          if (JSON.stringify(data) !== JSON.stringify(allModels)) {
            setAllModels(data);
          }
        })
        .catch((error) => {
          console.error('Fetching data failed', error);
          // Initialize allModels if fetch request fails
          setAllModels([]);
        });
    }, 1000); // 1000ms = 1s

    // Clean up function
    return () => {
      clearInterval(intervalId);
    };
  }, [backendAddress, isSubmitting]);
  console.log(allModels);

  const fetchConfig = async () => {
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

  const handleSsrModelSubmit = async (event) => {
    event.preventDefault();

    if (!selectedModelId) {
      alert('Please select a model.');
      return;
    }

    setIsSubmitting(true);

    try {
      const config = await fetchConfig();
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchWebglModel = async (modelId) => {
    try {
      const apiUrl = `${backendCsrAddress}/api/models/splat/${modelId}`;
      console.log(apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }
      return await response.blob();
    } catch (error) {
      console.error('Fetching splat model failed', error);
      throw error; // Ensure the error is propagated if necessary
    }
  };

  const handleWebglModelSubmit = async (modelId) => {
    setIsSubmitting(true);
    try {
      const response = await fetchWebglModel(modelId);
      const route = '/webgl/single-view';
      const state = {
        userName,
        response,
      };
      console.log('Navigating to:', route);
      navigate(route, { state });
    } catch (error) {
      console.error('Error handling submit', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Title />
      <EmailInputForm setUserName={setUserName} />
      <div className="divider"></div>
      <div className="section">
        <h2> Server-Side Rendering(SSR) Model Selector</h2>
        <SsrModelSelector
          selectedModelId={selectedModelId}
          setSelectedModelId={setSelectedModelId}
          setSelectedModelName={setSelectedModelName}
          selectedModelIdForComparison={selectedModelIdForComparison}
          setSelectedModelIdForComparison={setSelectedModelIdForComparison}
          setSelectedModelNameForComparison={setSelectedModelNameForComparison}
          allModels={allModels}
          handleSubmit={handleSsrModelSubmit}
        />
      </div>
      <div className="divider"></div>
      <div className="section">
        <h2>WebGL Rendering Model Selector</h2>
        <WebglModelSelector handleSubmit={handleWebglModelSubmit} />
      </div>
      <div className="divider"></div>
    </div>
  );
};

export default Index;
