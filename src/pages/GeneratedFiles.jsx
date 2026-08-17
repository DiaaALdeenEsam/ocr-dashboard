import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import {
  CloudQueue as StorageIcon,
  DataObject as JsonIcon,
  Description as WordIcon,
  Download as DownloadIcon,
  FolderZip as GeneratedIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import {
  ApiError,
  downloadGeneratedFile,
  getGeneratedFile,
  getGeneratedFiles,
  getGeneratedFileStorageStats,
  resolveMediaUrl,
} from '../api/client';
import { formatFileSize } from '../utils/format';

const WORD_BLUE = '#2B579A';
const PAGE_SIZE = 20;

const FORMAT = {
  PDF: 'PDF',
  JSON: 'JSON',
  WORD: 'WORD',
  EXCEL: 'EXCEL',
};

const FORMAT_META = {
  [FORMAT.PDF]: { color: 'error', icon: PdfIcon, bar: '#C62828' },
  [FORMAT.JSON]: { color: 'secondary', icon: JsonIcon, bar: '#D4AF37' },
  [FORMAT.WORD]: { color: 'info', icon: WordIcon, bar: WORD_BLUE, iconColor: WORD_BLUE },
  [FORMAT.EXCEL]: { color: 'success', icon: ExcelIcon, bar: '#2E7D32' },
};

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

function errorMessageFor(err, fallback) {
  if (err instanceof ApiError) {
    if (err.status === 0) return 'Unable to reach the server. Please try again.';
    if (err.status === 401) return 'Your session has expired. Please sign in again.';
    if (err.status === 403) return 'You do not have permission to view this resource.';
    if (err.status === 404) return 'The requested file was not found.';
    if (err.status === 409) return err.message || 'The stored file could not be found.';
    if (err.status >= 500) return 'Server error. Please try again later.';
    return err.message || fallback;
  }
  return 'Unable to reach the server. Please try again.';
}

function FormatIcon({ format, fontSize = 'small' }) {
  const meta = FORMAT_META[format];
  const Icon = meta?.icon || WordIcon;
  if (meta?.iconColor) {
    return <Icon fontSize={fontSize} sx={{ color: meta.iconColor }} />;
  }
  return <Icon fontSize={fontSize} color={meta?.color || 'action'} />;
}

function FormatBadge({ format }) {
  const label = format || '—';
  const meta = FORMAT_META[format];
  return (
    <Chip
      size="small"
      label={label}
      color={format === FORMAT.WORD ? undefined : meta?.color || 'default'}
      variant="outlined"
      icon={meta ? <FormatIcon format={format} /> : undefined}
      sx={
        format === FORMAT.WORD
          ? { color: WORD_BLUE, borderColor: WORD_BLUE, '& .MuiChip-icon': { color: WORD_BLUE } }
          : undefined
      }
    />
  );
}

function SourceThumbnail({ src, alt, size = 48 }) {
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
      <TableCell sx={{ width: 180, color: 'text.secondary', border: 0, py: 0.75, pl: 0 }}>
        {label}
      </TableCell>
      <TableCell sx={{ border: 0, py: 0.75, pr: 0 }}>
        {value ?? '—'}
      </TableCell>
    </TableRow>
  );
}

function sourceImageOf(file) {
  return file?.source_image || {};
}

function sourceImageUrl(file) {
  const source = sourceImageOf(file);
  return resolveMediaUrl(source.thumbnail_url || source.image_url);
}

