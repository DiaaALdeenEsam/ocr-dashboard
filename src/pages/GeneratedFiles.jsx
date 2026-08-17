import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  CloudQueue as StorageIcon,
  DataObject as JsonIcon,
  Delete as DeleteIcon,
  Description as WordIcon,
  Download as DownloadIcon,
  FolderZip as GeneratedIcon,
  Image as ImageIcon,
  MoreVert as MoreIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { formatFileSize } from '../utils/format';

const FORMAT = {
  PDF: 'PDF',
  JSON: 'JSON',
  WORD: 'WORD',
  EXCEL: 'EXCEL',
};

function sourceThumb(label, fill) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="10" fill="${fill}"/>
      <rect x="12" y="14" width="56" height="8" rx="2" fill="#ffffff99"/>
      <rect x="12" y="28" width="42" height="6" rx="2" fill="#ffffff66"/>
      <rect x="12" y="40" width="50" height="6" rx="2" fill="#ffffff55"/>
      <rect x="12" y="52" width="28" height="6" rx="2" fill="#ffffff44"/>
      <text x="40" y="72" text-anchor="middle" font-size="9" fill="#ffffffcc" font-family="Inter, Arial">${label}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const INITIAL_FILES = [
  {
    id: 1,
    fileName: 'extracted_doc.pdf',
    format: FORMAT.PDF,
    size: 4_850_000,
    createdAt: '2026-08-17T10:24:00Z',
    sourceImageName: 'invoice_scan.jpg',
    sourceImageUrl: sourceThumb('JPG', '#054425'),
    previewText: 'Structured invoice fields extracted from invoice_scan.jpg.',
  },
  {
    id: 2,
    fileName: 'data.json',
    format: FORMAT.JSON,
    size: 1_240_000,
    createdAt: '2026-08-16T18:02:00Z',
    sourceImageName: 'receipt_front.png',
    sourceImageUrl: sourceThumb('PNG', '#15803D'),
    previewText: '{\n  "merchant": "Al Noor Market",\n  "total": 48.75,\n  "currency": "USD"\n}',
  },
  {
    id: 3,
    fileName: 'report.xlsx',
    format: FORMAT.EXCEL,
    size: 3_670_000,
    createdAt: '2026-08-16T09:41:00Z',
    sourceImageName: 'ledger_page.jpg',
    sourceImageUrl: sourceThumb('JPG', '#1E5631'),
    previewText: 'Tabular ledger rows exported from ledger_page.jpg.',
  },
  {
    id: 4,
    fileName: 'doc.docx',
    format: FORMAT.WORD,
    size: 2_180_000,
    createdAt: '2026-08-15T14:12:00Z',
    sourceImageName: 'contract_page_01.png',
    sourceImageUrl: sourceThumb('PNG', '#134023'),
    previewText: 'Formatted contract text generated from contract_page_01.png.',
  },
  {
    id: 5,
    fileName: 'summary.pdf',
    format: FORMAT.PDF,
    size: 2_560_000,
    createdAt: '2026-08-14T11:05:00Z',
    sourceImageName: 'notes_board.jpg',
    sourceImageUrl: sourceThumb('JPG', '#054425'),
    previewText: 'Summary PDF compiled from handwritten notes_board.jpg.',
  },
];

const FORMAT_META = {
  [FORMAT.PDF]: { color: 'error', icon: PdfIcon },
  [FORMAT.JSON]: { color: 'secondary', icon: JsonIcon },
  [FORMAT.WORD]: { color: 'primary', icon: WordIcon },
  [FORMAT.EXCEL]: { color: 'success', icon: ExcelIcon },
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

function FormatIcon({ format, fontSize = 'small' }) {
  const Icon = FORMAT_META[format]?.icon || WordIcon;
  const color = FORMAT_META[format]?.color || 'action';
  return <Icon fontSize={fontSize} color={color} />;
}

function FormatBadge({ format }) {
  return (
    <Chip
      size="small"
      label={format}
      color={FORMAT_META[format]?.color || 'default'}
      variant="outlined"
      icon={<FormatIcon format={format} />}
    />
  );
}

function SourceThumbnail({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Box
        sx={{
          width: 48,
          height: 48,
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
        width: 48,
        height: 48,
        objectFit: 'contain',
        borderRadius: 1,
        bgcolor: 'action.hover',
        flexShrink: 0,
        display: 'block',
      }}
    />
  );
}

function FileActions({ file, onPreview, onDownload, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Actions for ${file.fileName}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDownload(file);
          }}
        >
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onPreview(file);
          }}
        >
          <PreviewIcon fontSize="small" sx={{ mr: 1 }} /> Preview
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDelete(file);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </>
  );
}

function PreviewDialog({ file, onClose, onDownload }) {
  const open = Boolean(file);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Preview</DialogTitle>
      <DialogContent>
        {file && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                component="img"
                src={file.sourceImageUrl}
                alt={file.sourceImageName}
                sx={{
                  width: 160,
                  height: 160,
                  objectFit: 'contain',
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {file.fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Generated from {file.sourceImageName} on {formatDate(file.createdAt)}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-wrap', fontFamily: file.format === FORMAT.JSON ? 'monospace' : 'inherit' }}
              >
                {file.previewText}
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {file && (
          <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={() => onDownload(file)}>
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default function GeneratedFiles() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [previewFile, setPreviewFile] = useState(null);
  const [toast, setToast] = useState('');

  const totalStorage = useMemo(
    () => files.reduce((sum, file) => sum + (file.size || 0), 0),
    [files],
  );

  const handleDownload = (file) => {
    const blob = new Blob([file.previewText || file.fileName], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.fileName;
    link.click();
    URL.revokeObjectURL(url);
    setToast(`Downloading ${file.fileName}`);
  };

  const handleDelete = (file) => {
    setFiles((current) => current.filter((item) => item.id !== file.id));
    if (previewFile?.id === file.id) setPreviewFile(null);
    setToast(`${file.fileName} removed from this list`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Generated Files
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and view files extracted from processed images.
        </Typography>
      </Box>

      <Card sx={{ mb: 3, maxWidth: { md: 420 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Used Storage
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {formatFileSize(totalStorage)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>
                Across {files.length} generated file{files.length === 1 ? '' : 's'}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <StorageIcon />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {files.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <GeneratedIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            No generated files found.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Exported PDF, JSON, Word, and Excel files will appear here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
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
              {files.map((file) => (
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
                        <FormatIcon format={file.format} />
                      </Box>
                      <Typography variant="body2" fontWeight={600} noWrap title={file.fileName}>
                        {file.fileName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <SourceThumbnail src={file.sourceImageUrl} alt={file.sourceImageName} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        title={file.sourceImageName}
                      >
                        {file.sourceImageName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    <FormatBadge format={file.format} />
                  </TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell align="right">
                    <FileActions
                      file={file}
                      onPreview={setPreviewFile}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PreviewDialog
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
