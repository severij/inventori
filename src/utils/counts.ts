/**
 * Utility functions for calculating total item counts
 * Counts all descendant items recursively (through location nesting and container items)
 */

import { getLocationsByParent } from '../db/locations';
import { getItemsByParent } from '../db/items';

/**
 * Get total count of all descendant items for a parent entity.
 *
 * @param parentId - The ID of the parent entity
 * @param parentType - Whether the parent is a 'location' or 'item'
 * @returns Promise<number> - Total count of all descendant items (recursive)
 *
 * Counting Rules:
 * - Recursive through location nesting (location → child location → items)
 * - Recursive through container items (item with canHoldItems → child items)
 * - Factors in quantity (e.g., Eggs with quantity 12 = 12 items)
 * - Respects includeInTotal flag (items with false are excluded)
 * - For items as parents, counts items inside container items only
 *
 * Example:
 * Kitchen (location) with:
 *   - 2 direct items (Blender, Toaster)
 *   - Pantry (child location) with 3 items
 *   - Refrigerator (container item) with 8 items inside
 * Total: 2 + 3 + 8 = 13 items
 */
export async function getTotalItemCount(
  parentId: string,
  parentType: 'location' | 'item'
): Promise<number> {
  if (parentType === 'location') {
    return countItemsInLocation(parentId);
  } else {
    return countItemsInItem(parentId);
  }
}

/**
 * Count all items in a location recursively.
 * Includes:
 * - Direct items in this location
 * - Items in child locations (recursive)
 * - Items inside container items (recursive)
 */
async function countItemsInLocation(locationId: string): Promise<number> {
  let total = 0;

  // Count direct items in this location
  const directItems = await getItemsByParent(locationId, 'location');
  for (const item of directItems) {
    // Count the item itself only if includeInTotal is true
    if (item.includeInTotal) {
      total += item.quantity;
    }

    // Always recurse into containers, regardless of includeInTotal
    if (item.canHoldItems) {
      total += await countItemsInItem(item.id);
    }
  }

  // Count items in child locations recursively
  const childLocations = await getLocationsByParent(locationId);
  for (const location of childLocations) {
    total += await countItemsInLocation(location.id);
  }

  return total;
}

/**
 * Count all items inside a container item recursively.
 * Only counts direct child items and their containers.
 */
async function countItemsInItem(itemId: string): Promise<number> {
  let total = 0;

  const childItems = await getItemsByParent(itemId, 'item');
  for (const item of childItems) {
    // Count the item itself only if includeInTotal is true
    if (item.includeInTotal) {
      total += item.quantity;
    }

    // Always recurse into containers, regardless of includeInTotal
    if (item.canHoldItems) {
      total += await countItemsInItem(item.id);
    }
  }

  return total;
}
