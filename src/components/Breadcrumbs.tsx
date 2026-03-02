import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '../types';

interface BreadcrumbsProps {
  ancestors: BreadcrumbItem[];
}

/**
 * Get icon for breadcrumb item based on type and canHoldItems
 */
function getItemIcon(item: BreadcrumbItem): string {
  if (item.type === 'location') {
    return '📍';
  } else {
    // Item type
    return item.canHoldItems ? '📦' : '📄';
  }
}

/**
 * Display navigation breadcrumb path with icons.
 * All items except the last are clickable links.
 * The last item (current) is shown but not clickable.
 * 
 * Icons:
 * - 🏠 for Home
 * - 📍 for locations
 * - 📦 for container items
 * - 📄 for regular items
 */
export function Breadcrumbs({ ancestors }: BreadcrumbsProps) {
  if (ancestors.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap gap-1 text-sm text-content-secondary">
        {/* Home link */}
        <li className="flex items-center gap-1">
          <Link to="/" className="hover:text-accent-500 transition-colors flex items-center gap-1 whitespace-nowrap">
            <span>🏠</span>
            <span>Home</span>
          </Link>
          {ancestors.length > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-content-muted flex-shrink-0"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          )}
        </li>

        {ancestors.map((item, index) => {
          const isLast = index === ancestors.length - 1;
          const path = `/${item.type}/${item.id}`;
          const icon = getItemIcon(item);

          return (
            <li key={item.id} className="flex items-center gap-1">
              {/* Icon and name/link - stays together with whitespace-nowrap */}
              <span className="flex items-center gap-1 whitespace-nowrap">
                <span>{icon}</span>
                {isLast ? (
                  <span className="font-medium text-content">{item.name}</span>
                ) : (
                  <Link to={path} className="hover:text-accent-500 transition-colors">
                    {item.name}
                  </Link>
                )}
              </span>
              {/* Separator - only after non-last items */}
              {!isLast && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-content-muted flex-shrink-0"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
