import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Description as DocIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  MoreVert as MoreIcon,
  PictureAsPdf as PdfIcon,
  Share as ShareIcon,
  TableChart as SpreadsheetIcon,
} from '@mui/icons-material';

const filters = ['All', 'PDFs', 'Images', 'Spreadsheets'];

const documents = [
  { id: 1, name: 'Q4 Financial Report.pdf', owner: 'Sarah Johnson', size: '2.4 MB', date: '2026-08-10', type: 'PDF' },
  { id: 2, name: 'Team Photo 2026.jpg', owner: 'Michael Chen', size: '4.1 MB', date: '2026-08-09', type: 'Image' },
  { id: 3, name: 'Project Roadmap.docx', owner: 'Emily Rodriguez', size: '890 KB', date: '2026-08-08', type: 'Doc' },
  { id: 4, name: 'Budget Analysis.xlsx', owner: 'James Wilson', size: '1.2 MB', date: '2026-08-07', type: 'Spreadsheet' },
  { id: 5, name: 'User Manual v3.pdf', owner: 'Aisha Patel', size: '5.6 MB', date: '2026-08-05', type: 'PDF' },
  { id: 6, name: 'Logo Assets.png', owner: 'David Kim', size: '320 KB', date: '2026-08-04', type: 'Image' },
  { id: 7, name: 'Meeting Notes.docx', owner: 'Laura Martinez', size: '156 KB', date: '2026-08-03', type: 'Doc' },
  { id: 8, name: 'Sales Data Q3.xlsx', owner: 'Robert Taylor', size: '2.8 MB', date: '2026-08-01', type: 'Spreadsheet' },
];

function TypeIcon({ type }) {
  const iconProps = { fontSize: 'medium' };
  switch (type) {
    case 'PDF':
      return <PdfIcon color="error" {...iconProps} />;
    case 'Image':
      return <ImageIcon color="secondary" {...iconProps} />;
    case 'Spreadsheet':
      return <SpreadsheetIcon color="success" {...iconProps} />;
    case 'Doc':
      return <DocIcon color="primary" {...iconProps} />;
    default:
      return <FileIcon {...iconProps} />;
  }
}

function DocumentCard({ doc }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TypeIcon type={doc.type} />
          </Box>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            aria-label={`Actions for ${doc.name}`}
          >
            <MoreIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Download
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} /> Share
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>
        </Box>

        <Typography variant="subtitle2" fontWeight={600} noWrap title={doc.name}>
          {doc.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          Owner: {doc.owner}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {doc.size}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {doc.date}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Documents() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [dragOver, setDragOver] = useState(false);

  const filteredDocs = useMemo(() => {
    switch (activeFilter) {
      case 'PDFs':
        return documents.filter((d) => d.type === 'PDF');
      case 'Images':
        return documents.filter((d) => d.type === 'Image');
      case 'Spreadsheets':
        return documents.filter((d) => d.type === 'Spreadsheet');
      default:
        return documents;
    }
  }, [activeFilter]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Documents Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload, organize, and manage your files.
      </Typography>

      <Paper
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
        sx={{
          p: 4,
          mb: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: dragOver ? 'secondary.main' : 'divider',
          bgcolor: dragOver ? 'action.selected' : 'background.paper',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Drag & drop files here
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click the button below to browse your computer
        </Typography>
        <Button variant="contained" color="secondary" startIcon={<UploadIcon />}>
          Upload Document
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {filters.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            clickable
            color={activeFilter === filter ? 'secondary' : 'default'}
            variant={activeFilter === filter ? 'filled' : 'outlined'}
            onClick={() => setActiveFilter(filter)}
          />
        ))}
      </Box>

      <Grid container spacing={2}>
        {filteredDocs.map((doc) => (
          <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <DocumentCard doc={doc} />
          </Grid>
        ))}
        {filteredDocs.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No documents found for this filter.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
