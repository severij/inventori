import { useInstallPrompt } from '../hooks/useInstallPrompt';

/**
 * A button that prompts the user to install the PWA.
 * Only renders when the app is installable (not already installed and browser supports it).
 */
export function InstallButton() {
  const { isInstallable, promptInstall } = useInstallPrompt();

  if (!isInstallable) {
    return null;
  }

  const handleClick = async () => {
    const result = await promptInstall();
    if (result.outcome === 'accepted') {
      console.log('PWA installed successfully');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 text-sm bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 transition-colors font-medium"
      aria-label="Install app"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      Install
    </button>
  );
}
