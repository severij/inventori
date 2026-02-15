import { getDescendantItems, getDescendantItemsForContainer } from '../utils/stats';
import { useStatsCalculation } from './useStatsCalculation';

/**
 * Hook to calculate statistics for a location or container item
 * Calculates recursive totals for all descendants
 * 
 * This is a thin wrapper around useStatsCalculation that fetches
 * descendant items based on entity type.
 * 
 * @param entityId - The location ID or item ID
 * @param entityType - 'location' or 'item'
 * @returns Object with item count and total value
 */
export function useEntityStats(
  entityId: string,
  entityType: 'location' | 'item'
) {
  // Create a fetch function based on entity type
  const fetchItems = () => {
    return entityType === 'location'
      ? getDescendantItems(entityId)
      : getDescendantItemsForContainer(entityId);
  };

  return useStatsCalculation(fetchItems, [entityId, entityType]);
}
