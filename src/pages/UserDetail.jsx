import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  CloudQueue as StorageIcon,
  Description as DocsIcon,
  Edit as EditIcon,
  FolderOpen as FolderOpenIcon,
  PendingActions as PendingIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ApiError, getAdminUser } from '../api/client';
import { formatFileSize } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import {
  AccessDeniedPanel,
  EmptyPanel,
  GlassPanel,
  glowTableSx,
  HeroChip,
  KpiTile,
  LoadingPanel,
  PageHero,
} from '../components/visual';

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

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
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
    return <AccessDeniedPanel onLogout={logout} />;
  }

  const name = user?.username || `User #${id}`;
  const files = Array.isArray(user?.files) ? user.files : null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/users')}
        sx={{ mb: 2, color: 'secondary.main' }}
      >
        Back to operators
      </Button>

      <PageHero
        eyebrow="Profile dossier"
        title={name}
        subtitle={user?.email || 'Inspect storage, extraction outcomes, and edit history for this operator.'}
        action={
          <HeroChip>
            Last upload {formatDate(user?.last_upload_at)}
          </HeroChip>
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {user === null && !error && <LoadingPanel label="Opening operator dossier..." />}

      {user !== null && (
        <>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiTile
                title="Archive"
                value={displayTotalSize(user)}
                hint="storage used by this operator"
                icon={<StorageIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiTile
                title="Captures"
                value={user.total_files ?? 0}
                hint="source images uploaded"
                icon={<DocsIcon fontSize="small" />}
                accent="gold"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiTile
                title="Cleared"
                value={`${user.total_completed ?? 0} / ${user.total_pending ?? 0}`}
                hint="completed / pending records"
                icon={<CheckCircleIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiTile
                title="Edits"
                value={`${user.total_used_edits ?? 0} / ${user.total_edits ?? 0}`}
                hint="used / total corrections"
                icon={<EditIcon fontSize="small" />}
                accent="gold"
              />
            </Grid>
          </Grid>

          <GlassPanel>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: 'primary.light',
                    fontWeight: 800,
                    boxShadow: '0 0 18px rgba(61,220,132,0.28)',
                  }}
                >
                  {name.slice(0, 2).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.16em', fontWeight: 700 }}>
                    Activity
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {files !== null ? 'Uploaded files' : 'Pipeline notes'}
                  </Typography>
                </Box>
              </Box>

              {files !== null ? (
                files.length === 0 ? (
                  <EmptyPanel
                    icon={<FolderOpenIcon sx={{ fontSize: 48 }} />}
                    title="No uploads yet"
                    subtitle="This user has not uploaded any files yet."
                  />
                ) : (
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={glowTableSx(theme)}>
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
                              <Typography variant="body2" fontWeight={600} noWrap title={file.name}>
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
                )
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {user.total_failed > 0
                      ? `${user.total_failed} failed upload${user.total_failed === 1 ? '' : 's'}`
                      : 'No failed uploads.'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </GlassPanel>
        </>
      )}
    </Box>
  );
}
