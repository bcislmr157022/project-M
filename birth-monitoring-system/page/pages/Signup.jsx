import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import API from '../services/api';

export default function Signup() {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    user_role: 'nurse',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/signup', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.error || "Signup failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4">Sign Up</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            name="user_name"
            value={formData.user_name}
            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="user_email"
            type="email"
            value={formData.user_email}
            onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="user_password"
            type="password"
            value={formData.user_password}
            onChange={(e) => setFormData({ ...formData, user_password: e.target.value })}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
}