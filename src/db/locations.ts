import { getDB } from './index';
import { generateUniqueId } from '../utils/shortId';
import type { Location, CreateLocationInput, UpdateLocationInput } from '../types';
import { getItemsByParent, deleteItem } from './items';

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
 * Get locations by parent location
 * Locations can parent other locations
 */
export async function getLocationsByParent(parentId: string): Promise<Location[]> {
  const db = await getDB();
  const allLocations = await db.getAll('locations');
  return allLocations.filter((loc) => loc.parentId === parentId);
}

/**
 * Create a new location
 */
export async function createLocation(input: CreateLocationInput): Promise<Location> {
  const db = await getDB();
  const now = new Date();

  // Validate parent if provided
  if (input.parentId) {
    const parent = await getLocation(input.parentId);
    if (!parent) {
      throw new Error(`Parent location ${input.parentId} not found`);
    }
  }

  // Generate unique id with collision detection across all stores
  const id = await generateUniqueId(async (candidateId) => {
    const existingLocation = await db.get('locations', candidateId);
    if (existingLocation) return true;
    const existingItem = await db.get('items', candidateId);
    if (existingItem) return true;
    return false;
  });

  const location: Location = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await db.add('locations', location);
  return location;
}

/**
 * Update an existing location
 * Only updates timestamp if content actually changed
 */
export async function updateLocation(
  id: string,
  updates: UpdateLocationInput
): Promise<Location> {
  const db = await getDB();
  const existing = await db.get('locations', id);

  if (!existing) {
    throw new Error(`Location not found: ${id}`);
  }

  const updated: Location = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  // Validate parent if changed
  if (updates.parentId !== undefined && updates.parentId) {
    const parent = await getLocation(updates.parentId);
    if (!parent) {
      throw new Error(`Parent location ${updates.parentId} not found`);
    }
  }

  // Only update timestamp if content actually changed
  const changed = JSON.stringify(existing) !== JSON.stringify(updated);
  if (changed) {
    updated.updatedAt = new Date();
  }

  await db.put('locations', updated);
  return updated;
}

/**
 * Delete a location with optional cascade delete
 * Default: soft cascade (orphan child locations, delete child items)
 * With deleteChildren=true: recursive delete all descendants
 */
export async function deleteLocation(id: string, deleteChildren: boolean = false): Promise<void> {
  const db = await getDB();

  const location = await getLocation(id);
  if (!location) {
    throw new Error(`Location not found: ${id}`);
  }

  // Get all children
  const childLocations = await getLocationsByParent(id);
  const childItems = await getItemsByParent(id, 'location');

  if (deleteChildren) {
    // Recursive delete
    for (const childLoc of childLocations) {
      await deleteLocation(childLoc.id, true);
    }
    for (const childItem of childItems) {
      await deleteItem(childItem.id, true);
    }
  } else {
    // Soft cascade: orphan child locations, delete child items
    for (const childLoc of childLocations) {
      await updateLocation(childLoc.id, { parentId: undefined });
    }
    for (const childItem of childItems) {
      // Items can't be orphaned (parentId is required), so delete them
      await deleteItem(childItem.id, false);
    }
  }

  // Delete the location itself
  await db.delete('locations', id);
}
