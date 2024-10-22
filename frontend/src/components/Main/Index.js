import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import '../../styles/style.css';
import Title from './MainTitle';
import SsrModelSelector from './SsrModelSelector';
import WebglModelSelector from './WebglModelSelector';

const Index = () => {
  const navigate = useNavigate();

  const backendAddress = process.env.REACT_APP_BACKEND_URL;
  const backendCsrAddress = process.env.REACT_APP_CSR_BACKEND_URL;

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
        return;
      }

      fetch(backendAddress + '/api/model_ids')
        .then((response) => response.json())
        .then((data) => {
          if (JSON.stringify(data) !== JSON.stringify(allModels)) {
            setAllModels(data);
          }
        })
        .catch((error) => {
          console.error('Fetching data failed', error);
          setAllModels([]);
        });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [backendAddress, isSubmitting, allModels]);

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
      throw error;
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

  const getWebglModelUrl = (modelId) => {
    return `${backendCsrAddress}/api/models/splat/${modelId}`;
  };

  const handleWebglModelSubmit = async (modelId, comparisonModelId = null) => {
    setIsSubmitting(true);
    try {
      // Process URLs for both models
      const modelUrl = getWebglModelUrl(modelId); // First model URL
      const comparisonModelUrl = comparisonModelId
        ? getWebglModelUrl(comparisonModelId)
        : null; // Add comparison model URL

      const route = comparisonModelId
        ? '/webgl/dual-view'
        : '/webgl/single-view'; // Navigate to a different route if a comparison model exists
      const state = {
        modelUrl,
        comparisonModelUrl, // Add comparison model URL
      };
      navigate(route, { state });
    } catch (error) {
      console.error('Error handling submit', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {' '}
      {/* Overall container style */}
      <Card sx={{ padding: 4, boxShadow: 3, borderRadius: 2 }}>
        {' '}
        {/* Wrap the entire layout with Card for a modern design */}
        <CardContent>
          <Title /> {/* Title component */}
          {/* <EmailInputForm setUserName={setUserName} /> Email input form */}
          <Divider sx={{ my: 4 }} /> {/* Section divider */}
          {/* SSR Model Selector section */}
          <Box className="section" sx={{ mb: 4 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Server-Side Rendering Model Selector
            </Typography>
            <SsrModelSelector
              selectedModelId={selectedModelId}
              setSelectedModelId={setSelectedModelId}
              setSelectedModelName={setSelectedModelName}
              selectedModelIdForComparison={selectedModelIdForComparison}
              setSelectedModelIdForComparison={setSelectedModelIdForComparison}
              setSelectedModelNameForComparison={
                setSelectedModelNameForComparison
              }
              allModels={allModels}
              handleSubmit={handleSsrModelSubmit}
            />
          </Box>
          <Divider sx={{ my: 4 }} /> {/* Section divider */}
          {/* WebGL Model Selector section */}
          <Box className="section" sx={{ mb: 4 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Client-Side Rendering (WebGL) Model Selector
            </Typography>
            <WebglModelSelector handleSubmit={handleWebglModelSubmit} />
          </Box>
          {isSubmitting && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress /> {/* Display while loading */}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Index;
