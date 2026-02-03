import JSZip from 'jszip';
import { getDB } from '../db/index';
import { getLocation } from '../db/locations';
import { getItem } from '../db/items';
import type { Location, Item } from '../types';
import type { ExportData, ExportedLocation, ExportedItem } from './export';

/** Supported export format versions */
const SUPPORTED_VERSIONS = ['1.1', '2.0'];

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean;
  locations: { added: number; updated: number };
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
 * Check if an ID is already used by a different entity type
 * (prevents collisions when importing data that might have ID conflicts)
 */
async function isIdCollision(id: string, expectedType: 'location' | 'item'): Promise<boolean> {
  if (expectedType !== 'location') {
    const existingLocation = await getLocation(id);
    if (existingLocation) return true;
  }

  if (expectedType !== 'item') {
    const existingItem = await getItem(id);
    if (existingItem) return true;
  }

  return false;
}

/**
 * Convert an exported location back to a Location
 */
async function importLocation(
  exported: ExportedLocation,
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Promise<Location | null> {
  // Check for ID collision with a different entity type
  const hasCollision = await isIdCollision(exported.id, 'location');
  if (hasCollision) {
    warnings.push(`ID "${exported.id}" for location "${exported.name}" conflicts with another entity type. Skipped.`);
    return null;
  }

  return {
    id: exported.id,
    name: exported.name,
    description: exported.description,
    photos: getImagesFromMap(exported.photos, imagesMap, warnings),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Convert an exported item back to an Item
 */
async function importItem(
  exported: ExportedItem,
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Promise<Item | null> {
  // Check for ID collision with a different entity type
  const hasCollision = await isIdCollision(exported.id, 'item');
  if (hasCollision) {
    warnings.push(`ID "${exported.id}" for item "${exported.name}" conflicts with another entity type. Skipped.`);
    return null;
  }

  return {
    id: exported.id,
    name: exported.name,
    description: exported.description,
    parentId: exported.parentId,
    parentType: (exported.parentType as any) === 'container' ? 'item' : exported.parentType,
    canHoldItems: exported.canHoldItems ?? (exported as any).isContainer ?? false,
    quantity: exported.quantity ?? 1,
    includeInTotal: true,
    tags: [],
    photos: getImagesFromMap(exported.photos, imagesMap, warnings),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Validate the export data structure.
 * Supports both v1.1 (with containers) and v2.0 (containers as items with canHoldItems).
 */
function validateExportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const d = data as Record<string, unknown>;

  // Check required fields
  if (typeof d.version !== 'string') return false;
  if (!Array.isArray(d.locations)) return false;
  if (!Array.isArray(d.items)) return false;

  // Check version compatibility - support both v1.1 and v2.0
  if (!SUPPORTED_VERSIONS.includes(d.version)) {
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
    result.errors.push('Invalid export file format or unsupported version (requires v1.1 or v2.0)');
    return result;
  }

  const db = await getDB();

  // Import locations
  for (const exported of data.locations) {
    try {
      const location = await importLocation(exported, imagesMap, result.warnings);
      if (!location) continue; // Skipped due to collision

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

  // Import items
  for (const exported of data.items) {
    try {
      const item = await importItem(exported, imagesMap, result.warnings);
      if (!item) continue; // Skipped due to collision

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

  // For v1.1 files, convert containers to items with canHoldItems=true
  if (data.version === '1.1' && 'containers' in data && Array.isArray((data as any).containers)) {
    for (const container of (data as any).containers) {
      try {
        // Convert old container to new item format with canHoldItems
        const item: Item = {
          id: container.id,
          name: container.name,
          description: container.description,
          parentId: container.parentId,
          parentType: container.parentType === 'container' ? 'item' : container.parentType,
          canHoldItems: true,
          quantity: 1,
          includeInTotal: true,
          tags: [],
          photos: getImagesFromMap(container.photos || [], imagesMap, result.warnings),
          createdAt: new Date(container.createdAt),
          updatedAt: new Date(container.updatedAt),
        };

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
          `Failed to import container "${container.name}": ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
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
  counts?: { locations: number; items: number };
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
      return { valid: false, error: 'Invalid export file format or unsupported version (requires v1.1 or v2.0)' };
    }

    return {
      valid: true,
      version: data.version,
      exportedAt: data.exportedAt,
      counts: {
        locations: data.locations.length,
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
