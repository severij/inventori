import { getDB } from './index';
import { generateUUID } from '../utils/uuid';
import { generateUniqueShortId } from '../utils/shortId';
import type { Location, CreateLocationInput, UpdateLocationInput } from '../types';
import { deleteContainersByParent } from './containers';
import { deleteItemsByParent, getItemByShortId } from './items';
import { getContainerByShortId } from './containers';

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
 * Get a location by its short ID
 */
export async function getLocationByShortId(shortId: string): Promise<Location | undefined> {
  const db = await getDB();
  return db.getFromIndex('locations', 'by-shortId', shortId);
}

/**
 * Create a new location
 */
export async function createLocation(input: CreateLocationInput): Promise<Location> {
  const db = await getDB();
  const now = new Date();

  // Generate unique shortId with collision detection across all stores
  const shortId = await generateUniqueShortId(async (id) => {
    const existingLocation = await db.getFromIndex('locations', 'by-shortId', id);
    if (existingLocation) return true;
    const existingContainer = await getContainerByShortId(id);
    if (existingContainer) return true;
    const existingItem = await getItemByShortId(id);
    if (existingItem) return true;
    return false;
  });

  const location: Location = {
    ...input,
    id: generateUUID(),
    type: 'location',
    shortId,
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
 * Generate and set a short ID for a location.
 * Returns the generated short ID.
 * Throws if the location already has a short ID.
 */
export async function setLocationShortId(id: string): Promise<string> {
  const db = await getDB();
  const location = await db.get('locations', id);

  if (!location) {
    throw new Error(`Location not found: ${id}`);
  }

  if (location.shortId) {
    throw new Error(`Location already has a short ID: ${location.shortId}`);
  }

  // Generate unique shortId with collision detection across all stores
  const shortId = await generateUniqueShortId(async (sid) => {
    const existingLocation = await db.getFromIndex('locations', 'by-shortId', sid);
    if (existingLocation) return true;
    const existingContainer = await getContainerByShortId(sid);
    if (existingContainer) return true;
    const existingItem = await getItemByShortId(sid);
    if (existingItem) return true;
    return false;
  });

  const updated: Location = {
    ...location,
    shortId,
    updatedAt: new Date(),
  };

  await db.put('locations', updated);
  return shortId;
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
