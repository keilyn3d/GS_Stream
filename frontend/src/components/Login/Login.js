import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is blocked from localStorage
    const blockExpireTime = localStorage.getItem('blockExpireTime');
    if (blockExpireTime) {
      const now = new Date().getTime();
      if (now < blockExpireTime) {
        setIsBlocked(true);
        const timeout = blockExpireTime - now;
        // Unblock the user after the timeout
        setTimeout(() => {
          setIsBlocked(false);
          localStorage.removeItem('blockExpireTime');
          setAttempts(0);
        }, timeout);
      } else {
        // Block time expired
        localStorage.removeItem('blockExpireTime');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlocked) {
      setErrorMessage(
        'You have been blocked for 1 hour after 5 failed attempts. Please try again later.',
      );
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_AUTH_BACKEND_URL}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!response.ok) {
        throw new Error('Invalid username or password.');
      }

      const data = await response.json();
      setToken(data.token);
      navigate('/');
    } catch (error) {
      console.error(error.message);
      setErrorMessage(error.message);
      setUsername('');
      setPassword('');
      setAttempts((prev) => prev + 1);

      if (attempts + 1 >= 5) {
        const blockTime = new Date().getTime() + 60 * 60 * 1000; // Block for 1 hour
        localStorage.setItem('blockExpireTime', blockTime);
        setIsBlocked(true);
        setErrorMessage(
          'You have been blocked for 1 hour after 5 failed attempts. Please try again later.',
        );
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid #ccc',
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography component="h1" variant="h5">
          TowerEye AI™ Login
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isBlocked}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isBlocked}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isBlocked}
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </Box>
        {/* Footer with Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 3,
          }}
        >
          <Typography variant="body2" sx={{ mr: 1 }}>
            Visit us on
          </Typography>
          <a href="https://cviss.net" target="_blank" rel="noopener noreferrer">
            <img src="/icons/cviss.jpeg" alt="CViSS" width="40" height="30" />
          </a>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
