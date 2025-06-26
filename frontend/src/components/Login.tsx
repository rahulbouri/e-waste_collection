import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

const otpValidationSchema = yup.object({
  otp: yup
    .string()
    .length(6, 'OTP must be 6 digits')
    .required('OTP is required'),
});

const Login: React.FC = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailForm = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await authAPI.login(values.email);
        setShowOTP(true);
        toast.success('OTP sent to your email!');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to send OTP');
      } finally {
        setLoading(false);
      }
    },
  });

  const otpForm = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: otpValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await authAPI.verifyOTP(values.otp);
        if (response.success) {
          toast.success('Login successful!');
          navigate('/dashboard');
        } else {
          toast.error(response.message);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to verify OTP');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            E-Waste Collection
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {showOTP ? 'Enter OTP' : 'Login with Email'}
          </Typography>

          {!showOTP ? (
            <Box component="form" onSubmit={emailForm.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={emailForm.values.email}
                onChange={emailForm.handleChange}
                error={emailForm.touched.email && Boolean(emailForm.errors.email)}
                helperText={emailForm.touched.email && emailForm.errors.email}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={otpForm.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                fullWidth
                id="otp"
                name="otp"
                label="OTP Code"
                value={otpForm.values.otp}
                onChange={otpForm.handleChange}
                error={otpForm.touched.otp && Boolean(otpForm.errors.otp)}
                helperText={otpForm.touched.otp && otpForm.errors.otp}
                disabled={loading}
                inputProps={{ maxLength: 6 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => setShowOTP(false)}
                disabled={loading}
              >
                Back to Email
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 