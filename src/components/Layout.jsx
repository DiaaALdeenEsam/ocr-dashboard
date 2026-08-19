import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Brightness4,
  Brightness7,
  CloudUpload as UploadedFilesIcon,
  FolderZip as GeneratedFilesIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeModeContext';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Analytics / Overview', path: '/dashboard', icon: <AnalyticsIcon /> },
  { label: 'Users Management', path: '/dashboard/users', icon: <PeopleIcon /> },
  { label: 'Uploaded Files', path: '/dashboard/uploaded-files', icon: <UploadedFilesIcon /> },
  { label: 'Generated Files', path: '/dashboard/generated-files', icon: <GeneratedFilesIcon /> },
];

function shellStyles(dark) {
  return {
    background: dark
      ? 'linear-gradient(180deg, #0d1c14 0%, #121212 48%, #16120a 100%)'
      : 'linear-gradient(180deg, #0f2418 0%, #1a3d28 52%, #16240f 100%)',
    borderColor: 'rgba(212,175,55,0.22)',
    color: '#F4F1E8',
  };
}

function NavItem({ item, onNavigate }) {
  return (
    <ListItem disablePadding sx={{ mb: 0.75 }}>
      <ListItemButton
        component={NavLink}
        to={item.path}
        end={item.path === '/dashboard'}
        onClick={onNavigate}
        sx={{
          mx: 1.25,
          borderRadius: 2,
          color: 'rgba(244,241,232,0.82)',
          overflow: 'hidden',
          '&.active': {
            bgcolor: 'rgba(30, 86, 49, 0.7)',
            color: '#fff',
            boxShadow: 'inset 3px 0 0 #D4AF37, 0 0 18px rgba(30,86,49,0.45)',
            '& .MuiListItemIcon-root': { color: '#D4AF37' },
            '&:hover': { bgcolor: 'rgba(30, 86, 49, 0.82)' },
          },
          '&:hover': { bgcolor: 'rgba(30, 86, 49, 0.28)' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: '0.86rem', fontWeight: 600, letterSpacing: '0.02em' }}
        />
      </ListItemButton>
    </ListItem>
  );
}

function BrandMark() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          bgcolor: 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1.5,
          boxShadow: '0 0 18px rgba(212,175,55,0.45)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#121212', fontWeight: 800 }}>
          D
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'secondary.main', letterSpacing: '0.18em', fontWeight: 700 }}>
          OCR
        </Typography>
        <Typography variant="h6" noWrap sx={{ fontWeight: 800, lineHeight: 1, color: '#fff' }}>
          Command
        </Typography>
      </Box>
    </Box>
  );
}

function DrawerContent({ onNavigate, dark }) {
  const shell = shellStyles(dark);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: shell.background,
        color: shell.color,
      }}
    >
      <Toolbar sx={{ px: 2.5, py: 1.5, minHeight: 72 }}>
        <BrandMark />
      </Toolbar>

      <Divider sx={{ mx: 2, borderColor: shell.borderColor }} />

      <Typography
        variant="caption"
        sx={{
          px: 3,
          pt: 2,
          pb: 0.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'secondary.main',
          fontWeight: 700,
        }}
      >
        Navigation
      </Typography>

      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} onNavigate={onNavigate} />
        ))}
      </List>
    </Box>
  );
}

function HeaderButton({ children, ...props }) {
  return (
    <IconButton
      {...props}
      sx={{
        color: '#F4F1E8',
        border: '1px solid rgba(212,175,55,0.22)',
        bgcolor: 'rgba(30,86,49,0.28)',
        '&:hover': { bgcolor: 'rgba(30,86,49,0.5)', borderColor: '#D4AF37' },
        ...props.sx,
      }}
    >
      {children}
    </IconButton>
  );
}

export default function Layout() {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const dark = mode === 'dark';
  const shell = shellStyles(dark);

  const initials = (user?.name || '')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DE';

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleNavClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  const pageTitle =
    navItems.find((item) =>
      item.path === '/dashboard'
        ? location.pathname === '/dashboard'
        : location.pathname.startsWith(item.path),
    )?.label ?? 'Dashboard';

  const drawerPaper = {
    boxSizing: 'border-box',
    width: DRAWER_WIDTH,
    borderRight: `1px solid ${shell.borderColor}`,
    background: shell.background,
    color: shell.color,
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          background: dark
            ? 'linear-gradient(90deg, #0d1c14 0%, #121212 48%, #16120a 100%)'
            : 'linear-gradient(90deg, #0f2418 0%, #1a3d28 52%, #16240f 100%)',
          color: shell.color,
          borderBottom: `1px solid ${shell.borderColor}`,
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <HeaderButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </HeaderButton>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#3DDC84',
                boxShadow: '0 0 12px #3DDC84',
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'secondary.main',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Live deck
              </Typography>
              <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#fff' }}>
                {pageTitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <HeaderButton
            onClick={toggleTheme}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? (
              <Brightness4 sx={{ color: 'secondary.main' }} />
            ) : (
              <Brightness7 sx={{ color: 'secondary.main' }} />
            )}
          </HeaderButton>

          <Avatar
            alt={user?.name || 'User Profile'}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'secondary.main',
              color: '#121212',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: '0 0 14px rgba(212,175,55,0.4)',
            }}
          >
            {initials}
          </Avatar>

          <HeaderButton onClick={logout} aria-label="Log out">
            <LogoutIcon />
          </HeaderButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': drawerPaper,
          }}
        >
          <DrawerContent onNavigate={handleNavClick} dark={dark} />
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': drawerPaper,
          }}
          open
        >
          <DrawerContent onNavigate={handleNavClick} dark={dark} />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
          backgroundImage:
            theme.palette.mode === 'dark'
              ? 'radial-gradient(ellipse at top left, rgba(30,86,49,0.18), transparent 42%)'
              : 'radial-gradient(ellipse at top left, rgba(30,86,49,0.08), transparent 42%)',
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: 72 }} />
        <Outlet />
      </Box>
    </Box>
  );
}
