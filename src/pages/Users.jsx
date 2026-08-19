import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Groups as GroupsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ApiError, getAdminUsers } from '../api/client';
import { userDisplayName, initialsOf } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import {
  AccessDeniedPanel,
  EmptyPanel,
  GlassPanel,
  glowTableSx,
  HeroChip,
  KpiTile,
  LoadingPanel,
  PageHero,
} from '../components/visual';

export default function Users() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { logout } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setAccessDenied(false);
    setUsers(null);
    try {
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setAccessDenied(true);
      } else {
        setError(err?.message || 'Unable to load users.');
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (accessDenied) {
    return <AccessDeniedPanel onLogout={logout} />;
  }

  const count = users?.length ?? 0;

  return (
    <Box>
      <PageHero
        eyebrow="Directory"
        title="Operators"
        subtitle="Every account connected to the OCR pipeline — tap a row to inspect their footprint."
        action={
          <HeroChip icon={<GroupsIcon sx={{ color: 'secondary.main', fontSize: 18 }} />}>
            {count} registered
          </HeroChip>
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={load}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {users === null && !error && <LoadingPanel label="Scanning operator directory..." />}

      {users !== null && users.length === 0 && !error && (
        <EmptyPanel
          icon={<GroupsIcon sx={{ fontSize: 48 }} />}
          title="No registered users"
          subtitle="There are no users in the system yet."
        />
      )}

      {users !== null && users.length > 0 && (
        <>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiTile
                title="Crew"
                value={count}
                hint="active identities in the vault"
                icon={<GroupsIcon fontSize="small" />}
              />
            </Grid>
          </Grid>
          <GlassPanel>
            <CardContent>
              <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.16em', fontWeight: 700 }}>
                Roster
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Registered accounts
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={glowTableSx(theme)}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Operator</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Open</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => {
                      const name = userDisplayName(user);
                      return (
                        <TableRow
                          key={user.id}
                          hover
                          onClick={() => navigate(`/dashboard/users/${user.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: 'primary.light',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  boxShadow: '0 0 16px rgba(61,220,132,0.25)',
                                }}
                              >
                                {initialsOf(name)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={700}>
                                {name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell align="right">
                            <ChevronRightIcon sx={{ color: 'secondary.main' }} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </GlassPanel>
        </>
      )}
    </Box>
  );
}
