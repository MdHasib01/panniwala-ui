'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'pw_admin_theme';

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    // ignore
  }
  return 'system';
}

/**
 * Scopes the dashboard theme to /admin: adds `admin` (and `dark` when needed) to
 * <html> while mounted and removes them on unmount so the landing page is untouched.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Browser-only values are read after mount (before paint) so the server render matches.
  const [theme, setThemeState] = React.useState<Theme>('system');
  const [systemDark, setSystemDark] = React.useState(false);

  React.useLayoutEffect(() => {
    setThemeState(readStoredTheme());
    setSystemDark(systemPrefersDark());
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  React.useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('admin');
    root.classList.toggle('dark', resolvedTheme === 'dark');
    return () => {
      root.classList.remove('admin', 'dark');
    };
  }, [resolvedTheme]);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
