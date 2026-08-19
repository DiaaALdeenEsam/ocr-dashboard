import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';

export function glassCard(theme, extra = {}) {
  const dark = theme.palette.mode === 'dark';
  return {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    border: `1px solid ${dark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(30, 86, 49, 0.12)'}`,
    background: dark
      ? 'linear-gradient(165deg, rgba(30,86,49,0.22) 0%, rgba(30,30,30,0.96) 42%, rgba(18,18,18,1) 100%)'
      : 'linear-gradient(165deg, rgba(30,86,49,0.08) 0%, #ffffff 45%)',
    ...extra,
  };
}

export function glowTableSx(theme) {
  const dark = theme.palette.mode === 'dark';
  return {
    '& .MuiTableCell-head': {
      color: 'text.secondary',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      bgcolor: 'transparent',
    },
    '& .MuiTableCell-body': {
      borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    '& .MuiTableRow-root:hover': {
      bgcolor: dark ? 'rgba(30,86,49,0.22)' : 'rgba(30,86,49,0.06)',
    },
  };
}

export function PageHero({ eyebrow, title, subtitle, action }) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ position: 'relative', mb: 3 }}>
      <Box
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: '-24px -8px auto',
          height: 180,
          background: dark
            ? 'radial-gradient(ellipse at left top, rgba(30,86,49,0.28), transparent 55%)'
            : 'radial-gradient(ellipse at left top, rgba(30,86,49,0.12), transparent 55%)',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          background: dark
            ? 'linear-gradient(120deg, #0f2418 0%, #1E1E1E 48%, #16120a 100%)'
            : 'linear-gradient(120deg, #e8f3ec 0%, #ffffff 50%, #f7efd4 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <Box>
            {eyebrow && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#3DDC84',
                    boxShadow: '0 0 12px #3DDC84',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'secondary.main',
                    fontWeight: 700,
                  }}
                >
                  {eyebrow}
                </Typography>
              </Box>
            )}
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.04em' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 620 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      </Box>
    </Box>
  );
}

export function KpiTile({ title, value, hint, icon, accent = 'green' }) {
  const theme = useTheme();
  const gold = accent === 'gold';
  const tone = gold ? theme.palette.secondary.main : theme.palette.primary.light;

  return (
    <Card sx={glassCard(theme)}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: gold
            ? 'radial-gradient(circle at 100% 0%, rgba(212,175,55,0.16), transparent 46%)'
            : 'radial-gradient(circle at 0% 0%, rgba(46,122,69,0.22), transparent 46%)',
          pointerEvents: 'none',
        }}
      />
      <CardContent sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                color: gold ? '#121212' : '#fff',
                bgcolor: tone,
                boxShadow: `0 0 18px ${tone}66`,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        <Typography
          fontWeight={800}
          sx={{ fontSize: { xs: '1.8rem', md: '2.15rem' }, lineHeight: 1, letterSpacing: '-0.04em' }}
        >
          {value}
        </Typography>
        {hint && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function GlassPanel({ children, sx = {} }) {
  const theme = useTheme();
  return <Card sx={glassCard(theme, sx)}>{children}</Card>;
}

export function SectionLabel({ children }) {
  return (
    <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.16em', fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

export function EmptyPanel({ icon, title, subtitle }) {
  return (
    <GlassPanel>
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Box sx={{ color: 'secondary.main', mb: 1 }}>{icon}</Box>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </GlassPanel>
  );
}

export function LoadingPanel({ label = 'Loading...' }) {
  return (
    <GlassPanel>
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress color="secondary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {label}
        </Typography>
      </Box>
    </GlassPanel>
  );
}

export function AccessDeniedPanel({ onLogout }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <PageHero
        eyebrow="Restricted"
        title="Access denied"
        subtitle="Your account is not authorized to view this page."
      />
      <Button variant="contained" color="primary" onClick={onLogout}>
        Back to Login
      </Button>
    </Box>
  );
}

export function HeroChip({ icon, children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 2,
        py: 1,
        borderRadius: 999,
        bgcolor: 'action.hover',
      }}
    >
      {icon}
      <Typography variant="body2" fontWeight={700}>
        {children}
      </Typography>
    </Box>
  );
}
