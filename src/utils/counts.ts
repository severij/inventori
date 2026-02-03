/**
 * Utility functions for calculating child counts
 * Used to display counts of direct children (locations and items)
 */

import { getLocationsByParent } from '../db/locations';
import { getItemsByParent } from '../db/items';

/**
 * Counts of direct children for a parent entity
 */
export interface ChildCounts {
  locations: number;
  items: number;
}

/**
 * Get counts of direct children for a parent entity.
 *
 * @param parentId - The ID of the parent entity
 * @param parentType - Whether the parent is a 'location' or 'item'
 * @returns Promise<ChildCounts> with counts of direct children
 *
 * Notes:
 * - Counts ALL direct children (both locations and items)
 * - The `includeInTotal` flag is for inventory value calculations, not for counting children
 * - For items as parents, locations count will always be 0
 *   (locations can only parent other locations, not be children of items)
 * - Direct children only (not recursive)
 */
export async function getChildCounts(
  parentId: string,
  parentType: 'location' | 'item'
): Promise<ChildCounts> {
  if (parentType === 'location') {
    // Location parent can have child locations and items
    const childLocations = await getLocationsByParent(parentId);
    const childItems = await getItemsByParent(parentId, 'location');

    return {
      locations: childLocations.length,
      items: childItems.length,
    };
  } else {
    // Item parent can only have child items (not locations)
    const childItems = await getItemsByParent(parentId, 'item');

    return {
      locations: 0,
      items: childItems.length,
    };
  }
}
