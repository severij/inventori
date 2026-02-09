import JSZip from 'jszip';
import { getAllLocations } from '../db/locations';
import { getAllItems } from '../db/items';
import type { Location, Item } from '../types';

/** Current export format version */
export const EXPORT_VERSION = '2.1';

/**
 * Exported location with photos as filenames
 */
export interface ExportedLocation {
  id: string; // 8-char Crockford Base32 ID (used for physical labels)
  name: string;
  description?: string;
  parentId?: string; // Parent location ID for nested locations
  photos: string[]; // filenames in images/ folder
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Exported item with photos as filenames
 */
export interface ExportedItem {
  id: string; // 8-char Crockford Base32 ID (used for physical labels)
  name?: string;
  description?: string;
  parentId?: string;
  parentType?: 'location' | 'item';
  canHoldItems: boolean; // Can this item hold other items?
  quantity: number;
  includeInTotal: boolean; // Include in inventory totals?
  tags: string[]; // Categorization tags
  purchasePrice?: number;
  currentValue?: number;
  dateAcquired?: string; // ISO date string
  photos: string[]; // filenames in images/ folder
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Complete export data structure
 */
export interface ExportData {
  version: string;
  exportedAt: string;
  locations: ExportedLocation[];
  items: ExportedItem[];
}

/**
 * Image to be included in the ZIP
 */
interface ImageFile {
  filename: string;
  blob: Blob;
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
  };
  return mimeToExt[mimeType] || 'jpg'; // default to jpg
}

/**
 * Generate a filename for an image
 */
function generateImageFilename(
  entityType: 'location' | 'item',
  entityId: string,
  index: number,
  blob: Blob
): string {
  const ext = getExtensionFromMimeType(blob.type);
  return `${entityType}-${entityId}-${index}.${ext}`;
}

/**
 * Process photos for an entity, returning filenames and image files
 */
function processPhotos(
  entityType: 'location' | 'item',
  entityId: string,
  photos: Blob[]
): { filenames: string[]; images: ImageFile[] } {
  const filenames: string[] = [];
  const images: ImageFile[] = [];

  photos.forEach((blob, index) => {
    const filename = generateImageFilename(entityType, entityId, index, blob);
    filenames.push(filename);
    images.push({ filename, blob });
  });

  return { filenames, images };
}

/**
 * Export a location, returning the exported data and any images
 */
function exportLocation(location: Location): {
  data: ExportedLocation;
  images: ImageFile[];
} {
  const { filenames, images } = processPhotos('location', location.id, location.photos);

  return {
    data: {
      id: location.id,
      name: location.name,
      description: location.description,
      parentId: location.parentId,
      photos: filenames,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    },
    images,
  };
}

/**
 * Export an item, returning the exported data and any images
 */
function exportItem(item: Item): {
  data: ExportedItem;
  images: ImageFile[];
} {
  const { filenames, images } = processPhotos('item', item.id, item.photos);

  return {
    data: {
      id: item.id,
      name: item.name,
      description: item.description,
      parentId: item.parentId,
      parentType: item.parentType,
      canHoldItems: item.canHoldItems,
      quantity: item.quantity,
      includeInTotal: item.includeInTotal,
      tags: item.tags,
      purchasePrice: item.purchasePrice,
      currentValue: item.currentValue,
      dateAcquired: item.dateAcquired?.toISOString(),
      photos: filenames,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    },
    images,
  };
}

/**
 * Export all data from IndexedDB as a ZIP file.
 *
 * The ZIP contains:
 * - data.json: All locations and items with photo filenames
 * - images/: Folder containing all photos
 *
 * @returns Blob containing the ZIP file
 */
export async function exportData(): Promise<Blob> {
  // Fetch all entities from IndexedDB
  const [locations, items] = await Promise.all([
    getAllLocations(),
    getAllItems(),
  ]);

  // Process all entities and collect images
  const allImages: ImageFile[] = [];

  const exportedLocations = locations.map((loc) => {
    const { data, images } = exportLocation(loc);
    allImages.push(...images);
    return data;
  });

  const exportedItems = items.map((item) => {
    const { data, images } = exportItem(item);
    allImages.push(...images);
    return data;
  });

  // Create export data object
  const exportDataObj: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    locations: exportedLocations,
    items: exportedItems,
  };

  // Create ZIP file
  const zip = new JSZip();

  // Add data.json
  zip.file('data.json', JSON.stringify(exportDataObj, null, 2));

  // Add images folder with all images (no compression for images)
  const imagesFolder = zip.folder('images');
  if (imagesFolder) {
    for (const { filename, blob } of allImages) {
      imagesFolder.file(filename, blob, { compression: 'STORE' });
    }
  }

  // Generate ZIP blob
  return zip.generateAsync({
    type: 'blob',
    compression: 'STORE', // No compression for the entire ZIP
  });
}

/**
 * Generate a filename for the export file
 * Format: inventori-backup-YYYY-MM-DD.zip
 */
export function generateExportFilename(): string {
  const date = new Date().toISOString().split('T')[0];
  return `inventori-backup-${date}.zip`;
}

/**
 * Trigger a download of the export data
 */
export async function downloadExport(): Promise<void> {
  const zipBlob = await exportData();
  const url = URL.createObjectURL(zipBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = generateExportFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  URL.revokeObjectURL(url);
}
