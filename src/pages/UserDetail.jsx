import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
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
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  CloudQueue as StorageIcon,
  Description as DocsIcon,
  Edit as EditIcon,
  FolderOpen as FolderOpenIcon,
  PendingActions as PendingIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ApiError, getAdminUser } from '../api/client';
import { formatFileSize } from '../utils/format';
import { useAuth } from '../context/AuthContext';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function displayTotalSize(user) {
  if (user.bytes_used !== undefined && user.bytes_used !== null) {
    return formatFileSize(user.bytes_used);
  }
  if (user.total_file_size !== undefined && user.total_file_size !== null) {
    return formatFileSize(user.total_file_size);
  }
  if (user.megabytes_used) {
    return formatFileSize(user.megabytes_used * 1024 * 1024);
  }
  return '—';
}

function StatCard({ label, value, icon, accent }) {
  const isSecondary = accent === 'secondary';
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: isSecondary ? 'secondary.light' : 'primary.light',
              color: isSecondary ? 'secondary.contrastText' : 'primary.contrastText',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAdminUser(id)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 403) {
          setAccessDenied(true);
        } else {
          setError(err?.message || 'Unable to load user details.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  const name = user?.username || `User #${id}`;
  const files = Array.isArray(user?.files) ? user.files : null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/users')}
        sx={{ mb: 2, pl: 0 }}
      >
        Back to Users
      </Button>

      {error && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Paper>
      )}

      {user === null && !error && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress color="secondary" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading user details...
          </Typography>
        </Paper>
      )}

      {user !== null && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'primary.main',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  {name.slice(0, 2).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Last upload: {formatDate(user.last_upload_at)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Storage Used"
                value={displayTotalSize(user)}
                icon={<StorageIcon />}
                accent="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Total Files"
                value={user.total_files ?? 0}
                icon={<DocsIcon />}
                accent="secondary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Completed / Pending"
                value={`${user.total_completed ?? 0} / ${user.total_pending ?? 0}`}
                icon={<CheckCircleIcon />}
                accent="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Edits (used / total)"
                value={`${user.total_used_edits ?? 0} / ${user.total_edits ?? 0}`}
                icon={<EditIcon />}
                accent="secondary"
              />
            </Grid>
          </Grid>

          {files !== null ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Uploaded Files
                </Typography>
                {files.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <FolderOpenIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      This user has not uploaded any files yet.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>File</TableCell>
                          <TableCell align="right">Size</TableCell>
                          <TableCell>Uploaded</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500} noWrap title={file.name}>
                                {file.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{formatFileSize(file.size)}</TableCell>
                            <TableCell>{formatDate(file.uploaded_at ?? file.uploaded_date)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.total_failed > 0
                      ? `${user.total_failed} failed upload${user.total_failed === 1 ? '' : 's'}`
                      : 'No failed uploads.'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
