import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
}

/**
 * Empty state component with icon, message, and optional action.
 */
export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12" role="status">
      <div className="text-6xl mb-4" aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-content mb-2">{title}</h2>
      {description && (
        <p className="text-content-secondary mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action && action.to && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors min-h-[44px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {action.label}
        </Link>
      )}
      {action && action.onClick && !action.to && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
