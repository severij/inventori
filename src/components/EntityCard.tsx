import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Location, Item } from '../types';
import { useTotalItemCount } from '../hooks/useTotalItemCount';

interface EntityCardProps {
  entity: Location | Item;
  entityType: 'location' | 'item';
}

/**
 * Unified card component for displaying location or item.
 * Shows photo thumbnail (if available), name, type icon, and count/quantity.
 * - Locations & container items: Show total recursive item count as subtitle
 * - Regular items: Show quantity badge if > 1
 * Click navigates to detail view.
 * Minimum 48px height for touch accessibility.
 */
export function EntityCard({ entity, entityType }: EntityCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Display name: Items may have no name, Locations always do
  const displayName = entity.name || (entityType === 'item' ? t('common.unnamedItem') : entity.name);

  const handleClick = () => {
    navigate(`/${entityType}/${entity.id}`);
  };

  // Get first photo as thumbnail (if available)
  const thumbnail = entity.photos?.[0];
  const thumbnailUrl = thumbnail ? URL.createObjectURL(thumbnail) : null;

  // Get icon based on entity type and canHoldItems flag
  const icon = getEntityIcon(entityType, entity);

  // Get quantity for items (non-container items only)
  const quantity = entityType === 'item' && !(entity as Item).canHoldItems ? (entity as Item).quantity : null;

  // Check if this is a location or container item (needs count display)
  const isLocation = entityType === 'location';
  const isContainerItem = entityType === 'item' && (entity as Item).canHoldItems;
  const shouldShowCount = isLocation || isContainerItem;

  // Fetch total item count for locations and container items
  const { count, loading, error } = useTotalItemCount(entity.id, entityType);

  // Determine what to show in subtitle
  let subtitleContent = null;
  if (shouldShowCount) {
    if (loading) {
      // Show skeleton text while loading
      subtitleContent = <span className="text-xs text-content-muted">░░░░░░░░</span>;
    } else if (error) {
      // Show nothing on error (count unavailable)
      subtitleContent = null;
    } else {
      // Show actual count
      subtitleContent = <span className="text-xs text-content-muted">{count} items</span>;
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-surface rounded-lg shadow-sm border border-border p-3 flex items-center gap-3 hover:shadow-md hover:border-border-focus transition-all text-left min-h-[56px] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
      aria-label={`View ${displayName}`}
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
        <h3 className="font-medium text-content truncate">{displayName}</h3>
        {subtitleContent}
      </div>

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
function getEntityIcon(entityType: 'location' | 'item', entity: Location | Item): string {
  if (entityType === 'location') {
    return '📍';
  }
  // For items, show container icon if canHoldItems is true
  if (entityType === 'item') {
    return (entity as Item).canHoldItems ? '📦' : '📄';
  }
  return '📄';
}
