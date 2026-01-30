import { getDB } from './index';
import { generateUUID } from '../utils/uuid';
import type { Item, CreateItemInput, UpdateItemInput } from '../types';

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
 * Get all items by parent ID (location or container)
 */
export async function getItemsByParent(parentId: string): Promise<Item[]> {
  const db = await getDB();
  return db.getAllFromIndex('items', 'by-parent', parentId);
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
 * Delete an item
 */
export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('items', id);
}

/**
 * Delete all items that have the given parent ID.
 * This is called when deleting a location or container.
 */
export async function deleteItemsByParent(parentId: string): Promise<void> {
  const db = await getDB();
  const items = await getItemsByParent(parentId);

  for (const item of items) {
    await db.delete('items', item.id);
  }
}
