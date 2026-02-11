import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { ThemeMode, ResolvedTheme, ThemeContextValue } from '../types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme-preference';

/**
 * Detects the system color scheme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component
 * Manages theme state and applies theme to document
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Persist theme preference in localStorage
  const [mode, setMode] = useLocalStorage<ThemeMode>(STORAGE_KEY, 'system');
  
  // Track system theme for 'system' mode
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Resolve the actual theme based on mode
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemTheme;
    }
    return mode;
  }, [mode, systemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const handleSetMode = useCallback(
    (newMode: ThemeMode) => {
      setMode(newMode);
    },
    [setMode]
  );

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      setMode: handleSetMode,
    }),
    [mode, resolvedTheme, handleSetMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 * Must be used within ThemeProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
