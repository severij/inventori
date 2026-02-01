import { useNavigate } from 'react-router-dom';
import type { Entity, Item } from '../types';
import { formatShortId } from '../utils/shortId';

interface EntityCardProps {
  entity: Entity;
}

/**
 * Unified card component for displaying location/container/item.
 * Shows photo thumbnail (if available), name, type icon, and quantity badge for items.
 * Items with isContainer show a container icon.
 * Click navigates to detail view.
 * Minimum 48px height for touch accessibility.
 */
export function EntityCard({ entity }: EntityCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${entity.type}/${entity.id}`);
  };

  // Get first photo as thumbnail (if available)
  const thumbnail = entity.photos?.[0];
  const thumbnailUrl = thumbnail ? URL.createObjectURL(thumbnail) : null;

  // Get icon based on entity type and isContainer flag
  const icon = getEntityIcon(entity);

  // Get quantity for items (non-containers only)
  const quantity = entity.type === 'item' && !(entity as Item).isContainer ? (entity as Item).quantity : null;

  // Check if this is a container item (not a pure container)
  const isContainerItem = entity.type === 'item' && (entity as Item).isContainer;

  // Check if this is a pure container
  const isPureContainer = entity.type === 'container';

  // Get formatted ID for display
  const formattedId = formatShortId(entity.id);

  return (
    <button
      onClick={handleClick}
      className="w-full bg-surface rounded-lg shadow-sm border border-border p-3 flex items-center gap-3 hover:shadow-md hover:border-border-focus transition-all text-left min-h-[56px] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
      aria-label={`View ${entity.name}`}
    >
      {/* Thumbnail or icon */}
      <div 
        className="w-12 h-12 flex-shrink-0 rounded-md bg-surface-tertiary flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-content truncate">{entity.name}</h3>
        <p className="text-xs text-content-muted font-mono">{formattedId}</p>
      </div>

      {/* Container indicator badge for item-containers */}
      {isContainerItem && (
        <span className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded">
          Container
        </span>
      )}

      {/* Pure container badge */}
      {isPureContainer && (
        <span className="flex-shrink-0 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 text-xs font-medium px-2 py-0.5 rounded">
          Organizer
        </span>
      )}

      {/* Quantity badge for non-container items */}
      {quantity !== null && quantity > 1 && (
        <span className="flex-shrink-0 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 text-sm font-medium px-2 py-0.5 rounded">
          x{quantity}
        </span>
      )}

      {/* Chevron */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 text-content-muted flex-shrink-0"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  );
}

/**
 * Get icon for entity type
 */
function getEntityIcon(entity: Entity): string {
  if (entity.type === 'location') {
    return '📍';
  }
  // Pure containers (organizational)
  if (entity.type === 'container') {
    return '🗄️';
  }
  // For items, show container icon if isContainer is true
  if (entity.type === 'item') {
    return (entity as Item).isContainer ? '📦' : '📄';
  }
  return '📄';
}
