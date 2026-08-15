import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Groups as GroupsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ApiError, getAdminUsers } from '../api/client';
import { userDisplayName, initialsOf } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setAccessDenied(false);
    setUsers(null);
    try {
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setAccessDenied(true);
      } else {
        setError(err?.message || 'Unable to load users.');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAdminUsers()
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 403) {
          setAccessDenied(true);
        } else {
          setError(err?.message || 'Unable to load users.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (accessDenied) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your account is not authorized to view this page.
        </Typography>
        <Button variant="contained" color="primary" onClick={logout}>
          Back to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all registered users and their details.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={load}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Paper>
      )}

      {users === null && !error && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress color="secondary" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading users...
          </Typography>
        </Paper>
      )}

      {users !== null && users.length === 0 && !error && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <GroupsIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            No registered users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no users in the system yet.
          </Typography>
        </Paper>
      )}

      {users !== null && users.length > 0 && (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const name = userDisplayName(user);
                return (
                  <TableRow
                    key={user.id}
                    hover
                    onClick={() => navigate(`/dashboard/users/${user.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'primary.main',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                          }}
                        >
                          {initialsOf(name)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="right">
                      <ChevronRightIcon color="action" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
