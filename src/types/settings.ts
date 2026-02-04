/**
 * Application settings type definitions
 */

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'fi';
export type Currency = 'USD' | 'EUR';
export type DateFormat = 'system' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

/**
 * Complete application settings
 */
export interface AppSettings {
  // Appearance
  theme: Theme;

  // Regional
  language: Language;
  currency: Currency;
  dateFormat: DateFormat;
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  dateFormat: 'system',
};

/**
 * Settings keys for localStorage
 */
export const SETTINGS_KEYS = {
  THEME: 'inventori-theme',
  LANGUAGE: 'inventori-language',
  CURRENCY: 'inventori-currency',
  DATE_FORMAT: 'inventori-dateFormat',
} as const;
