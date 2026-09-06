import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchSession, login as loginRequest, logout as logoutRequest } from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'guest' | 'authenticated'
  const [user, setUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchSession();
      if (data.authenticated) {
        setUser(data.user);
        setMustChangePassword(Boolean(data.mustChangePassword));
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('guest');
      }
    } catch {
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    setUser(data.user);
    setMustChangePassword(Boolean(data.mustChangePassword));
    setStatus('authenticated');
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus('guest');
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, mustChangePassword, setMustChangePassword, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
