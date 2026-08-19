import {
  Box,
  Card,
  CardContent,
  Divider,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeModeContext';
import { glassCard } from './visual';

export default function AuthLayout({ title, subtitle, children }) {
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const dark = mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
        background: dark
          ? 'linear-gradient(145deg, #0a1610 0%, #121212 46%, #16120a 100%)'
          : 'linear-gradient(145deg, #e8f3ec 0%, #f4f6f8 50%, #f7efd4 100%)',
      }}
    >
      <Box
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          top: -80,
          left: -80,
          background: 'radial-gradient(circle, rgba(30,86,49,0.35), transparent 68%)',
        }}
      />
      <Box
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          bottom: -60,
          right: -40,
          background: 'radial-gradient(circle, rgba(212,175,55,0.18), transparent 68%)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          borderRadius: 999,
          bgcolor: 'action.hover',
          px: 1.5,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          zIndex: 1,
        }}
      >
        {mode === 'dark' ? (
          <Brightness4 fontSize="small" color="secondary" />
        ) : (
          <Brightness7 fontSize="small" color="secondary" />
        )}
        <Switch
          checked={mode === 'dark'}
          onChange={toggleTheme}
          color="secondary"
          size="small"
          inputProps={{ 'aria-label': 'Toggle dark mode' }}
        />
      </Box>

      <Card sx={{ ...glassCard(theme), width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
                boxShadow: '0 0 18px rgba(212,175,55,0.45)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'secondary.contrastText', fontWeight: 800 }}>
                D
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'secondary.main', letterSpacing: '0.18em', fontWeight: 700 }}>
                OCR
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>
                Command
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(212,175,55,0.2)' }} />

          <Typography variant="overline" sx={{ display: 'block', textAlign: 'center', color: 'secondary.main', letterSpacing: '0.18em', fontWeight: 700 }}>
            Access
          </Typography>
          <Typography variant="h5" fontWeight={800} align="center" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>
          )}

          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
