import JSZip from 'jszip';
import { getDB } from '../db/index';
import { getLocationByShortId } from '../db/locations';
import { getContainerByShortId } from '../db/containers';
import { getItemByShortId } from '../db/items';
import type { Location, Container, Item } from '../types';
import type { ExportData, ExportedLocation, ExportedContainer, ExportedItem } from './export';

/** Supported export format version */
const SUPPORTED_VERSION = '1.1';

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean;
  locations: { added: number; updated: number };
  containers: { added: number; updated: number };
  items: { added: number; updated: number };
  warnings: string[];
  errors: string[];
}

/**
 * Get images from the images map, adding warnings for missing images
 */
function getImagesFromMap(
  filenames: string[],
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Blob[] {
  const blobs: Blob[] = [];

  for (const filename of filenames) {
    const blob = imagesMap.get(filename);
    if (blob) {
      blobs.push(blob);
    } else {
      warnings.push(`Image not found in archive: ${filename}`);
    }
  }

  return blobs;
}

/**
 * Check if a shortId is already used by a different entity (different UUID)
 */
async function isShortIdCollision(shortId: string, entityId: string): Promise<boolean> {
  const existingLocation = await getLocationByShortId(shortId);
  if (existingLocation && existingLocation.id !== entityId) return true;

  const existingContainer = await getContainerByShortId(shortId);
  if (existingContainer && existingContainer.id !== entityId) return true;

  const existingItem = await getItemByShortId(shortId);
  if (existingItem && existingItem.id !== entityId) return true;

  return false;
}

/**
 * Convert an exported location back to a Location
 * Handles shortId collision by clearing it and adding a warning
 */
async function importLocation(
  exported: ExportedLocation,
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Promise<Location> {
  let shortId = exported.shortId;

  // Check for shortId collision with a different entity
  if (shortId) {
    const hasCollision = await isShortIdCollision(shortId, exported.id);
    if (hasCollision) {
      warnings.push(`Short ID "${shortId}" for location "${exported.name}" conflicts with another entity. Short ID cleared.`);
      shortId = undefined;
    }
  }

  return {
    id: exported.id,
    type: 'location',
    name: exported.name,
    description: exported.description,
    shortId,
    photos: getImagesFromMap(exported.photos, imagesMap, warnings),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Convert an exported container back to a Container
 * Handles shortId collision by clearing it and adding a warning
 */
async function importContainer(
  exported: ExportedContainer,
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Promise<Container> {
  let shortId = exported.shortId;

  // Check for shortId collision with a different entity
  if (shortId) {
    const hasCollision = await isShortIdCollision(shortId, exported.id);
    if (hasCollision) {
      warnings.push(`Short ID "${shortId}" for container "${exported.name}" conflicts with another entity. Short ID cleared.`);
      shortId = undefined;
    }
  }

  return {
    id: exported.id,
    type: 'container',
    name: exported.name,
    description: exported.description,
    shortId,
    parentId: exported.parentId,
    parentType: exported.parentType,
    photos: getImagesFromMap(exported.photos, imagesMap, warnings),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Convert an exported item back to an Item
 * Handles shortId collision by clearing it and adding a warning
 */
async function importItem(
  exported: ExportedItem,
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Promise<Item> {
  let shortId = exported.shortId;

  // Check for shortId collision with a different entity
  if (shortId) {
    const hasCollision = await isShortIdCollision(shortId, exported.id);
    if (hasCollision) {
      warnings.push(`Short ID "${shortId}" for item "${exported.name}" conflicts with another entity. Short ID cleared.`);
      shortId = undefined;
    }
  }

  return {
    id: exported.id,
    type: 'item',
    name: exported.name,
    description: exported.description,
    shortId,
    parentId: exported.parentId,
    parentType: exported.parentType,
    isContainer: exported.isContainer,
    quantity: exported.quantity ?? 1,
    photos: getImagesFromMap(exported.photos, imagesMap, warnings),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Validate the export data structure
 */
function validateExportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const d = data as Record<string, unknown>;

  // Check required fields
  if (typeof d.version !== 'string') return false;
  if (!Array.isArray(d.locations)) return false;
  if (!Array.isArray(d.containers)) return false;
  if (!Array.isArray(d.items)) return false;

  // Check version compatibility
  if (d.version !== SUPPORTED_VERSION) {
    return false;
  }

  return true;
}

/**
 * Extract contents from a ZIP file
 */
async function extractZip(
  file: File
): Promise<{ json: string; images: Map<string, Blob> }> {
  const zip = await JSZip.loadAsync(file);

  // Get data.json
  const dataFile = zip.file('data.json');
  if (!dataFile) {
    throw new Error('ZIP file does not contain data.json');
  }
  const json = await dataFile.async('string');

  // Get all images
  const images = new Map<string, Blob>();
  const imagesFolder = zip.folder('images');

  if (imagesFolder) {
    const imageFiles = imagesFolder.filter((_, file) => !file.dir);

    for (const imageFile of imageFiles) {
      const blob = await imageFile.async('blob');
      // Get just the filename without the images/ prefix
      const filename = imageFile.name.replace(/^images\//, '');
      images.set(filename, blob);
    }
  }

  return { json, images };
}

/**
 * Check if a file is a ZIP file
 */
export function isZipFile(file: File): boolean {
  return (
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed' ||
    file.name.toLowerCase().endsWith('.zip')
  );
}

/**
 * Import data from a ZIP file into IndexedDB.
 * Uses merge strategy: items with existing IDs are updated, new items are added.
 *
 * @param file - The ZIP file to import
 * @returns ImportResult with counts of added/updated items and any warnings/errors
 */
export async function importData(file: File): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    locations: { added: 0, updated: 0 },
    containers: { added: 0, updated: 0 },
    items: { added: 0, updated: 0 },
    warnings: [],
    errors: [],
  };

  // Only support ZIP files
  if (!isZipFile(file)) {
    result.errors.push('Unsupported file type. Please use a .zip file.');
    return result;
  }

  let jsonString: string;
  let imagesMap: Map<string, Blob>;

  // Extract content from ZIP
  try {
    const extracted = await extractZip(file);
    jsonString = extracted.json;
    imagesMap = extracted.images;
  } catch (err) {
    result.errors.push(`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return result;
  }

  // Parse JSON
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch {
    result.errors.push('Invalid JSON format in data file');
    return result;
  }

  // Validate structure
  if (!validateExportData(data)) {
    result.errors.push('Invalid export file format or unsupported version (requires v1.1)');
    return result;
  }

  const db = await getDB();

  // Import locations
  for (const exported of data.locations) {
    try {
      const location = await importLocation(exported, imagesMap, result.warnings);
      const existing = await db.get('locations', location.id);

      if (existing) {
        await db.put('locations', location);
        result.locations.updated++;
      } else {
        await db.add('locations', location);
        result.locations.added++;
      }
    } catch (err) {
      result.errors.push(
        `Failed to import location "${exported.name}": ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  // Import containers
  for (const exported of data.containers) {
    try {
      const container = await importContainer(exported, imagesMap, result.warnings);
      const existing = await db.get('containers', container.id);

      if (existing) {
        await db.put('containers', container);
        result.containers.updated++;
      } else {
        await db.add('containers', container);
        result.containers.added++;
      }
    } catch (err) {
      result.errors.push(
        `Failed to import container "${exported.name}": ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  // Import items
  for (const exported of data.items) {
    try {
      const item = await importItem(exported, imagesMap, result.warnings);
      const existing = await db.get('items', item.id);

      if (existing) {
        await db.put('items', item);
        result.items.updated++;
      } else {
        await db.add('items', item);
        result.items.added++;
      }
    } catch (err) {
      result.errors.push(
        `Failed to import item "${exported.name}": ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Read a File and return its contents as a string
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Preview what an import file contains without actually importing
 */
export async function previewImport(file: File): Promise<{
  valid: boolean;
  version?: string;
  exportedAt?: string;
  counts?: { locations: number; containers: number; items: number };
  error?: string;
}> {
  try {
    if (!isZipFile(file)) {
      return { valid: false, error: 'Unsupported file type. Please use a .zip file.' };
    }

    const zip = await JSZip.loadAsync(file);
    const dataFile = zip.file('data.json');
    if (!dataFile) {
      return { valid: false, error: 'ZIP file does not contain data.json' };
    }
    const jsonString = await dataFile.async('string');

    const data = JSON.parse(jsonString);

    if (!validateExportData(data)) {
      return { valid: false, error: 'Invalid export file format or unsupported version (requires v1.1)' };
    }

    return {
      valid: true,
      version: data.version,
      exportedAt: data.exportedAt,
      counts: {
        locations: data.locations.length,
        containers: data.containers.length,
        items: data.items.length,
      },
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Failed to read file',
    };
  }
}
