import type { Currency, DateFormat, Language } from '../types/settings';

/**
 * Format a number as currency using user's locale
 * Note: Uses locale-aware number formatting without currency symbol to avoid assumptions
 *
 * @param amount - The amount to format
 * @param _currency - Currency code (USD, EUR) - kept for future use when adding currency display
 * @param language - Language code (en, fi)
 * @returns Formatted currency string (e.g., "49.99" or "1.234,56" depending on locale)
 */
export function formatCurrency(amount: number, _currency: Currency, language: Language): string {
  try {
    // Get locale string from language code
    const locale = getLocaleString(language);

    // Format as number with currency locale
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback to simple formatting
    return amount.toFixed(2);
  }
}

/**
 * Format a date using user's locale and date format setting
 *
 * @param date - The date to format
 * @param format - Date format preference (system, DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
 * @param language - Language code (en, fi)
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: DateFormat, language: Language): string {
  try {
    const d = new Date(date);

    // For system default, use locale-aware formatting
    if (format === 'system') {
      const locale = getLocaleString(language);
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(d);
    }

    // For explicit formats, use manual formatting
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return d.toISOString().split('T')[0];
    }
  } catch {
    // Fallback to ISO string
    return date.toISOString().split('T')[0];
  }
}

/**
 * Get locale string from language code
 * Maps language codes to BCP 47 locale tags
 *
 * @param language - Language code (en, fi)
 * @returns BCP 47 locale string (e.g., "en-US", "fi-FI")
 */
function getLocaleString(language: Language): string {
  switch (language) {
    case 'fi':
      return 'fi-FI';
    case 'en':
    default:
      return 'en-US';
  }
}

/**
 * Format a date for HTML input (date type requires YYYY-MM-DD)
 * Used for converting Date to input[type="date"] value
 *
 * @param date - The date to format
 * @returns YYYY-MM-DD formatted string
 */
export function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a date from HTML input (date type provides YYYY-MM-DD)
 * Used for converting input[type="date"] value to Date
 *
 * @param dateString - YYYY-MM-DD formatted string
 * @returns Date object
 */
export function parseDateFromInput(dateString: string): Date {
  return new Date(`${dateString}T00:00:00Z`);
}
