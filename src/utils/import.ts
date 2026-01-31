import JSZip from 'jszip';
import { getDB } from '../db/index';
import type { Location, Container, Item } from '../types';
import type { ExportData, ExportedLocation, ExportedContainer, ExportedItem } from './export';

/** Supported export format versions */
const SUPPORTED_VERSIONS = ['1.0', '1.1'];

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
 * Legacy v1.0 format with base64 images
 */
interface LegacyExportedLocation extends Omit<ExportedLocation, 'photos'> {
  photos: string[]; // base64 encoded in v1.0
}

interface LegacyExportedContainer extends Omit<ExportedContainer, 'photos'> {
  photos: string[]; // base64 encoded in v1.0
  parentType: 'location' | 'container'; // v1.0 didn't support 'item' as parent
}

interface LegacyExportedItem extends Omit<ExportedItem, 'photos' | 'receiptPhoto' | 'isContainer'> {
  photos: string[]; // base64 encoded in v1.0
  receiptPhoto?: string; // base64 encoded in v1.0
  isContainer?: boolean; // Optional in legacy, may not exist
  parentType?: 'location' | 'container'; // v1.0 didn't support 'item' as parent
}

interface LegacyExportData {
  version: '1.0';
  exportedAt: string;
  locations: LegacyExportedLocation[];
  containers: LegacyExportedContainer[];
  items: LegacyExportedItem[];
}

/**
 * Check if a string is a base64 data URL
 */
function isBase64DataUrl(str: string): boolean {
  return str.startsWith('data:');
}

/**
 * Convert a base64 data URL to a Blob (for v1.0 backward compat)
 */
async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return response.blob();
}

/**
 * Convert an array of base64 strings to Blobs (for v1.0 backward compat)
 */
async function base64ArrayToBlobs(base64Array: string[]): Promise<Blob[]> {
  if (!base64Array || !Array.isArray(base64Array)) {
    return [];
  }

  const results = await Promise.allSettled(base64Array.map(base64ToBlob));
  return results
    .filter((r): r is PromiseFulfilledResult<Blob> => r.status === 'fulfilled')
    .map((r) => r.value);
}

/**
 * Parse an ISO date string to a Date object
 */
function parseDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
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
 * Convert an exported location back to a Location (v1.1 format)
 */
