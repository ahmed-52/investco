import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5001/users/login', {
        user: username,
        pass: password,
      });
      localStorage.setItem('token', response.data.token); // Store token
      alert('Login successful!');
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data.message);
        alert('Login failed: ' + error.response.data.message);
      } else if (error.request) {
        console.error('No Response:', error.request);
        alert('Login failed: No response from server');
      } else {
        console.error('Error:', error.message);
        alert('Login failed: ' + error.message);
      }
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
