import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Email as EmailIcon,
  HowToReg as SignupIcon,
  LockOutlined as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import AuthLayout from '../components/AuthLayout';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to get started with your dashboard."
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            required
            label="Full Name"
            placeholder="John Doe"
            name="name"
            autoComplete="name"
            InputProps={{
              startAdornment: <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            fullWidth
            required
            type="email"
            label="Email Address"
            placeholder="you@company.com"
            name="email"
            autoComplete="email"
            InputProps={{
              startAdornment: <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            fullWidth
            required
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a password"
            name="password"
            autoComplete="new-password"
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
          <TextField
            fullWidth
            required
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            placeholder="Re-enter your password"
            name="confirmPassword"
            autoComplete="new-password"
            InputProps={{
              startAdornment: <LockIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
              endAdornment: (
                <Box
                  component="button"
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                  {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </Box>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            startIcon={<SignupIcon />}
          >
            Sign Up
          </Button>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Typography
            component={Link}
            to="/login"
            variant="body2"
            fontWeight={600}
            color="secondary.main"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Sign In
          </Typography>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
