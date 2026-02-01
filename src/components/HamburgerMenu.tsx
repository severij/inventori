import { useState, useRef, useEffect } from 'react';
import { downloadExport } from '../utils/export';
import { importData, previewImport, type ImportResult } from '../utils/import';
import { clearAllData } from '../db';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { ConfirmDialog } from './ConfirmDialog';
import { ThemeSettings } from './ThemeSettings';

/**
 * Hamburger menu with dropdown containing app actions.
 * - Export Data: Downloads ZIP backup
 * - Import Data: Restores from ZIP/JSON backup
 * - Install App: Shows when PWA is installable
 */
export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import confirmation state
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    version?: string;
    exportedAt?: string;
    counts?: { locations: number; containers: number; items: number };
  } | null>(null);

  // Clear data confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  // Theme settings state
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  const { isInstallable, promptInstall } = useInstallPrompt();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      await downloadExport();
      setIsOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    // Reset state
    setImportError(null);
    setImportResult(null);
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input for next selection
    event.target.value = '';

    try {
      const preview = await previewImport(file);

      if (!preview.valid) {
        setImportError(preview.error || 'Invalid file');
        return;
      }

      // Show confirmation dialog with preview
      setPendingImportFile(file);
      setImportPreview({
        version: preview.version,
        exportedAt: preview.exportedAt,
        counts: preview.counts,
      });
      setShowImportConfirm(true);
      setIsOpen(false);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to read file');
    }
  };

  const handleImportConfirm = async () => {
    if (!pendingImportFile) return;

    setShowImportConfirm(false);
    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importData(pendingImportFile);
      setImportResult(result);

      if (!result.success && result.errors.length > 0) {
        setImportError(`Import completed with errors: ${result.errors[0]}`);
      }

      // Reload the page to reflect imported data
      if (
        result.success ||
        result.locations.added +
          result.locations.updated +
          result.containers.added +
          result.containers.updated +
          result.items.added +
          result.items.updated >
          0
      ) {
        // Small delay to show result, then reload
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
      setPendingImportFile(null);
      setImportPreview(null);
    }
  };

  const handleImportCancel = () => {
    setShowImportConfirm(false);
    setPendingImportFile(null);
    setImportPreview(null);
  };

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result.outcome === 'accepted') {
      setIsOpen(false);
    }
  };

  const handleClearDataClick = () => {
    setShowClearConfirm(true);
    setClearConfirmText('');
    setIsOpen(false);
  };

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      window.location.reload();
    } catch (err) {
      console.error('Clear data failed:', err);
      setIsClearing(false);
    }
  };

  const handleClearCancel = () => {
    setShowClearConfirm(false);
    setClearConfirmText('');
  };

  // Format date for display
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Unknown';
    return new Date(isoString).toLocaleString();
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        {/* Hamburger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-accent-600 transition-colors"
          aria-label="Menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border py-1 z-20">
            {/* Export Data */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-content-secondary hover:bg-surface-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <svg
                  className="w-5 h-5 text-content-muted animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-content-muted"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              )}
              <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
            </button>

            {/* Import Data */}
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-content-secondary hover:bg-surface-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <svg
                  className="w-5 h-5 text-content-muted animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-content-muted"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              )}
              <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
            </button>

            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.json,application/zip,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Export error message */}
            {exportError && (
              <div className="px-4 py-2 text-sm text-red-600 bg-red-50">{exportError}</div>
            )}

            {/* Import error message */}
            {importError && (
              <div className="px-4 py-2 text-sm text-red-600 bg-red-50">{importError}</div>
            )}

            {/* Import success message */}
            {importResult && importResult.success && (
              <div className="px-4 py-2 text-sm text-green-600 bg-green-50">
                Imported successfully! Reloading...
              </div>
            )}

            {/* Import warnings */}
            {importResult && importResult.warnings.length > 0 && (
              <div className="px-4 py-2 text-sm text-amber-600 bg-amber-50">
                {importResult.warnings.length} warning(s)
              </div>
            )}

            {/* Install App - only shows when installable */}
            {isInstallable && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-content-secondary hover:bg-surface-tertiary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-content-muted"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"
                  />
                </svg>
                <span>Install App</span>
              </button>
            )}

            {/* Appearance */}
            <button
              onClick={() => {
                setShowThemeSettings(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-content-secondary hover:bg-surface-tertiary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-content-muted"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                />
              </svg>
              <span>Appearance</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-border" />

            {/* Clear All Data */}
            <button
              onClick={handleClearDataClick}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              <span>Clear All Data</span>
            </button>
          </div>
        )}
      </div>

      {/* Import Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showImportConfirm}
        title="Import Data"
        message={
          <div className="space-y-3">
            <p>
              This will merge the imported data with your existing inventory. Items with matching
              IDs will be updated.
            </p>
            {importPreview && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p>
                  <strong>File details:</strong>
                </p>
                <ul className="mt-1 space-y-1 text-gray-600">
                  <li>Format version: {importPreview.version ?? 'Unknown'}</li>
                  <li>Exported: {formatDate(importPreview.exportedAt)}</li>
                  <li>Locations: {importPreview.counts?.locations ?? 0}</li>
                  <li>Containers: {importPreview.counts?.containers ?? 0}</li>
                  <li>Items: {importPreview.counts?.items ?? 0}</li>
                </ul>
              </div>
            )}
            <p className="text-sm text-amber-600">
              Tip: Export your current data first if you want a backup.
            </p>
          </div>
        }
        confirmLabel="Import"
        cancelLabel="Cancel"
        onConfirm={handleImportConfirm}
        onCancel={handleImportCancel}
      />

      {/* Clear All Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Data"
        message={
          <div className="space-y-4">
            <p>
              This will permanently delete all locations, containers, and items from your inventory.
              This action cannot be undone.
            </p>
            <p className="text-sm text-amber-600">
              Tip: Export your data first if you want a backup.
            </p>
            <div>
              <label htmlFor="clear-confirm-input" className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                id="clear-confirm-input"
                type="text"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoComplete="off"
              />
            </div>
          </div>
        }
        confirmLabel={isClearing ? 'Clearing...' : 'Clear All Data'}
        cancelLabel="Cancel"
        onConfirm={handleClearConfirm}
        onCancel={handleClearCancel}
        isDestructive
        confirmDisabled={clearConfirmText !== 'DELETE' || isClearing}
      />

      {/* Theme Settings Dialog */}
      <ThemeSettings
        isOpen={showThemeSettings}
        onClose={() => setShowThemeSettings(false)}
      />
    </>
  );
}
