import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
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
  const iconProps = { fontSize: 'small' };
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

function DocumentActions({ doc }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        aria-label={`Actions for ${doc.name}`}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
      >
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
    </>
  );
}

export default function Documents() {
  const [activeFilter, setActiveFilter] = useState('All');

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
        View and manage your files.
      </Typography>

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

      {filteredDocs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No documents found for this filter.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow key={doc.id} hover>
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
                        <TypeIcon type={doc.type} />
                      </Box>
                      <Typography variant="body2" fontWeight={600} noWrap title={doc.name}>
                        {doc.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{doc.owner}</TableCell>
                  <TableCell>
                    <Chip label={doc.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell align="right">
                    <DocumentActions doc={doc} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
