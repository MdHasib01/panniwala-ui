import * as React from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '@/src/lib/api';
import type { User } from '../lib/types';

interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface SupplierRegisterInput extends RegisterInput {
  phone: string;
  businessName: string;
  serviceAreas: string[];
  tradeLicense?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  registerSupplier: (input: SupplierRegisterInput) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(() => tokenStore.get());
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(() => !!tokenStore.get());

  const logout = React.useCallback(() => {
    tokenStore.set(null);
    setToken(null);
    setUser(null);
  }, []);

  React.useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Restore the session on first load.
  React.useEffect(() => {
    if (!token || user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get<{ user: User }>('/auth/me')
      .then(({ user }) => !cancelled && setUser(user))
      .catch(() => !cancelled && logout())
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, user, logout]);

  const accept = React.useCallback(({ token, user }: AuthResponse) => {
    tokenStore.set(token);
    setUser(user);
    setToken(token);
    return user;
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: (email, password) => api.post<AuthResponse>('/auth/login', { email, password }).then(accept),
      register: (input) => api.post<AuthResponse>('/auth/register', input).then(accept),
      registerSupplier: (input) => api.post<AuthResponse>('/auth/register/supplier', input).then(accept),
      logout,
      setUser,
    }),
    [user, token, loading, accept, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