function FileDetailsDialog({ open, loading, error, file, downloading, onClose, onDownload, onRetry }) {
  const source = sourceImageOf(file);
  const imageUrl = sourceImageUrl(file);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>File details</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress color="secondary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading file details...
            </Typography>
          </Box>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!loading && !error && file && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <SourceThumbnail src={imageUrl} alt={source.file_name || file.file_name} size={160} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {file.file_name || '—'}
            </Typography>
            <Table size="small">
              <TableBody>
                <DetailRow label="ID" value={file.id} />
                <DetailRow label="File name" value={file.file_name || '—'} />
                <DetailRow label="Type" value={file.file_type || '—'} />
                <DetailRow label="MIME type" value={file.mime_type || '—'} />
                <DetailRow
                  label="Size"
                  value={file.file_size_human || formatFileSize(file.file_size_bytes)}
                />
                <DetailRow label="Created" value={formatDate(file.created_at)} />
                <DetailRow label="Source image ID" value={source.id ?? '—'} />
                <DetailRow label="Source image" value={source.file_name || '—'} />
                <DetailRow label="Source status" value={source.status || '—'} />
                <DetailRow label="Document type" value={source.document_type || '—'} />
                <DetailRow label="Source uploaded" value={formatDate(source.uploaded_at)} />
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {file && (
          <Button
            variant="contained"
            color="primary"
            startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            disabled={downloading || loading}
            onClick={() => onDownload(file)}
          >
            {downloading ? 'Downloading...' : 'Download'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function StorageOverview({ stats, loading, error, onRetry }) {
  const totalBytes = stats?.total_bytes ?? 0;
  const breakdown = useMemo(() => {
    const rows = Array.isArray(stats?.by_file_type) ? stats.by_file_type : [];
    return rows
      .map((row) => ({
        format: row.file_type,
        size: row.bytes ?? 0,
        count: row.count ?? 0,
        pct: totalBytes ? ((row.bytes ?? 0) / totalBytes) * 100 : 0,
      }))
      .sort((a, b) => b.size - a.size);
  }, [stats, totalBytes]);

  const heaviest = breakdown.find((item) => item.size > 0);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Total Used Storage
            </Typography>
            {loading && !stats ? (
              <CircularProgress size={28} color="secondary" sx={{ my: 1 }} />
            ) : (
              <Typography
                fontWeight={800}
                sx={{ fontSize: { xs: '2.4rem', sm: '3.2rem' }, lineHeight: 1.1, letterSpacing: '-0.03em' }}
              >
                {formatFileSize(totalBytes)}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {stats
                ? `${stats.total_files ?? 0} generated file${stats.total_files === 1 ? '' : 's'}${
                    heaviest ? ` · ${heaviest.format} takes the most space` : ''
                  }`
                : loading
                  ? 'Loading storage statistics...'
                  : 'Storage statistics unavailable'}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <StorageIcon sx={{ fontSize: 36 }} />
          </Box>
        </Box>

        {error && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {stats && (
          <>
            <Box
              sx={{
                display: 'flex',
                height: 18,
                borderRadius: 999,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                mb: 2.5,
              }}
            >
              {breakdown
                .filter((item) => item.pct > 0)
                .map((item) => (
                  <Box
                    key={item.format}
                    title={`${item.format}: ${formatFileSize(item.size)}`}
                    sx={{
                      width: `${item.pct}%`,
                      bgcolor: FORMAT_META[item.format]?.bar || 'primary.main',
                      minWidth: 6,
                      transition: 'width 0.3s ease',
                    }}
                  />
                ))}
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 1.5,
              }}
            >
              {breakdown.map((item) => (
                <Box
                  key={item.format}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    borderLeft: '3px solid',
                    borderColor: FORMAT_META[item.format]?.bar || 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <FormatIcon format={item.format} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {item.format}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {formatFileSize(item.size)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.count} file{item.count === 1 ? '' : 's'} · {item.pct.toFixed(0)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function GeneratedFiles() {
  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState(null);
  const [detailsFile, setDetailsFile] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [downloadingId, setDownloadingId] = useState(null);
  const [toast, setToast] = useState('');

  const loadFiles = useCallback(async (nextPage = 1) => {
    setListLoading(true);
    setListError('');
    try {
      const data = await getGeneratedFiles({ page: nextPage, pageSize: PAGE_SIZE });
      setFiles(data.results);
      setCount(data.count);
      setPage(data.page || nextPage);
    } catch (err) {
      setListError(errorMessageFor(err, 'Unable to load generated files.'));
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const data = await getGeneratedFileStorageStats();
      setStats(data);
    } catch (err) {
      setStatsError(errorMessageFor(err, 'Unable to load storage statistics.'));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles(1);
    loadStats();
  }, [loadFiles, loadStats]);

  const loadDetails = useCallback(async (id) => {
    setDetailsLoading(true);
    setDetailsError('');
    setDetailsFile(null);
    try {
      const data = await getGeneratedFile(id);
      setDetailsFile(data);
    } catch (err) {
      setDetailsError(errorMessageFor(err, 'Unable to load file details.'));
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const handleView = (file) => {
    setDetailsId(file.id);
    setDetailsOpen(true);
    loadDetails(file.id);
  };

  const handleDownload = async (file) => {
    if (!file?.id || downloadingId) return;
    setDownloadingId(file.id);
    try {
      const filename = await downloadGeneratedFile(file.id, file.file_name || 'download');
      setToast(`Downloading ${filename}`);
    } catch (err) {
      setToast(errorMessageFor(err, 'Unable to download this file.'));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRefresh = () => {
    loadFiles(page);
    loadStats();
  };

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
            Generated Files
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and view files extracted from processed images.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={listLoading}>
          Refresh
        </Button>
      </Box>

      <StorageOverview
        stats={stats}
        loading={statsLoading}
        error={statsError}
        onRetry={loadStats}
      />

      {listError && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => loadFiles(page)}>
                Retry
              </Button>
            }
          >
            {listError}
          </Alert>
        </Paper>
      )}

      {listLoading && files.length === 0 && !listError && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress color="secondary" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading generated files...
          </Typography>
        </Paper>
      )}

      {!listLoading && files.length === 0 && !listError && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <GeneratedIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            No generated files found.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Exported PDF, JSON, Word, and Excel files will appear here.
          </Typography>
        </Paper>
      )}

      {files.length > 0 && (
        <Paper>
          {listLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={22} color="secondary" />
            </Box>
          )}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Source Image</TableCell>
                  <TableCell>File Size</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => {
                  const source = sourceImageOf(file);
                  const isDownloading = downloadingId === file.id;
                  return (
                    <TableRow key={file.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor: 'action.hover',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FormatIcon format={file.file_type} />
                          </Box>
                          <Typography variant="body2" fontWeight={600} noWrap title={file.file_name}>
                            {file.file_name || '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          <SourceThumbnail
                            src={sourceImageUrl(file)}
                            alt={source.file_name || file.file_name}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            title={source.file_name}
                          >
                            {source.file_name || '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {file.file_size_human || formatFileSize(file.file_size_bytes)}
                      </TableCell>
                      <TableCell>
                        <FormatBadge format={file.file_type} />
                      </TableCell>
                      <TableCell>{formatDate(file.created_at)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                          <Button size="small" onClick={() => handleView(file)}>
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            disabled={isDownloading}
                            startIcon={
                              isDownloading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />
                            }
                            onClick={() => handleDownload(file)}
                          >
                            {isDownloading ? 'Downloading...' : 'Download'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={count}
            page={Math.max(0, page - 1)}
            onPageChange={(_event, nextPage) => loadFiles(nextPage + 1)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
          />
        </Paper>
      )}

      <FileDetailsDialog
        open={detailsOpen}
        loading={detailsLoading}
        error={detailsError}
        file={detailsFile}
        downloading={downloadingId === detailsId}
        onClose={() => {
          setDetailsOpen(false);
          setDetailsFile(null);
          setDetailsError('');
          setDetailsId(null);
        }}
        onDownload={handleDownload}
        onRetry={() => detailsId && loadDetails(detailsId)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
