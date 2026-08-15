import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  CloudUpload as UploadIcon,
  Description as DocIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  TableChart as SpreadsheetIcon,
} from '@mui/icons-material';
import { fetchProfile, fetchUserFiles } from '../api/client';

function formatBytes(bytes, decimals = 1) {
  if (bytes == null || bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(decimals)} ${units[i]}`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getInitials(name) {
  return (
    (name || '')
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}

function getFileType(file) {
  const ext = String(file?.type || (file?.name || '').split('.').pop() || '').toLowerCase();
  if (['pdf'].includes(ext)) return 'PDF';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'image'].includes(ext)) return 'Image';
  if (['xlsx', 'xls', 'csv', 'spreadsheet', 'numbers'].includes(ext)) return 'Spreadsheet';
  if (['doc', 'docx', 'txt', 'md', 'doc'].includes(ext)) return 'Doc';
  return ext || 'File';
}

function FileTypeIcon({ file }) {
  const iconProps = { fontSize: 'medium' };
  const ext = String(file?.type || (file?.name || '').split('.').pop() || '').toLowerCase();
  if (['pdf'].includes(ext)) return <PdfIcon color="error" {...iconProps} />;
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'image'].includes(ext)) {
    return <ImageIcon color="secondary" {...iconProps} />;
  }
  if (['xlsx', 'xls', 'csv', 'spreadsheet', 'numbers'].includes(ext)) {
    return <SpreadsheetIcon color="success" {...iconProps} />;
  }
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) return <DocIcon color="primary" {...iconProps} />;
  return <FileIcon color="action" {...iconProps} />;
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState([]);
  const [backendTotalSize, setBackendTotalSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [profileData, filesData] = await Promise.all([fetchProfile(), fetchUserFiles()]);
      setProfile(profileData);
      setFiles(Array.isArray(filesData) ? filesData : filesData?.files || []);
      setBackendTotalSize(filesData?.total_size ?? null);
    } catch (err) {
      setError(err?.message || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    loadData();
  };

  const totalSize = useMemo(() => {
    if (backendTotalSize != null) return Number(backendTotalSize) || 0;
    return files.reduce((sum, file) => sum + (Number(file.size) || 0), 0);
  }, [backendTotalSize, files]);

  const initials = useMemo(() => getInitials(profile?.name), [profile]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your account details and uploaded files.
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
          >
            Try Again
          </Button>
        </Paper>
      )}

      {!loading && !error && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 76,
                      height: 76,
                      bgcolor: 'primary.main',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      {profile?.name || '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile?.email || '—'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Uploaded Files
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {files.length} file{files.length === 1 ? '' : 's'} uploaded
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      px: 2.5,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.85 }} display="block">
                      Total Storage Used
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {formatBytes(totalSize)}
                    </Typography>
                  </Box>
                </Box>

                {files.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <UploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No files uploaded yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Files you upload will appear here.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>File</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Size</TableCell>
                          <TableCell>Uploaded</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id ?? file.name} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FileTypeIcon file={file} />
                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 260 }}>
                                  {file.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={getFileType(file)} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{formatBytes(file.size)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(file.uploaded_at)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
