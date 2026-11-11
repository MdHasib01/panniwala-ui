'use client';

import * as React from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '@/src/lib/api';
import type { NewLocation, User } from './models';

interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface SupplierRegisterInput extends RegisterInput {
  phone: string;
  businessName: string;
  serviceAreas: string[];
  /** Areas not on the list yet — sent to the admin as requests. */
  newAreas?: NewLocation[];
  tradeLicense?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  /** `identifier` is a mobile number or an email address. */
  login: (identifier: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  registerSupplier: (input: SupplierRegisterInput) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

/** Where each role lands after signing in. Only admins use the /admin dashboard. */
export function homePathFor(user: Pick<User, 'role'>) {
  if (user.role === 'admin') return '/admin';
  if (user.role === 'supplier') return '/deliveries';
  return '/orders';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // The token lives in localStorage, which only exists in the browser: read it after
  // mount so the server render and the first client render match (no hydration mismatch).
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [storageRead, setStorageRead] = React.useState(false);

  // Still working out who is signed in: storage not read yet, or a stored token not verified yet.
  const loading = !storageRead || (!!token && !user);

  const logout = React.useCallback(() => {
    tokenStore.set(null);
    setToken(null);
    setUser(null);
  }, []);

  React.useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  React.useEffect(() => {
    setToken(tokenStore.get());
    setStorageRead(true);
  }, []);

  // Restore the session on first load.
  React.useEffect(() => {
    if (!token || user) return;
    let cancelled = false;
    api
      .get<{ user: User }>('/auth/me')
      .then(({ user }) => !cancelled && setUser(user))
      .catch(() => !cancelled && logout());
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
      login: (identifier, password) => api.post<AuthResponse>('/auth/login', { identifier, password }).then(accept),
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
