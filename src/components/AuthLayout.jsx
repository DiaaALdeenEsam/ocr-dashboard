import {
  Box,
  Card,
  CardContent,
  Divider,
  Switch,
  Typography,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeModeContext';

export default function AuthLayout({ title, subtitle, children }) {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 3 },
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          borderRadius: 2,
          bgcolor: 'action.hover',
          px: 1.5,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
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

      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}
            >
              <Typography variant="h6" sx={{ color: 'secondary.contrastText', fontWeight: 800 }}>
                D
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              DashBoard
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
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
