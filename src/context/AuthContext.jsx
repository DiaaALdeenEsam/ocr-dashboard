import { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react';
import * as api from '../api/client';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const USER_STORAGE_KEY = 'dashboard-auth-user';

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => api.getStoredTokens());
  const [user] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(tokens?.access);

  useEffect(() => {
    const handleForcedLogout = () => setTokens(null);
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const data = await api.login({ username, password });
    const next = api.storeTokens({ access: data.access, refresh: data.refresh });
    setTokens(next);
    return data;
  }, []);

  const logout = useCallback(() => {
    api.clearTokens();
    setTokens(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
