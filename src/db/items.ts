import { getDB } from './index';
import { generateUniqueId } from '../utils/shortId';
import type { Item, CreateItemInput, UpdateItemInput } from '../types';
import { getLocation } from './locations';

/**
 * Get all items
 */
export async function getAllItems(): Promise<Item[]> {
  const db = await getDB();
  return db.getAll('items');
}

/**
 * Get a single item by ID
 */
export async function getItem(id: string): Promise<Item | undefined> {
  const db = await getDB();
  return db.get('items', id);
}

/**
 * Get items by parent (location or item)
 * Only returns items where parentId and parentType match
 */
export async function getItemsByParent(
  parentId: string,
  parentType: 'location' | 'item'
): Promise<Item[]> {
  const db = await getDB();
  const items = await db.getAllFromIndex('items', 'by-parent', parentId);
  return items.filter((item) => item.parentType === parentType);
}

/**
 * Get all unassigned items (items with no parent)
 */
export async function getUnassignedItems(): Promise<Item[]> {
  const db = await getDB();
  const allItems = await db.getAll('items');
  return allItems.filter((item) => !item.parentId || !item.parentType);
}

/**
 * Create a new item
 * Applies defaults. Items can be unassigned (no parent).
 */
export async function createItem(input: CreateItemInput): Promise<Item> {
  const db = await getDB();
  const now = new Date();

  // Validate parent if provided (both parentId and parentType must be present together)
  if (input.parentId && input.parentType) {
    if (input.parentType === 'location') {
      const parent = await getLocation(input.parentId);
      if (!parent) {
        throw new Error(`Parent location ${input.parentId} not found`);
      }
    } else if (input.parentType === 'item') {
      const parent = await getItem(input.parentId);
      if (!parent) {
        throw new Error(`Parent item ${input.parentId} not found`);
      }
      if (!parent.canHoldItems) {
        throw new Error(`Parent item ${input.parentId} cannot hold items`);
      }
    }
  }

  // Generate unique id with collision detection across all stores
  const id = await generateUniqueId(async (candidateId) => {
    const existingItem = await db.get('items', candidateId);
    if (existingItem) return true;
    const existingLocation = await getLocation(candidateId);
    if (existingLocation) return true;
    return false;
  });

  // Create item with defaults
  const item: Item = {
    ...input,
    id,
    quantity: input.quantity ?? 1,
    includeInTotal: input.includeInTotal ?? true,
    tags: input.tags ?? [],
    canHoldItems: input.canHoldItems ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await db.add('items', item);
  return item;
}

/**
 * Update an existing item
 * Only updates timestamp if content actually changed
 */
export async function updateItem(
  id: string,
  updates: UpdateItemInput
): Promise<Item> {
  const db = await getDB();
  const existing = await getItem(id);

  if (!existing) {
    throw new Error(`Item not found: ${id}`);
  }

  const updated: Item = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  // Validate parent if changed (both must be present together or both undefined)
  if (updates.parentId !== undefined || updates.parentType !== undefined) {
    const parentId = updates.parentId ?? existing.parentId;
    const parentType = updates.parentType ?? existing.parentType;

    // If either is defined, both must be defined
    if ((parentId === undefined) !== (parentType === undefined)) {
      throw new Error('parentId and parentType must both be defined or both undefined');
    }

    // Validate parent exists if defined
    if (parentId && parentType) {
      if (parentType === 'location') {
        const parent = await getLocation(parentId);
        if (!parent) {
          throw new Error(`Parent location ${parentId} not found`);
        }
      } else if (parentType === 'item') {
        const parent = await getItem(parentId);
        if (!parent) {
          throw new Error(`Parent item ${parentId} not found`);
        }
        if (!parent.canHoldItems) {
          throw new Error(`Parent item ${parentId} cannot hold items`);
        }
      }
    }
  }

  // Only update timestamp if content actually changed
  const changed = JSON.stringify(existing) !== JSON.stringify(updated);
  if (changed) {
    updated.updatedAt = new Date();
  }

  await db.put('items', updated);
  return updated;
}

/**
 * Delete an item with optional cascade delete
 * Default (deleteChildren=false): delete the item, also delete all child items (items can't be orphaned)
 * With deleteChildren=true: recursively delete all descendants
 */
export async function deleteItem(id: string, deleteChildren: boolean = false): Promise<void> {
  const db = await getDB();

  const item = await getItem(id);
  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }

  // Get all child items
  const childItems = await getItemsByParent(id, 'item');

  if (deleteChildren) {
    // Recursive delete
    for (const child of childItems) {
      await deleteItem(child.id, true);
    }
  } else {
    // Items can't be orphaned, so delete children
    for (const child of childItems) {
      await deleteItem(child.id, false);
    }
  }

  // Delete the item itself
  await db.delete('items', id);
}
