/**
 * Application settings type definitions
 */

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'fi';
export type Currency = 'USD' | 'EUR';
export type DateFormat = 'system' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

/**
 * Item counting method for inventory statistics
 */
export type ItemCountMethod = 'unique' | 'quantity';

/**
 * Value calculation method for inventory totals
 */
export type ValueCalculation = 'currentValue' | 'currentWithFallback' | 'purchasePrice';

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

  // Inventory Stats
  itemCountMethod: ItemCountMethod;
  valueCalculation: ValueCalculation;
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  dateFormat: 'system',
  itemCountMethod: 'unique',
  valueCalculation: 'currentWithFallback',
};

/**
 * Settings keys for localStorage
 */
export const SETTINGS_KEYS = {
  THEME: 'inventori-theme',
  LANGUAGE: 'inventori-language',
  CURRENCY: 'inventori-currency',
  DATE_FORMAT: 'inventori-dateFormat',
  ITEM_COUNT_METHOD: 'inventori-itemCountMethod',
  VALUE_CALCULATION: 'inventori-valueCalculation',
} as const;
