import { useToast, type ToastType } from '../contexts/ToastContext';

/**
 * Toast notification container - renders all active toasts.
 * Positioned at bottom of screen for mobile-friendly access.
 */
export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4 sm:max-w-sm"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-slide-up ${getToastStyles(
            toast.type
          )}`}
        >
          {/* Icon */}
          <span className="flex-shrink-0 text-lg" aria-hidden="true">
            {getToastIcon(toast.type)}
          </span>

          {/* Message */}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>

          {/* Dismiss button */}
          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function getToastStyles(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-green-100 dark:bg-green-900/90 text-green-800 dark:text-green-100 border-green-300 dark:border-green-700';
    case 'error':
      return 'bg-red-100 dark:bg-red-900/90 text-red-800 dark:text-red-100 border-red-300 dark:border-red-700';
    case 'warning':
      return 'bg-amber-100 dark:bg-amber-900/90 text-amber-800 dark:text-amber-100 border-amber-300 dark:border-amber-700';
    case 'info':
    default:
      return 'bg-blue-100 dark:bg-blue-900/90 text-blue-800 dark:text-blue-100 border-blue-300 dark:border-blue-700';
  }
}

function getToastIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
    default:
      return 'ℹ';
  }
}
