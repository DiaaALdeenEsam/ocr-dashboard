import { createTheme } from '@mui/material/styles';

/** Central color palette — modify colors here to update the entire app */
export const colors = {
  light: {
    primary: '#1E5631',
    primaryLight: '#2A7A45',
    primaryDark: '#143D22',
    secondary: '#D4AF37',
    secondaryLight: '#E8C547',
    secondaryDark: '#B8962E',
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#5C6370',
    },
  },
  dark: {
    primary: '#134023',
    primaryLight: '#1E5631',
    primaryDark: '#0D2E18',
    secondary: '#D4AF37',
    secondaryLight: '#FFD700',
    secondaryDark: '#B8962E',
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E8E8E8',
      secondary: '#A0A0A0',
    },
  },
};

const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
};

const sharedShape = { borderRadius: 12 };

const sharedComponents = (mode) => ({
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow:
          mode === 'light'
            ? '0 2px 12px rgba(30, 86, 49, 0.08)'
            : '0 2px 12px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow:
          mode === 'light'
            ? '0 1px 8px rgba(30, 86, 49, 0.1)'
            : '0 1px 8px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: { textTransform: 'none', fontWeight: 600 },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 500 },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.light.primary,
      light: colors.light.primaryLight,
      dark: colors.light.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.light.secondary,
      light: colors.light.secondaryLight,
      dark: colors.light.secondaryDark,
      contrastText: '#1A1A2E',
    },
    background: colors.light.background,
    text: colors.light.text,
    success: { main: '#2E7D32' },
    warning: { main: colors.light.secondary },
    error: { main: '#C62828' },
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: sharedComponents('light'),
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.dark.primary,
      light: colors.dark.primaryLight,
      dark: colors.dark.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.dark.secondary,
      light: colors.dark.secondaryLight,
      dark: colors.dark.secondaryDark,
      contrastText: '#121212',
    },
    background: colors.dark.background,
    text: colors.dark.text,
    success: { main: '#66BB6A' },
    warning: { main: colors.dark.secondary },
    error: { main: '#EF5350' },
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: sharedComponents('dark'),
});
