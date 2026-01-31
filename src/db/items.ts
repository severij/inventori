import { getDB } from './index';
import { generateUUID } from '../utils/uuid';
import type { Item, CreateItemInput, UpdateItemInput } from '../types';
import { deleteContainersByParent } from './containers';

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
 * Get all items by category
 */
export async function getItemsByCategory(category: string): Promise<Item[]> {
  const db = await getDB();
  return db.getAllFromIndex('items', 'by-category', category);
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

  const item: Item = {
    ...input,
    id: generateUUID(),
    type: 'item',
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
