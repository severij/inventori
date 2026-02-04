import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppSettings, Theme, Language, Currency, DateFormat } from '../types/settings';
import { DEFAULT_SETTINGS, SETTINGS_KEYS } from '../types/settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Load settings from localStorage
 */
function loadSettings(): AppSettings {
  try {
    return {
      theme: (localStorage.getItem(SETTINGS_KEYS.THEME) as Theme) || DEFAULT_SETTINGS.theme,
      language: (localStorage.getItem(SETTINGS_KEYS.LANGUAGE) as Language) || DEFAULT_SETTINGS.language,
      currency: (localStorage.getItem(SETTINGS_KEYS.CURRENCY) as Currency) || DEFAULT_SETTINGS.currency,
      dateFormat: (localStorage.getItem(SETTINGS_KEYS.DATE_FORMAT) as DateFormat) || DEFAULT_SETTINGS.dateFormat,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEYS.THEME, settings.theme);
    localStorage.setItem(SETTINGS_KEYS.LANGUAGE, settings.language);
    localStorage.setItem(SETTINGS_KEYS.CURRENCY, settings.currency);
    localStorage.setItem(SETTINGS_KEYS.DATE_FORMAT, settings.dateFormat);
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook to use settings context
 */
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
