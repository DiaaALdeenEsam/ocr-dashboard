import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Login as LoginIcon,
  LockOutlined as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const formData = new FormData(event.currentTarget);
    const username = formData.get('username').trim();
    const password = formData.get('password');

    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            required
            label="Username"
            placeholder="Enter your username"
            name="username"
            autoComplete="username"
            autoFocus
            disabled={loading}
            InputProps={{
              startAdornment: <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            fullWidth
            required
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
            name="password"
            autoComplete="current-password"
            disabled={loading}
            InputProps={{
              startAdornment: <LockIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
              endAdornment: (
                <Box
                  component="button"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  sx={{
                    border: 'none',
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'action.active',
                    p: 0,
                  }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </Box>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography
              component={Link}
              to="/forgot-password"
              variant="body2"
              fontWeight={600}
              color="primary.main"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Forgot password?
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />
            }
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Typography
            component={Link}
            to="/signup"
            variant="body2"
            fontWeight={600}
            color="secondary.main"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Sign Up
          </Typography>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
