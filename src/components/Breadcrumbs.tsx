import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '../types';

interface BreadcrumbsProps {
  ancestors: BreadcrumbItem[];
}

/**
 * Display navigation breadcrumb path.
 * All items except the last are clickable links.
 * The last item (current) is shown but not clickable.
 */
export function Breadcrumbs({ ancestors }: BreadcrumbsProps) {
  if (ancestors.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-content-secondary flex-wrap">
        {/* Home link */}
        <li>
          <Link to="/" className="hover:text-accent-500 transition-colors">
            Home
          </Link>
        </li>

        {ancestors.map((item, index) => {
          const isLast = index === ancestors.length - 1;
          const path = `/${item.type}/${item.id}`;

          return (
            <li key={item.id} className="flex items-center gap-1">
              {/* Separator */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-content-muted"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>

              {isLast ? (
                <span className="font-medium text-content">{item.name}</span>
              ) : (
                <Link to={path} className="hover:text-accent-500 transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
