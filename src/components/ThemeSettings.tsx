import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_MODES, ACCENT_COLORS, type ThemeMode, type AccentColor } from '../utils/theme';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Theme settings dialog for selecting light/dark mode and accent color.
 */
export function ThemeSettings({ isOpen, onClose }: ThemeSettingsProps) {
  const { mode, accent, setMode, setAccent } = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Focus trap - focus the dialog when it opens
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-dialog-title"
        tabIndex={-1}
        className="relative bg-surface rounded-lg shadow-lg max-w-sm w-full p-6"
      >
        <h2
          id="theme-dialog-title"
          className="text-lg font-semibold text-content mb-6"
        >
          Appearance
        </h2>

        {/* Theme Mode */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-content-secondary mb-3">
            Theme
          </label>
          <div className="flex gap-2">
            {THEME_MODES.map((option) => (
              <button
                key={option.value}
                onClick={() => setMode(option.value as ThemeMode)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  mode === option.value
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-border bg-surface text-content-secondary hover:bg-surface-tertiary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-content-secondary mb-3">
            Accent Color
          </label>
          <div className="flex gap-3 justify-center">
            {ACCENT_COLORS.map((option) => (
              <button
                key={option.value}
                onClick={() => setAccent(option.value as AccentColor)}
                aria-label={option.label}
                title={option.label}
                className={`w-10 h-10 rounded-full transition-transform ${
                  accent === option.value
                    ? 'ring-2 ring-offset-2 ring-content scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: option.color }}
              />
            ))}
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-surface bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
