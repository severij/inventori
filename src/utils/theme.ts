/**
 * Theme utilities for managing light/dark mode and accent colors.
 * Preferences are stored in localStorage for immediate access on page load.
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'teal';

export const THEME_MODE_KEY = 'inventori-theme-mode';
export const ACCENT_COLOR_KEY = 'inventori-accent-color';

export const DEFAULT_THEME_MODE: ThemeMode = 'system';
export const DEFAULT_ACCENT_COLOR: AccentColor = 'blue';

export const THEME_MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export const ACCENT_COLORS: { value: AccentColor; label: string; color: string }[] = [
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'green', label: 'Green', color: '#22c55e' },
  { value: 'purple', label: 'Purple', color: '#a855f7' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'teal', label: 'Teal', color: '#14b8a6' },
];

/**
 * Get the stored theme mode from localStorage.
 */
export function getStoredThemeMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_MODE_KEY);
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored as ThemeMode;
  }
  return DEFAULT_THEME_MODE;
}

/**
 * Get the stored accent color from localStorage.
 */
export function getStoredAccentColor(): AccentColor {
  const stored = localStorage.getItem(ACCENT_COLOR_KEY);
  if (stored && ACCENT_COLORS.some((c) => c.value === stored)) {
    return stored as AccentColor;
  }
  return DEFAULT_ACCENT_COLOR;
}

/**
 * Save theme mode to localStorage.
 */
export function setStoredThemeMode(mode: ThemeMode): void {
  localStorage.setItem(THEME_MODE_KEY, mode);
}

/**
 * Save accent color to localStorage.
 */
export function setStoredAccentColor(color: AccentColor): void {
  localStorage.setItem(ACCENT_COLOR_KEY, color);
}

/**
 * Resolve the effective theme (light or dark) based on mode and system preference.
 */
export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

/**
 * Apply theme to the document root element.
 * Sets data-theme and data-accent attributes on <html>.
 */
export function applyTheme(mode: ThemeMode, accent: AccentColor): void {
  const effectiveTheme = resolveTheme(mode);
  document.documentElement.dataset.theme = effectiveTheme;
  document.documentElement.dataset.accent = accent;
}

/**
 * Initialize theme on page load.
 * This should be called as early as possible to prevent flash.
 */
export function initializeTheme(): { mode: ThemeMode; accent: AccentColor } {
  const mode = getStoredThemeMode();
  const accent = getStoredAccentColor();
  applyTheme(mode, accent);
  return { mode, accent };
}
