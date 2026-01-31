import { getAllLocations } from '../db/locations';
import { getAllContainers } from '../db/containers';
import { getAllItems } from '../db/items';
import type { Location, Container, Item } from '../types';

/** Current export format version */
const EXPORT_VERSION = '1.0';

/**
 * Exported location with photos converted to base64
 */
export interface ExportedLocation extends Omit<Location, 'photos' | 'createdAt' | 'updatedAt'> {
  photos: string[]; // base64 encoded
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Exported container with photos converted to base64
 */
export interface ExportedContainer extends Omit<Container, 'photos' | 'createdAt' | 'updatedAt'> {
  photos: string[]; // base64 encoded
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Exported item with photos and dates converted
 */
export interface ExportedItem extends Omit<Item, 'photos' | 'receiptPhoto' | 'createdAt' | 'updatedAt' | 'purchaseDate' | 'disposalDate'> {
  photos: string[]; // base64 encoded
  receiptPhoto?: string; // base64 encoded
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  purchaseDate?: string; // ISO date string
  disposalDate?: string; // ISO date string
}

/**
 * Complete export data structure
 */
export interface ExportData {
  version: string;
  exportedAt: string;
  locations: ExportedLocation[];
  containers: ExportedContainer[];
  items: ExportedItem[];
}

/**
 * Convert a Blob to a base64 data URL string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert an array of Blobs to base64 strings
 */
async function blobsToBase64(blobs: Blob[]): Promise<string[]> {
  return Promise.all(blobs.map(blobToBase64));
}

/**
 * Convert a Date to ISO string, handling undefined
 */
function dateToString(date: Date | undefined): string | undefined {
  return date ? date.toISOString() : undefined;
}

/**
 * Export a location, converting photos to base64
 */
async function exportLocation(location: Location): Promise<ExportedLocation> {
  return {
    id: location.id,
    type: location.type,
    name: location.name,
    description: location.description,
    photos: await blobsToBase64(location.photos),
    createdAt: location.createdAt.toISOString(),
    updatedAt: location.updatedAt.toISOString(),
  };
}

/**
 * Export a container, converting photos to base64
 */
async function exportContainer(container: Container): Promise<ExportedContainer> {
  return {
    id: container.id,
    type: container.type,
    name: container.name,
    description: container.description,
    parentId: container.parentId,
    parentType: container.parentType,
    photos: await blobsToBase64(container.photos),
    createdAt: container.createdAt.toISOString(),
    updatedAt: container.updatedAt.toISOString(),
  };
}

/**
 * Export an item, converting photos and dates
 */
async function exportItem(item: Item): Promise<ExportedItem> {
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    description: item.description,
    parentId: item.parentId,
    parentType: item.parentType,
    category: item.category,
    quantity: item.quantity,
    brand: item.brand,
    manualUrl: item.manualUrl,
    photos: await blobsToBase64(item.photos),
    receiptPhoto: item.receiptPhoto ? await blobToBase64(item.receiptPhoto) : undefined,
    purchaseDate: dateToString(item.purchaseDate),
    purchasePrice: item.purchasePrice,
    purchaseStore: item.purchaseStore,
    disposalDate: dateToString(item.disposalDate),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

/**
 * Export all data from IndexedDB as a JSON string.
 * 
 * The export includes:
 * - All locations, containers, and items
 * - Photos converted to base64 data URLs
 * - Metadata (version, export timestamp)
 * 
 * @returns JSON string containing all inventory data
 */
export async function exportData(): Promise<string> {
  // Fetch all entities from IndexedDB
  const [locations, containers, items] = await Promise.all([
    getAllLocations(),
    getAllContainers(),
    getAllItems(),
  ]);

  // Convert entities with photos to exportable format
  const [exportedLocations, exportedContainers, exportedItems] = await Promise.all([
    Promise.all(locations.map(exportLocation)),
    Promise.all(containers.map(exportContainer)),
    Promise.all(items.map(exportItem)),
  ]);

  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    locations: exportedLocations,
    containers: exportedContainers,
    items: exportedItems,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate a filename for the export file
 * Format: inventori-backup-YYYY-MM-DD.json
 */
export function generateExportFilename(): string {
  const date = new Date().toISOString().split('T')[0];
  return `inventori-backup-${date}.json`;
}

/**
 * Trigger a download of the export data
 */
export async function downloadExport(): Promise<void> {
  const jsonString = await exportData();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = generateExportFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the object URL
  URL.revokeObjectURL(url);
}
