import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  type ThemeMode,
  type AccentColor,
  getStoredThemeMode,
  getStoredAccentColor,
  setStoredThemeMode,
  setStoredAccentColor,
  applyTheme,
  resolveTheme,
} from '../utils/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentColor;
  effectiveTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider that manages light/dark mode and accent color.
 * Syncs with localStorage and listens for system preference changes.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(getStoredThemeMode);
  const [accent, setAccentState] = useState<AccentColor>(getStoredAccentColor);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => resolveTheme(mode));

  // Apply theme whenever mode or accent changes
  useEffect(() => {
    applyTheme(mode, accent);
    setEffectiveTheme(resolveTheme(mode));
  }, [mode, accent]);

  // Listen for system preference changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyTheme(mode, accent);
      setEffectiveTheme(resolveTheme(mode));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, accent]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setStoredThemeMode(newMode);
  }, []);

  const setAccent = useCallback((newAccent: AccentColor) => {
    setAccentState(newAccent);
    setStoredAccentColor(newAccent);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, accent, effectiveTheme, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
