import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { useSettings } from '../contexts/SettingsContext';
import { downloadExport } from '../utils/export';
import { useToast } from '../contexts/ToastContext';
import { useState, useRef } from 'react';
import { importData, previewImport } from '../utils/import';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { clearAllData } from '../db';
import type { Theme, Language, Currency, DateFormat } from '../types/settings';

/**
 * Settings page - Appearance, Regional, and Data Management
 */
export function Settings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();

  // Export/Import state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    version?: string;
    exportedAt?: string;
    counts?: { locations: number; items: number };
  } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
    showToast('success', t('common.settingsSaved'));
  };

  const handleLanguageChange = (language: Language) => {
    updateSettings({ language });
    showToast('success', t('common.settingsSaved'));
  };

  const handleCurrencyChange = (currency: Currency) => {
    updateSettings({ currency });
    showToast('success', t('common.settingsSaved'));
  };

  const handleDateFormatChange = (dateFormat: DateFormat) => {
    updateSettings({ dateFormat });
    showToast('success', t('common.settingsSaved'));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport();
      showToast('success', t('common.exportedSuccessfully'));
    } catch (err) {
      console.error('Export failed:', err);
      showToast('error', t('common.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';

    try {
      const preview = await previewImport(file);

      if (!preview.valid) {
        showToast('error', preview.error || t('common.invalidFile'));
        return;
      }

      setPendingImportFile(file);
      setImportPreview({
        version: preview.version,
        exportedAt: preview.exportedAt,
        counts: preview.counts,
      });
      setShowImportConfirm(true);
    } catch (err) {
      console.error('Failed to read file:', err);
      showToast('error', t('common.failedToReadFile'));
    }
  };

  const handleImportConfirm = async () => {
    if (!pendingImportFile) return;

    setShowImportConfirm(false);
    setIsImporting(true);

    try {
      const result = await importData(pendingImportFile);

      if (result.success) {
        showToast('success', t('common.importedSuccessfully'));
        setTimeout(() => window.location.reload(), 1500);
      } else if (result.locations.added + result.locations.updated + result.items.added + result.items.updated > 0) {
        showToast('success', t('common.importedSuccessfully'));
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('error', t('common.importFailed'));
      }
    } catch (err) {
      console.error('Import failed:', err);
      showToast('error', t('common.importFailed'));
    } finally {
      setIsImporting(false);
      setPendingImportFile(null);
      setImportPreview(null);
    }
  };

  const handleClearDataClick = () => {
    setShowClearConfirm(true);
    setClearConfirmText('');
  };

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      showToast('success', t('common.clearedSuccessfully'));
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Clear data failed:', err);
      showToast('error', t('common.clearFailed'));
      setIsClearing(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Unknown';
    return new Date(isoString).toLocaleString();
  };

  return (
    <Layout title={t('nav.settings')} onBack={() => navigate(-1)}>
      <div className="space-y-6 pb-6">
        {/* Appearance Section */}
        <div className="bg-surface rounded-lg shadow-sm border border-border p-4">
          <h2 className="text-lg font-semibold text-content mb-4">{t('settings.appearance')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-content mb-2">
                {t('settings.theme')}
              </label>
              <div className="space-y-2">
                {['light', 'dark', 'system'].map((theme) => (
                  <label key={theme} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={theme}
                      checked={settings.theme === theme}
                      onChange={() => handleThemeChange(theme as Theme)}
                      className="w-4 h-4 accent-accent-600 dark:accent-accent-400"
                    />
                    <span className="text-content-secondary">
                      {t(`settings.theme_${theme}`)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Regional Section */}
        <div className="bg-surface rounded-lg shadow-sm border border-border p-4">
          <h2 className="text-lg font-semibold text-content mb-4">{t('settings.regional')}</h2>
          <div className="space-y-4">
            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-content mb-2">
                {t('settings.language')}
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-content focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
              >
                <option value="en">{t('settings.english')}</option>
                <option value="fi">{t('settings.finnish')}</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-content mb-2">
                {t('settings.currency')}
              </label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-content focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-content mb-2">
                {t('settings.dateFormat')}
              </label>
              <select
                id="dateFormat"
                value={settings.dateFormat}
                onChange={(e) => handleDateFormatChange(e.target.value as DateFormat)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-content focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
              >
                <option value="system">{t('settings.dateFormat_system')}</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-surface rounded-lg shadow-sm border border-border p-4">
          <h2 className="text-lg font-semibold text-content mb-4">{t('settings.dataManagement')}</h2>
          <div className="space-y-3">
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full px-4 py-3 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  {t('common.exporting')}
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  {t('settings.exportData')}
                </>
              )}
            </button>
            <p className="text-sm text-content-secondary">
              {t('settings.exportDescription')}
            </p>

            {/* Import Button */}
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="w-full px-4 py-3 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  {t('common.importing')}
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  {t('settings.importData')}
                </>
              )}
            </button>
            <p className="text-sm text-content-secondary">
              {t('settings.importDescription')}
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.json,application/zip,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Clear All Data Button */}
            <button
              onClick={handleClearDataClick}
              className="w-full px-4 py-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600/50 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors font-medium mt-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 inline mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              {t('settings.clearAllData')}
            </button>
            <p className="text-sm text-red-600 dark:text-red-400">
              {t('settings.clearAllDataWarning')}
            </p>
          </div>
        </div>
      </div>

      {/* Import Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showImportConfirm}
        title={t('common.importData')}
        message={
          <div className="space-y-3">
            <p>{t('settings.importConfirmMessage')}</p>
            {importPreview && (
              <div className="bg-surface-secondary rounded-lg p-3 text-sm">
                <p>
                  <strong>{t('settings.fileDetails')}:</strong>
                </p>
                <ul className="mt-1 space-y-1 text-content-secondary">
                  <li>{t('settings.formatVersion')}: {importPreview.version ?? 'Unknown'}</li>
                  <li>{t('settings.exported')}: {formatDate(importPreview.exportedAt)}</li>
                  <li>{t('nav.locations')}: {importPreview.counts?.locations ?? 0}</li>
                  <li>{t('common.items')}: {importPreview.counts?.items ?? 0}</li>
                </ul>
              </div>
            )}
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {t('settings.importTip')}
            </p>
          </div>
        }
        confirmLabel={t('common.import')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleImportConfirm}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportFile(null);
          setImportPreview(null);
        }}
      />

      {/* Clear All Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title={t('settings.clearAllData')}
        message={
          <div className="space-y-4">
            <p>{t('settings.clearConfirmMessage')}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {t('settings.clearConfirmTip')}
            </p>
            <div>
              <label htmlFor="clear-confirm-input" className="block text-sm font-medium text-content mb-1">
                {t('settings.typeDelete')}
              </label>
              <input
                id="clear-confirm-input"
                type="text"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface-secondary text-content focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoComplete="off"
              />
            </div>
          </div>
        }
        confirmLabel={isClearing ? t('common.clearing') : t('settings.clearAllData')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleClearConfirm}
        onCancel={() => {
          setShowClearConfirm(false);
          setClearConfirmText('');
        }}
        isDestructive
        confirmDisabled={clearConfirmText !== 'DELETE' || isClearing}
      />
    </Layout>
  );
}
