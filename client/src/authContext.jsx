import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from './api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'vireon_user_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setToken('');
    }
    setUser(nextUser || null);
  }, []);

  const refresh = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const res = await api.authMe(t);
      setToken(t);
      setUser(res.user);
      return res.user;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken('');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      const res = await api.authLogin(email, password);
      persist(res.token, res.user);
      return res.user;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const res = await api.authRegister(payload);
      persist(res.token, res.user);
      return res.user;
    },
    [persist]
  );

  const logout = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    try {
      if (t) await api.authLogout(t);
    } catch {
      /* ignore */
    }
    persist('', null);
  }, [persist]);

  const updateProfile = useCallback(
    async (payload) => {
      const res = await api.authUpdateMe(token, payload);
      setUser(res.user);
      return res.user;
    },
    [token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refresh,
      updateProfile,
    }),
    [user, token, loading, login, register, logout, refresh, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
