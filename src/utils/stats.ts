import type { Item } from '../types';
import type { ItemCountMethod, ValueCalculation } from '../types/settings';
import { getLocationsByParent } from '../db/locations';
import { getItemsByParent } from '../db/items';

/**
 * Get all descendant items for a location (recursive)
 * Includes:
 * - Direct child items
 * - Items in child locations (recursive)
 * - Items in child containers (recursive)
 * 
 * @param locationId - The location ID to get descendants for
 * @returns Array of all descendant items
 */
export async function getDescendantItems(locationId: string): Promise<Item[]> {
  const items: Item[] = [];
  const visited = new Set<string>(); // Prevent circular references

  async function collectFromLocation(locId: string) {
    if (visited.has(locId)) return;
    visited.add(locId);

    // Get direct child items
    const childItems = await getItemsByParent(locId, 'location');
    items.push(...childItems);

    // Recursively collect from child containers
    for (const item of childItems) {
      if (item.canHoldItems) {
        await collectFromItem(item.id);
      }
    }

    // Recursively collect from child locations
    const childLocations = await getLocationsByParent(locId);
    for (const childLoc of childLocations) {
      await collectFromLocation(childLoc.id);
    }
  }

  async function collectFromItem(itemId: string) {
    if (visited.has(itemId)) return;
    visited.add(itemId);

    const childItems = await getItemsByParent(itemId, 'item');
    items.push(...childItems);

    // Recursively collect from nested containers
    for (const item of childItems) {
      if (item.canHoldItems) {
        await collectFromItem(item.id);
      }
    }
  }

  await collectFromLocation(locationId);
  return items;
}

/**
 * Get all descendant items for a container item (recursive)
 * Includes:
 * - Direct child items
 * - Items in nested containers (recursive)
 * 
 * @param itemId - The container item ID to get descendants for
 * @returns Array of all descendant items
 */
export async function getDescendantItemsForContainer(itemId: string): Promise<Item[]> {
  const items: Item[] = [];
  const visited = new Set<string>(); // Prevent circular references

  async function collectFromItem(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const childItems = await getItemsByParent(id, 'item');
    items.push(...childItems);

    // Recursively collect from nested containers
    for (const item of childItems) {
      if (item.canHoldItems) {
        await collectFromItem(item.id);
      }
    }
  }

  await collectFromItem(itemId);
  return items;
}

/**
 * Calculate item count based on method and includeInTotal flag
 * 
 * @param items - Array of items to count
 * @param method - Counting method ('unique' or 'quantity')
 * @returns Total count
 */
export function calculateItemCount(
  items: Item[],
  method: ItemCountMethod
): number {
  // Filter items that should be included in totals
  const includedItems = items.filter(item => item.includeInTotal);

  if (method === 'unique') {
    // Count each item as 1
    return includedItems.length;
  } else {
    // Sum all quantities
    return includedItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}

/**
 * Calculate total value based on method and includeInTotal flag
 * 
 * @param items - Array of items to calculate value for
 * @param method - Value calculation method
 * @returns Total value
 */
export function calculateTotalValue(
  items: Item[],
  method: ValueCalculation
): number {
  // Filter items that should be included in totals
  const includedItems = items.filter(item => item.includeInTotal);

  return includedItems.reduce((sum, item) => {
    let itemValue = 0;

    if (method === 'currentWithFallback') {
      // Use currentValue, fallback to purchasePrice
      itemValue = item.currentValue ?? item.purchasePrice ?? 0;
    } else if (method === 'currentValue') {
      // Only use currentValue
      itemValue = item.currentValue ?? 0;
    } else if (method === 'purchasePrice') {
      // Only use purchasePrice
      itemValue = item.purchasePrice ?? 0;
    }

    // Multiply by quantity
    return sum + (itemValue * item.quantity);
  }, 0);
}
