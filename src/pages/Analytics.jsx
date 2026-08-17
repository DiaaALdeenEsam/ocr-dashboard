import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  CloudQueue as StorageIcon,
  PendingActions as PendingIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { colors } from '../theme';
import { fetchMetrics } from '../api/client';
import { formatFileSize } from '../utils/format';

const activityData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function KpiCard({ title, value, change, icon, accent }) {
  const theme = useTheme();
  const isSecondary = accent === 'secondary';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: isSecondary ? 'secondary.main' : 'primary.main', fontWeight: 600 }}
            >
              {change}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: isSecondary
                ? `${theme.palette.secondary.main}22`
                : `${theme.palette.primary.main}22`,
              color: isSecondary ? 'secondary.main' : 'primary.main',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function LineChart({ data, color, height = 160 }) {
  const max = Math.max(...data);
  const width = 100;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / max) * (height - 20);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#areaGradient)" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function DonutChart({ segments, centerLabel }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        {segments.map((seg, index) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dash = pct * circumference;
          const cumulativePct = segments
            .slice(0, index)
            .reduce((sum, s) => sum + (total > 0 ? s.value / total : 0), 0);
          const offset = circumference - cumulativePct * circumference;
          return (
            <circle
              key={seg.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
            />
          );
        })}
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill="#888">
          {centerLabel ?? `${total}%`}
        </text>
      </svg>
      <Box>
        {segments.map((seg) => (
          <Box key={seg.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: seg.color }} />
            <Typography variant="body2">
              {seg.label}: <strong>{seg.value}</strong>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function formatCount(value) {
  return value === undefined || value === null ? '—' : Number(value).toLocaleString();
}

export default function Analytics() {
  const theme = useTheme();
  const primaryColor = theme.palette.mode === 'light' ? colors.light.primary : colors.dark.primaryLight;
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Unable to load metrics.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = [
    {
      title: 'Total Users',
      value: formatCount(metrics?.ocr_total_users),
      change: 'registered users',
      icon: <PeopleIcon />,
      accent: 'primary',
    },
    {
      title: 'Storage Used',
      value: metrics?.ocr_total_storage_bytes !== undefined ? formatFileSize(metrics.ocr_total_storage_bytes) : '—',
      change: 'across all users',
      icon: <StorageIcon />,
      accent: 'secondary',
    },
    {
      title: 'Completed Records',
      value: formatCount(metrics?.ocr_total_completed),
      change: 'successfully processed',
      icon: <CompletedIcon />,
      accent: 'primary',
    },
    {
      title: 'Pending Records',
      value: formatCount(metrics?.ocr_total_pending),
      change: 'awaiting processing',
      icon: <PendingIcon />,
      accent: 'secondary',
    },
  ];

  const statusSegments = metrics
    ? [
        { label: 'Completed', value: metrics.ocr_total_completed ?? 0, color: '#1E5631' },
        { label: 'Pending', value: metrics.ocr_total_pending ?? 0, color: '#D4AF37' },
        { label: 'Failed', value: metrics.ocr_total_failed ?? 0, color: '#C62828' },
      ]
    : [
        { label: 'Completed', value: 0, color: '#1E5631' },
        { label: 'Pending', value: 0, color: '#D4AF37' },
        { label: 'Failed', value: 0, color: '#C62828' },
      ];

  const totalRecords = metrics?.ocr_total_records ?? null;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Analytics & Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monitor key metrics and system performance at a glance.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                OCR Record Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Completed, pending, and failed OCR records
              </Typography>
              <DonutChart segments={statusSegments} centerLabel={totalRecords ?? '—'} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Activity / Traffic
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Monthly active users over the past year
              </Typography>
              <LineChart data={activityData} color={primaryColor} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {months.filter((_, i) => i % 3 === 0).map((m) => (
                  <Typography key={m} variant="caption" color="text.secondary">
                    {m}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
