import { getDB } from './index';
import { generateUUID } from '../utils/uuid';
import type { Container, CreateContainerInput, UpdateContainerInput } from '../types';
import { deleteItemsByParent } from './items';

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
 * Get all containers by parent ID (location or container)
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

  const container: Container = {
    ...input,
    id: generateUUID(),
    type: 'container',
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
 * Delete a container and all its children (cascade delete)
 */
export async function deleteContainer(id: string): Promise<void> {
  // Delete all child containers recursively
  await deleteContainersByParent(id);

  // Delete all direct child items
  await deleteItemsByParent(id);

  // Delete the container itself
  const db = await getDB();
  await db.delete('containers', id);
}

/**
 * Delete all containers that have the given parent ID (cascade delete)
 * This is called when deleting a location or parent container.
 */
export async function deleteContainersByParent(parentId: string): Promise<void> {
  const children = await getContainersByParent(parentId);

  for (const child of children) {
    await deleteContainer(child.id);
  }
}
