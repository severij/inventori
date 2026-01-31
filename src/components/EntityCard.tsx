import { useNavigate } from 'react-router-dom';
import type { Entity } from '../types';

interface EntityCardProps {
  entity: Entity;
}

/**
 * Unified card component for displaying location/container/item.
 * Shows photo thumbnail (if available), name, type icon, and quantity badge for items.
 * Click navigates to detail view.
 */
export function EntityCard({ entity }: EntityCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${entity.type}/${entity.id}`);
  };

  // Get first photo as thumbnail (if available)
  const thumbnail = entity.photos?.[0];
  const thumbnailUrl = thumbnail ? URL.createObjectURL(thumbnail) : null;

  // Get icon based on entity type
  const icon = getEntityIcon(entity.type);

  // Get quantity for items
  const quantity = entity.type === 'item' ? entity.quantity : null;

  return (
    <button
      onClick={handleClick}
      className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3 hover:shadow-md hover:border-gray-300 transition-all text-left"
    >
      {/* Thumbnail or icon */}
      <div className="w-12 h-12 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={entity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{entity.name}</h3>
        {entity.description && (
          <p className="text-sm text-gray-500 truncate">{entity.description}</p>
        )}
      </div>

      {/* Quantity badge for items */}
      {quantity !== null && quantity > 1 && (
        <span className="flex-shrink-0 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-0.5 rounded">
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
        className="w-5 h-5 text-gray-400 flex-shrink-0"
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
function getEntityIcon(type: Entity['type']): string {
  switch (type) {
    case 'location':
      return '📍';
    case 'container':
      return '📦';
    case 'item':
      return '📄';
    default:
      return '📄';
  }
}
