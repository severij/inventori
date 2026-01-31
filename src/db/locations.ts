import { getDB } from './index';
import { generateUUID } from '../utils/uuid';
import type { Location, CreateLocationInput, UpdateLocationInput } from '../types';
import { deleteContainersByParent } from './containers';
import { deleteItemsByParent } from './items';

/**
 * Get all locations
 */
export async function getAllLocations(): Promise<Location[]> {
  const db = await getDB();
  return db.getAll('locations');
}

/**
 * Get a single location by ID
 */
export async function getLocation(id: string): Promise<Location | undefined> {
  const db = await getDB();
  return db.get('locations', id);
}

/**
 * Create a new location
 */
export async function createLocation(input: CreateLocationInput): Promise<Location> {
  const db = await getDB();
  const now = new Date();

  const location: Location = {
    ...input,
    id: generateUUID(),
    type: 'location',
    createdAt: now,
    updatedAt: now,
  };

  await db.add('locations', location);
  return location;
}

/**
 * Update an existing location
 */
export async function updateLocation(id: string, updates: UpdateLocationInput): Promise<Location> {
  const db = await getDB();
  const existing = await db.get('locations', id);

  if (!existing) {
    throw new Error(`Location not found: ${id}`);
  }

  const updated: Location = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };

  await db.put('locations', updated);
  return updated;
}

/**
 * Delete a location and all its children (cascade delete).
 * This recursively deletes all containers and items.
 */
export async function deleteLocation(id: string): Promise<void> {
  const db = await getDB();

  // Delete all child containers (recursively handles their children)
  await deleteContainersByParent(id);

  // Delete all child items (recursively handles item-containers)
  await deleteItemsByParent(id);

  // Delete the location itself
  await db.delete('locations', id);
}
