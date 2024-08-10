import React, { useState, useEffect } from 'react';
import '../../styles/style.css';
import { useNavigate } from 'react-router-dom';
import Title from './MainTitle';
import SsrModelSelector from './SsrModelSelector';

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

    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Title />
      <SsrModelSelector
        setUserName={setUserName}
        selectedModelId={selectedModelId}
        setSelectedModelId={setSelectedModelId}
        setSelectedModelName={setSelectedModelName}
        selectedModelIdForComparison={selectedModelIdForComparison}
        setSelectedModelIdForComparison={setSelectedModelIdForComparison}
        setSelectedModelNameForComparison={setSelectedModelNameForComparison}
        allModels={allModels}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default Index;
