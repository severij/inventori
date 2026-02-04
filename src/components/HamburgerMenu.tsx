import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

/**
 * Hamburger menu with dropdown containing app actions.
 * - Manage Tags: Navigate to tags page
 * - Settings: Navigate to settings page
 * - Install App: Shows when PWA is installable
 */
export function HamburgerMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          </div>
        )}
      </div>
    </>
  );
}
