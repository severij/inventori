import { getDB } from './index';
import { generateUUID } from '../utils/uuid';
import { generateUniqueShortId } from '../utils/shortId';
import type { Container, CreateContainerInput, UpdateContainerInput } from '../types';
import { deleteItemsByParent, getItemByShortId } from './items';
import { getLocationByShortId } from './locations';

/**
 * Get all containers
 */
export async function getAllContainers(): Promise<Container[]> {
  const db = await getDB();
  return db.getAll('containers');
}

/**
 * Get a single container by ID
 */
export async function getContainer(id: string): Promise<Container | undefined> {
  const db = await getDB();
  return db.get('containers', id);
}

/**
 * Get a container by its short ID
 */
export async function getContainerByShortId(shortId: string): Promise<Container | undefined> {
  const db = await getDB();
  return db.getFromIndex('containers', 'by-shortId', shortId);
}

/**
 * Get all containers by parent ID (location, container, or item)
 */
export async function getContainersByParent(parentId: string): Promise<Container[]> {
  const db = await getDB();
  return db.getAllFromIndex('containers', 'by-parent', parentId);
}

/**
 * Create a new container
 */
export async function createContainer(input: CreateContainerInput): Promise<Container> {
  const db = await getDB();
  const now = new Date();

  // Generate unique shortId with collision detection across all stores
  const shortId = await generateUniqueShortId(async (id) => {
    const existingContainer = await db.getFromIndex('containers', 'by-shortId', id);
    if (existingContainer) return true;
    const existingLocation = await getLocationByShortId(id);
    if (existingLocation) return true;
    const existingItem = await getItemByShortId(id);
    if (existingItem) return true;
    return false;
  });

  const container: Container = {
    ...input,
    id: generateUUID(),
    type: 'container',
    shortId,
    createdAt: now,
    updatedAt: now,
  };

  await db.add('containers', container);
  return container;
}

/**
 * Update an existing container
 */
export async function updateContainer(id: string, updates: UpdateContainerInput): Promise<Container> {
  const db = await getDB();
  const existing = await db.get('containers', id);

  if (!existing) {
    throw new Error(`Container not found: ${id}`);
  }

  const updated: Container = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };

  await db.put('containers', updated);
  return updated;
}

/**
 * Generate and set a short ID for a container.
 * Returns the generated short ID.
 * Throws if the container already has a short ID.
 */
export async function setContainerShortId(id: string): Promise<string> {
  const db = await getDB();
  const container = await db.get('containers', id);

  if (!container) {
    throw new Error(`Container not found: ${id}`);
  }

  if (container.shortId) {
    throw new Error(`Container already has a short ID: ${container.shortId}`);
  }

  // Generate unique shortId with collision detection across all stores
  const shortId = await generateUniqueShortId(async (sid) => {
    const existingContainer = await db.getFromIndex('containers', 'by-shortId', sid);
    if (existingContainer) return true;
    const existingLocation = await getLocationByShortId(sid);
    if (existingLocation) return true;
    const existingItem = await getItemByShortId(sid);
    if (existingItem) return true;
    return false;
  });

  const updated: Container = {
    ...container,
    shortId,
    updatedAt: new Date(),
  };

  await db.put('containers', updated);
  return shortId;
}

/**
 * Delete a container and all its children (cascade delete).
 * This recursively deletes child containers and items.
 */
export async function deleteContainer(id: string): Promise<void> {
  const db = await getDB();

  // Delete all child containers (recursive)
  await deleteContainersByParent(id);

  // Delete all child items (recursive for item-containers)
  await deleteItemsByParent(id);

  // Delete the container itself
  await db.delete('containers', id);
}

/**
 * Delete all containers that have the given parent ID.
 * This recursively deletes their children as well.
 * Called when deleting a location, container, or item-container.
 */
export async function deleteContainersByParent(parentId: string): Promise<void> {
  const db = await getDB();
  const containers = await getContainersByParent(parentId);

  for (const container of containers) {
    // Recursively delete child containers
    await deleteContainersByParent(container.id);
    // Delete child items
    await deleteItemsByParent(container.id);
    // Delete the container
    await db.delete('containers', container.id);
  }
}
