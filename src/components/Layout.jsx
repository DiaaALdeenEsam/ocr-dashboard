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
  Description as DocumentsIcon,
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
  { label: 'Documents Management', path: '/dashboard/documents', icon: <DocumentsIcon /> },
  { label: 'Uploaded Files', path: '/dashboard/uploaded-files', icon: <UploadedFilesIcon /> },
  { label: 'Generated Files', path: '/dashboard/generated-files', icon: <GeneratedFilesIcon /> },
];

function NavItem({ item, onNavigate }) {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={NavLink}
        to={item.path}
        end={item.path === '/dashboard'}
        onClick={onNavigate}
        sx={{
          mx: 1,
          borderRadius: 2,
          '&.active': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
            '&:hover': { bgcolor: 'primary.dark' },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
        />
      </ListItemButton>
    </ListItem>
  );
}

function DrawerContent({ onNavigate }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5, py: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
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
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
          DashBoard
        </Typography>
      </Toolbar>

      <Divider sx={{ mx: 2 }} />

      <List sx={{ flex: 1, pt: 2 }}>
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} onNavigate={onNavigate} />
        ))}
      </List>
    </Box>
  );
}

export default function Layout() {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, flexShrink: 0 }}
          >
            {pageTitle}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            color="inherit"
            onClick={toggleTheme}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? (
              <Brightness4 color="secondary" />
            ) : (
              <Brightness7 color="secondary" />
            )}
          </IconButton>

          <Avatar
            alt={user?.name || 'User Profile'}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>

          <IconButton
            color="inherit"
            onClick={logout}
            aria-label="Log out"
            sx={{ ml: { xs: 0, sm: 0 } }}
          >
            <LogoutIcon />
          </IconButton>
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
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
            },
          }}
        >
          <DrawerContent onNavigate={handleNavClick} />
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
            },
          }}
          open
        >
          <DrawerContent onNavigate={handleNavClick} />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