function importLocationV11(
  exported: ExportedLocation,
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Location {
  return {
    id: exported.id,
    type: 'location',
    name: exported.name,
    description: exported.description,
    photos: getImagesFromMap(exported.photos, imagesMap, warnings),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Convert an exported container back to a Container (v1.1 format)
 */
function importContainerV11(
  exported: ExportedContainer,
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Container {
  return {
    id: exported.id,
    type: 'container',
    name: exported.name,
    description: exported.description,
    parentId: exported.parentId,
    parentType: exported.parentType,
    photos: getImagesFromMap(exported.photos, imagesMap, warnings),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Convert an exported item back to an Item (v1.1 format)
 */
function importItemV11(
  exported: ExportedItem,
  imagesMap: Map<string, Blob>,
  warnings: string[]
): Item {
  let receiptPhoto: Blob | undefined;
  if (exported.receiptPhoto) {
    receiptPhoto = imagesMap.get(exported.receiptPhoto);
    if (!receiptPhoto) {
      warnings.push(`Receipt image not found in archive: ${exported.receiptPhoto}`);
    }
  }

  return {
    id: exported.id,
    type: 'item',
    name: exported.name,
    description: exported.description,
    parentId: exported.parentId,
    parentType: exported.parentType,
    isContainer: exported.isContainer,
    category: exported.category,
    quantity: exported.quantity ?? 1,
    brand: exported.brand,
    manualUrl: exported.manualUrl,
    photos: getImagesFromMap(exported.photos, imagesMap, warnings),
    receiptPhoto,
    purchaseDate: parseDate(exported.purchaseDate),
    purchasePrice: exported.purchasePrice,
    purchaseStore: exported.purchaseStore,
    disposalDate: parseDate(exported.disposalDate),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Convert a legacy v1.0 location (with base64 photos) back to a Location
 */
async function importLocationV10(exported: LegacyExportedLocation): Promise<Location> {
  return {
    id: exported.id,
    type: 'location',
    name: exported.name,
    description: exported.description,
    photos: await base64ArrayToBlobs(exported.photos),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Convert a legacy v1.0 container (with base64 photos) back to a Container
 */
async function importContainerV10(exported: LegacyExportedContainer): Promise<Container> {
  return {
    id: exported.id,
    type: 'container',
    name: exported.name,
    description: exported.description,
    parentId: exported.parentId,
    parentType: exported.parentType,
    photos: await base64ArrayToBlobs(exported.photos),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Convert a legacy v1.0 item (with base64 photos) back to an Item
 */
async function importItemV10(exported: LegacyExportedItem): Promise<Item> {
  return {
    id: exported.id,
    type: 'item',
    name: exported.name,
    description: exported.description,
    parentId: exported.parentId,
    parentType: exported.parentType,
    isContainer: exported.isContainer ?? false, // Default to false for legacy imports
    category: exported.category,
    quantity: exported.quantity ?? 1,
    brand: exported.brand,
    manualUrl: exported.manualUrl,
    photos: await base64ArrayToBlobs(exported.photos),
    receiptPhoto: exported.receiptPhoto ? await base64ToBlob(exported.receiptPhoto) : undefined,
    purchaseDate: parseDate(exported.purchaseDate),
    purchasePrice: exported.purchasePrice,
    purchaseStore: exported.purchaseStore,
    disposalDate: parseDate(exported.disposalDate),
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };
}

/**
 * Validate the export data structure
 */
function validateExportData(data: unknown): data is ExportData | LegacyExportData {
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
  if (!SUPPORTED_VERSIONS.includes(d.version)) {
    return false;
  }

  return true;
}

/**
 * Detect if the data is v1.0 format (has base64 images)
 */
function isLegacyFormat(data: ExportData | LegacyExportData): data is LegacyExportData {
  // Check version explicitly
  if (data.version === '1.0') return true;
  if (data.version === '1.1') return false;

  // Fallback: check if first photo looks like base64
  const firstLocation = data.locations[0];
  if (firstLocation?.photos?.[0] && isBase64DataUrl(firstLocation.photos[0])) {
    return true;
  }

  const firstItem = data.items[0];
  if (firstItem?.photos?.[0] && isBase64DataUrl(firstItem.photos[0])) {
    return true;
  }

  return false;
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
 * Check if a file is a JSON file
 */
export function isJsonFile(file: File): boolean {
  return file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
}

/**
 * Import data from a ZIP or JSON file into IndexedDB.
 * Uses merge strategy: items with existing IDs are updated, new items are added.
 *
 * @param file - The file to import (ZIP for v1.1, JSON for v1.0)
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

  let jsonString: string;
  let imagesMap = new Map<string, Blob>();

  // Extract content based on file type
  try {
    if (isZipFile(file)) {
      const extracted = await extractZip(file);
      jsonString = extracted.json;
      imagesMap = extracted.images;
    } else if (isJsonFile(file)) {
      jsonString = await readFileAsText(file);
    } else {
      result.errors.push('Unsupported file type. Please use a .zip or .json file.');
      return result;
    }
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
    result.errors.push('Invalid export file format or unsupported version');
    return result;
  }

  const db = await getDB();
  const isLegacy = isLegacyFormat(data);

  // Import locations
  for (const exported of data.locations) {
    try {
      const location = isLegacy
        ? await importLocationV10(exported as LegacyExportedLocation)
        : importLocationV11(exported as ExportedLocation, imagesMap, result.warnings);

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
      const container = isLegacy
        ? await importContainerV10(exported as LegacyExportedContainer)
        : importContainerV11(exported as ExportedContainer, imagesMap, result.warnings);

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
      const item = isLegacy
        ? await importItemV10(exported as LegacyExportedItem)
        : importItemV11(exported as ExportedItem, imagesMap, result.warnings);

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
    let jsonString: string;

    if (isZipFile(file)) {
      const zip = await JSZip.loadAsync(file);
      const dataFile = zip.file('data.json');
      if (!dataFile) {
        return { valid: false, error: 'ZIP file does not contain data.json' };
      }
      jsonString = await dataFile.async('string');
    } else if (isJsonFile(file)) {
      jsonString = await readFileAsText(file);
    } else {
      return { valid: false, error: 'Unsupported file type' };
    }

    const data = JSON.parse(jsonString);

    if (!validateExportData(data)) {
      return { valid: false, error: 'Invalid export file format or unsupported version' };
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
