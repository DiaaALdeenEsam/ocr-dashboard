import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ApiError, getUploadedFiles, resolveMediaUrl } from '../api/client';
import { formatFileSize } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import {
  AccessDeniedPanel,
  EmptyPanel,
  GlassPanel,
  glowTableSx,
  HeroChip,
  LoadingPanel,
  PageHero,
} from '../components/visual';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function fileTypeOf(file) {
  const name = String(file?.file_name || '');
  const ext = name.includes('.') ? name.split('.').pop().toUpperCase() : '';
  return ext || file?.document_type || '—';
}

function errorMessageFor(err) {
  if (err instanceof ApiError) {
    if (err.status === 0) return 'Unable to reach the server. Please try again.';
    if (err.status === 401) return 'Your session has expired. Please sign in again.';
    if (err.status === 404) return 'Uploaded files were not found.';
    if (err.status >= 500) return 'Server error. Please try again later.';
    return err.message || 'Unable to load uploaded files.';
  }
  return 'Unable to reach the server. Please try again.';
}

function FileThumbnail({ src, alt, size = 48 }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ImageIcon fontSize="small" color="action" />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: 1,
        bgcolor: 'action.hover',
        flexShrink: 0,
        display: 'block',
      }}
    />
  );
}

function DetailRow({ label, value }) {
  return (
    <TableRow>
      <TableCell sx={{ width: 160, color: 'text.secondary', border: 0, py: 0.75, pl: 0 }}>
        {label}
      </TableCell>
      <TableCell sx={{ border: 0, py: 0.75, pr: 0 }}>
        {value ?? '—'}
      </TableCell>
    </TableRow>
  );
}

function FileDetailsDialog({ file, onClose }) {
  const imageUrl = resolveMediaUrl(file?.image);
  const open = Boolean(file);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>File details</DialogTitle>
      <DialogContent>
        {file && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <FileThumbnail src={imageUrl} alt={file.file_name || 'Uploaded file'} size={160} />
            </Box>
            <Table size="small">
              <TableBody>
                <DetailRow label="Document ID" value={file.id} />
                <DetailRow label="File name" value={file.file_name || '—'} />
                <DetailRow label="Size" value={formatFileSize(file.file_size)} />
                <DetailRow label="Type" value={fileTypeOf(file)} />
                <DetailRow label="Document type" value={file.document_type || '—'} />
                <DetailRow label="Status" value={file.status || '—'} />
                <DetailRow label="Uploaded" value={formatDate(file.uploaded_at)} />
                <DetailRow label="Uploader" value={file.uploader_name || '—'} />
                <DetailRow label="Uploader email" value={file.uploader_email || '—'} />
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function UploadedFiles() {
  const { logout } = useAuth();
  const theme = useTheme();
  const [files, setFiles] = useState(null);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setError('');
    setAccessDenied(false);
    setFiles(null);
    try {
      const data = await getUploadedFiles();
      setFiles(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setAccessDenied(true);
      } else {
        setError(errorMessageFor(err));
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getUploadedFiles()
      .then((data) => {
        if (!cancelled) setFiles(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 403) {
          setAccessDenied(true);
        } else {
          setError(errorMessageFor(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (accessDenied) {
    return <AccessDeniedPanel onLogout={logout} />;
  }

  return (
    <Box>
      <PageHero
        eyebrow="Inbox"
        title="Source captures"
        subtitle="Original images that entered the OCR pipeline — inspect metadata without leaving the vault."
        action={
          <HeroChip icon={<CloudUploadIcon sx={{ color: 'secondary.main', fontSize: 18 }} />}>
            {files?.length ?? 0} files in archive
          </HeroChip>
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={load}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {files === null && !error && <LoadingPanel label="Pulling uploaded captures..." />}

      {files !== null && files.length === 0 && !error && (
        <EmptyPanel
          icon={<CloudUploadIcon sx={{ fontSize: 48 }} />}
          title="No uploaded files found."
          subtitle="Files uploaded to the system will appear here."
        />
      )}

      {files !== null && files.length > 0 && (
        <GlassPanel>
          <CardContent>
            <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.16em', fontWeight: 700 }}>
              Vault
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Uploaded images
            </Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={glowTableSx(theme)}>
                <TableHead>
                  <TableRow>
                    <TableCell>Preview</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell align="right">Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id} hover>
                      <TableCell>
                        <FileThumbnail
                          src={resolveMediaUrl(file.image)}
                          alt={file.file_name || `File ${file.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap title={file.file_name}>
                          {file.file_name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatFileSize(file.file_size)}</TableCell>
                      <TableCell>
                        <Chip label={fileTypeOf(file)} size="small" variant="outlined" color="secondary" />
                      </TableCell>
                      <TableCell>{formatDate(file.uploaded_at)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="contained" color="primary" onClick={() => setSelected(file)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </GlassPanel>
      )}

      <FileDetailsDialog file={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
