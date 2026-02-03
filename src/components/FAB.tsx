import { Link } from 'react-router-dom';

interface FABProps {
  /** The text label for the button */
  label: string;
  /** The route to navigate to */
  to: string;
  /** Optional aria-label (defaults to label text) */
  ariaLabel?: string;
  /** SVG icon path (d attribute) */
  iconPath: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Floating Action Button (FAB) component
 * Displays at bottom-right of screen with icon and text label
 * 
 * @example
 * <FAB
 *   label="Location"
 *   to="/add/location"
 *   iconPath="M12 4.5v15m7.5-7.5h-15"
 * />
 */
export function FAB({ label, to, ariaLabel, iconPath, className = '' }: FABProps) {
  return (
    <Link
      to={to}
      className={`
        fixed bottom-6 right-6
        bg-accent-600 text-white
        px-4 py-3 rounded-full
        shadow-lg hover:bg-accent-700 transition-colors
        flex items-center gap-2
        min-h-[44px] min-w-[44px]
        font-medium text-sm
        ${className}
      `}
      aria-label={ariaLabel || label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6 flex-shrink-0"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
