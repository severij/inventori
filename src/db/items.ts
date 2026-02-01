import { getDB } from './index';
import { generateUUID } from '../utils/uuid';
import { generateUniqueShortId } from '../utils/shortId';
import type { Item, CreateItemInput, UpdateItemInput } from '../types';
import { deleteContainersByParent, getContainerByShortId } from './containers';
import { getLocationByShortId } from './locations';

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
 * Get an item by its short ID
 */
export async function getItemByShortId(shortId: string): Promise<Item | undefined> {
  const db = await getDB();
  return db.getFromIndex('items', 'by-shortId', shortId);
}

/**
 * Get all items by parent ID (location or another item)
 */
export async function getItemsByParent(parentId: string): Promise<Item[]> {
  const db = await getDB();
  return db.getAllFromIndex('items', 'by-parent', parentId);
}

/**
 * Get all items that are containers (can hold other items)
 */
export async function getContainerItems(): Promise<Item[]> {
  const db = await getDB();
  const allItems = await db.getAll('items');
  return allItems.filter((item) => item.isContainer);
}

/**
 * Get all unassigned items (no parent)
 */
export async function getUnassignedItems(): Promise<Item[]> {
  const db = await getDB();
  const allItems = await db.getAll('items');
  return allItems.filter((item) => !item.parentId);
}

/**
 * Create a new item
 */
export async function createItem(input: CreateItemInput): Promise<Item> {
  const db = await getDB();
  const now = new Date();

  // Generate unique shortId with collision detection across all stores
  const shortId = await generateUniqueShortId(async (id) => {
    const existingItem = await db.getFromIndex('items', 'by-shortId', id);
    if (existingItem) return true;
    const existingLocation = await getLocationByShortId(id);
    if (existingLocation) return true;
    const existingContainer = await getContainerByShortId(id);
    if (existingContainer) return true;
    return false;
  });

  const item: Item = {
    ...input,
    id: generateUUID(),
    type: 'item',
    shortId,
    createdAt: now,
    updatedAt: now,
  };

  await db.add('items', item);
  return item;
}

/**
 * Update an existing item
 */
export async function updateItem(id: string, updates: UpdateItemInput): Promise<Item> {
  const db = await getDB();
  const existing = await db.get('items', id);

  if (!existing) {
    throw new Error(`Item not found: ${id}`);
  }

  const updated: Item = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };

  await db.put('items', updated);
  return updated;
}

/**
 * Generate and set a short ID for an item.
 * Returns the generated short ID.
 * Throws if the item already has a short ID.
 */
export async function setItemShortId(id: string): Promise<string> {
  const db = await getDB();
  const item = await db.get('items', id);

  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }

  if (item.shortId) {
    throw new Error(`Item already has a short ID: ${item.shortId}`);
  }

  // Generate unique shortId with collision detection across all stores
  const shortId = await generateUniqueShortId(async (sid) => {
    const existingItem = await db.getFromIndex('items', 'by-shortId', sid);
    if (existingItem) return true;
    const existingLocation = await getLocationByShortId(sid);
    if (existingLocation) return true;
    const existingContainer = await getContainerByShortId(sid);
    if (existingContainer) return true;
    return false;
  });

  const updated: Item = {
    ...item,
    shortId,
    updatedAt: new Date(),
  };

  await db.put('items', updated);
  return shortId;
}

/**
 * Delete an item.
 * If the item is a container (isContainer: true), also deletes all children recursively.
 */
export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('items', id);
  
  if (item?.isContainer) {
    // Delete child containers first
    await deleteContainersByParent(id);
    // Then delete child items
    await deleteItemsByParent(id);
  }
  
  await db.delete('items', id);
}

/**
 * Delete all items that have the given parent ID.
 * This recursively deletes children of container-items.
 * Called when deleting a location, container, or item-container.
 */
export async function deleteItemsByParent(parentId: string): Promise<void> {
  const db = await getDB();
  const items = await getItemsByParent(parentId);

  for (const item of items) {
    // If this item is also a container, recursively delete its children
    if (item.isContainer) {
      await deleteContainersByParent(item.id);
      await deleteItemsByParent(item.id);
    }
    await db.delete('items', item.id);
  }
}
