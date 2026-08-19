import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as SparkIcon,
  CheckCircle as CompletedIcon,
  CloudQueue as StorageIcon,
  PendingActions as PendingIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { colors } from '../theme';
import { fetchMetrics } from '../api/client';
import { formatFileSize } from '../utils/format';
import { glassCard, KpiTile, PageHero, HeroChip } from '../components/visual';

const activityData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCount(value) {
  return value === undefined || value === null ? '—' : Number(value).toLocaleString();
}

function percentOf(part, total) {
  if (!total) return 0;
  return Math.round((Number(part || 0) / Number(total)) * 100);
}

function StatusRing({ segments, centerLabel, successRate }) {
  const theme = useTheme();
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offsetCursor = 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 1 }}>
      <Box sx={{ position: 'relative', width: 220, height: 220 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 18,
            borderRadius: '50%',
            border: '1px dashed',
            borderColor: 'divider',
            opacity: 0.5,
            animation: 'spin 18s linear infinite',
            '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
          }}
        />
        <svg width="220" height="220" viewBox="0 0 140 140">
          <defs>
            <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="70" cy="70" r={radius} fill="none" stroke={theme.palette.action.hover} strokeWidth="12" />
          {segments.map((seg) => {
            const pct = seg.value / total;
            const dash = pct * circumference;
            const circle = (
              <circle
                key={seg.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offsetCursor}
                transform="rotate(-90 70 70)"
                filter="url(#ringGlow)"
              />
            );
            offsetCursor += dash;
            return circle;
          })}
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Pipeline
          </Typography>
          <Typography fontWeight={800} sx={{ fontSize: '2.2rem', lineHeight: 1, letterSpacing: '-0.04em' }}>
            {centerLabel ?? '—'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, mt: 0.5 }}>
            {successRate}% success
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {segments.map((seg) => (
          <Box key={seg.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: seg.color, boxShadow: `0 0 8px ${seg.color}` }} />
                {seg.label}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {seg.value} · {percentOf(seg.value, total)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentOf(seg.value, total)}
              sx={{
                height: 6,
                borderRadius: 99,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: seg.color, borderRadius: 99 },
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function TrafficChart({ data, color, height = 220 }) {
  const max = Math.max(...data, 1);
  const width = 100;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (val / max) * (height - 28) - 8;
    return { x, y, val };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `0,${height} ${line} ${width},${height}`;
  const peak = points.reduce((best, point) => (point.val > best.val ? point : best), points[0]);

  return (
    <Box sx={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <defs>
          <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.38" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((lineY) => (
          <line
            key={lineY}
            x1="0"
            x2={width}
            y1={height * lineY}
            y2={height * lineY}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="2 3"
          />
        ))}
        <polygon points={area} fill="url(#trafficFill)" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
        {points.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r={i === points.indexOf(peak) ? 1.8 : 1.1} fill={color} />
        ))}
      </svg>
    </Box>
  );
}

export default function Analytics() {
  const theme = useTheme();
  const primaryColor = theme.palette.mode === 'light' ? colors.light.primary : '#3DDC84';
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

  const totalRecords = metrics?.ocr_total_records ?? 0;
  const completed = metrics?.ocr_total_completed ?? 0;
  const pending = metrics?.ocr_total_pending ?? 0;
  const failed = metrics?.ocr_total_failed ?? 0;
  const successRate = percentOf(completed, totalRecords);

  const kpis = [
    {
      title: 'Operators',
      value: formatCount(metrics?.ocr_total_users),
      hint: 'registered accounts in the system',
      icon: <PeopleIcon fontSize="small" />,
      accent: 'green',
    },
    {
      title: 'Archive',
      value: metrics?.ocr_total_storage_bytes !== undefined ? formatFileSize(metrics.ocr_total_storage_bytes) : '—',
      hint: 'storage consumed across all users',
      icon: <StorageIcon fontSize="small" />,
      accent: 'gold',
    },
    {
      title: 'Cleared',
      value: formatCount(metrics?.ocr_total_completed),
      hint: 'documents fully extracted',
      icon: <CompletedIcon fontSize="small" />,
      accent: 'green',
    },
    {
      title: 'In queue',
      value: formatCount(metrics?.ocr_total_pending),
      hint: 'waiting in the OCR pipeline',
      icon: <PendingIcon fontSize="small" />,
      accent: 'gold',
    },
  ];

  const statusSegments = [
    { label: 'Completed', value: completed, color: '#2E7D32' },
    { label: 'Pending', value: pending, color: '#D4AF37' },
    { label: 'Failed', value: failed, color: '#C62828' },
  ];

  const peakMonth = useMemo(() => {
    const peakValue = Math.max(...activityData);
    const index = activityData.indexOf(peakValue);
    return { month: months[index], value: peakValue };
  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      <PageHero
        eyebrow="Live operations"
        title="OCR command deck"
        subtitle="A real-time snapshot of extraction throughput, storage pressure, and pipeline health."
        action={
          <HeroChip icon={<SparkIcon sx={{ color: 'secondary.main', fontSize: 18 }} />}>
            {successRate}% extraction success
          </HeroChip>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiTile {...kpi} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={glassCard(theme)}>
            <CardContent>
              <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.16em', fontWeight: 700 }}>
                Extraction pulse
              </Typography>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                OCR record status
              </Typography>
              <StatusRing
                segments={statusSegments}
                centerLabel={totalRecords || '—'}
                successRate={successRate}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={glassCard(theme)}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.16em', fontWeight: 700 }}>
                    Signal
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    User activity / traffic
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly active movement across the last year
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: 'primary.light' }}>
                    <TimelineIcon fontSize="small" />
                    <Typography variant="caption" fontWeight={700}>
                      Peak {peakMonth.month}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={800}>
                    {peakMonth.value}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', mt: 2 }}>
                <TrafficChart data={activityData} color={primaryColor} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                  {months.filter((_, i) => i % 3 === 0).map((month) => (
                    <Typography key={month} variant="caption" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
                      {month}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
