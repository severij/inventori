import { getDB } from '../db/index';
import type { Location, Container, Item } from '../types';
import type { ExportData, ExportedLocation, ExportedContainer, ExportedItem } from './export';

/** Supported export format versions */
const SUPPORTED_VERSIONS = ['1.0'];

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean;
  locations: { added: number; updated: number };
  containers: { added: number; updated: number };
  items: { added: number; updated: number };
  errors: string[];
}

/**
 * Convert a base64 data URL to a Blob
 */
async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return response.blob();
}

/**
 * Convert an array of base64 strings to Blobs
 * Handles errors gracefully - returns empty array for invalid data
 */
async function base64ArrayToBlobs(base64Array: string[]): Promise<Blob[]> {
  if (!base64Array || !Array.isArray(base64Array)) {
    return [];
  }
  
  const results = await Promise.allSettled(base64Array.map(base64ToBlob));
  return results
    .filter((r): r is PromiseFulfilledResult<Blob> => r.status === 'fulfilled')
    .map(r => r.value);
}

/**
 * Parse an ISO date string to a Date object
 * Returns undefined if the string is invalid or undefined
 */
function parseDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Convert an exported location back to a Location
 */
async function importLocation(exported: ExportedLocation): Promise<Location> {
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
 * Convert an exported container back to a Container
 */
async function importContainer(exported: ExportedContainer): Promise<Container> {
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
 * Convert an exported item back to an Item
 */
async function importItem(exported: ExportedItem): Promise<Item> {
  return {
    id: exported.id,
    type: 'item',
    name: exported.name,
    description: exported.description,
    parentId: exported.parentId,
    parentType: exported.parentType,
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
  if (!SUPPORTED_VERSIONS.includes(d.version)) {
    return false;
  }
  
  return true;
}

/**
 * Import data from a JSON string into IndexedDB.
 * Uses merge strategy: items with existing IDs are updated, new items are added.
 * 
 * @param jsonString - The JSON string from an export file
 * @returns ImportResult with counts of added/updated items and any errors
 */
export async function importData(jsonString: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    locations: { added: 0, updated: 0 },
    containers: { added: 0, updated: 0 },
    items: { added: 0, updated: 0 },
    errors: [],
  };

  // Parse JSON
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch {
    result.errors.push('Invalid JSON format');
    return result;
  }

  // Validate structure
  if (!validateExportData(data)) {
    result.errors.push('Invalid export file format or unsupported version');
    return result;
  }

  const db = await getDB();

  // Import locations
  for (const exported of data.locations) {
    try {
      const location = await importLocation(exported);
      const existing = await db.get('locations', location.id);
      
      if (existing) {
        await db.put('locations', location);
        result.locations.updated++;
      } else {
        await db.add('locations', location);
        result.locations.added++;
      }
    } catch (err) {
      result.errors.push(`Failed to import location "${exported.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Import containers
  for (const exported of data.containers) {
    try {
      const container = await importContainer(exported);
      const existing = await db.get('containers', container.id);
      
      if (existing) {
        await db.put('containers', container);
        result.containers.updated++;
      } else {
        await db.add('containers', container);
        result.containers.added++;
      }
    } catch (err) {
      result.errors.push(`Failed to import container "${exported.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Import items
  for (const exported of data.items) {
    try {
      const item = await importItem(exported);
      const existing = await db.get('items', item.id);
      
      if (existing) {
        await db.put('items', item);
        result.items.updated++;
      } else {
        await db.add('items', item);
        result.items.added++;
      }
    } catch (err) {
      result.errors.push(`Failed to import item "${exported.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
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
export function previewImport(jsonString: string): { 
  valid: boolean; 
  version?: string;
  exportedAt?: string;
  counts?: { locations: number; containers: number; items: number };
  error?: string;
} {
  try {
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
  } catch {
    return { valid: false, error: 'Invalid JSON format' };
  }
}
