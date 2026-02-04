import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData } from '../db';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { ConfirmDialog } from './ConfirmDialog';

/**
 * Hamburger menu with dropdown containing app actions.
 * - Manage Tags: Navigate to tags page
 * - Settings: Navigate to settings page
 * - Install App: Shows when PWA is installable
 * - Clear All Data: Dangerous action
 */
export function HamburgerMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Clear data confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

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

  return (
    <>
      <div ref={menuRef} className="relative">
        {/* Hamburger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-accent-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Menu"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
            aria-hidden="true"
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
          <div 
            className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border py-1 z-20"
            role="menu"
            aria-label="Application menu"
          >
            {/* Manage Tags */}
            <button
              onClick={() => {
                navigate('/tags');
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
                  d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l2.25 2.25m0 0l2.25 2.25m-2.25-2.25l-2.25 2.25m2.25-2.25l2.25-2.25"
                />
              </svg>
              <span>Manage Tags</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                navigate('/settings');
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
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94m-.213 9.526c.918.62 1.5 1.665 1.5 2.86 0 1.195-.582 2.24-1.5 2.86m0-17.86c-.918-.62-1.5-1.665-1.5-2.86 0-1.195.582-2.24 1.5-2.86m0 15.854c.918.62 1.5 1.665 1.5 2.86 0 1.195-.582 2.24-1.5 2.86M9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
                />
              </svg>
              <span>Settings</span>
            </button>

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
              Tip: Export your data first from Settings if you want a backup.
            </p>
            <div>
              <label htmlFor="clear-confirm-input" className="block text-sm font-medium text-content mb-1">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
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
        confirmLabel={isClearing ? 'Clearing...' : 'Clear All Data'}
        cancelLabel="Cancel"
        onConfirm={handleClearConfirm}
        onCancel={handleClearCancel}
        isDestructive
        confirmDisabled={clearConfirmText !== 'DELETE' || isClearing}
      />
    </>
  );
}
