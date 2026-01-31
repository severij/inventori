import JSZip from 'jszip';
import { getAllLocations } from '../db/locations';
import { getAllContainers } from '../db/containers';
import { getAllItems } from '../db/items';
import type { Location, Container, Item } from '../types';

/** Current export format version */
export const EXPORT_VERSION = '1.1';

/**
 * Exported location with photos as filenames
 */
export interface ExportedLocation {
  id: string;
  type: 'location';
  name: string;
  description?: string;
  photos: string[]; // filenames in images/ folder
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Exported container with photos as filenames
 */
export interface ExportedContainer {
  id: string;
  type: 'container';
  name: string;
  description?: string;
  parentId: string;
  parentType: 'location' | 'container';
  photos: string[]; // filenames in images/ folder
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Exported item with photos as filenames
 */
export interface ExportedItem {
  id: string;
  type: 'item';
  name: string;
  description?: string;
  parentId?: string;
  parentType?: 'location' | 'container';
  category?: string;
  quantity: number;
  brand?: string;
  manualUrl?: string;
  photos: string[]; // filenames in images/ folder
  receiptPhoto?: string; // filename in images/ folder
  purchaseDate?: string; // ISO date string
  purchasePrice?: number;
  purchaseStore?: string;
  disposalDate?: string; // ISO date string
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
  containers: ExportedContainer[];
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
  entityType: 'location' | 'container' | 'item',
  entityId: string,
  index: number | 'receipt',
  blob: Blob
): string {
  const ext = getExtensionFromMimeType(blob.type);
  const suffix = index === 'receipt' ? 'receipt' : index.toString();
  return `${entityType}-${entityId}-${suffix}.${ext}`;
}

/**
 * Convert a Date to ISO string, handling undefined
 */
function dateToString(date: Date | undefined): string | undefined {
  return date ? date.toISOString() : undefined;
}

/**
 * Process photos for an entity, returning filenames and image files
 */
function processPhotos(
  entityType: 'location' | 'container' | 'item',
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
      type: location.type,
      name: location.name,
      description: location.description,
      photos: filenames,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    },
    images,
  };
}

/**
 * Export a container, returning the exported data and any images
 */
function exportContainer(container: Container): {
  data: ExportedContainer;
  images: ImageFile[];
} {
  const { filenames, images } = processPhotos('container', container.id, container.photos);

  return {
    data: {
      id: container.id,
      type: container.type,
      name: container.name,
      description: container.description,
      parentId: container.parentId,
      parentType: container.parentType,
      photos: filenames,
      createdAt: container.createdAt.toISOString(),
      updatedAt: container.updatedAt.toISOString(),
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

  // Handle receipt photo separately
  let receiptFilename: string | undefined;
  if (item.receiptPhoto) {
    receiptFilename = generateImageFilename('item', item.id, 'receipt', item.receiptPhoto);
    images.push({ filename: receiptFilename, blob: item.receiptPhoto });
  }

  return {
    data: {
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
      photos: filenames,
      receiptPhoto: receiptFilename,
      purchaseDate: dateToString(item.purchaseDate),
      purchasePrice: item.purchasePrice,
      purchaseStore: item.purchaseStore,
      disposalDate: dateToString(item.disposalDate),
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
 * - data.json: All locations, containers, and items with photo filenames
 * - images/: Folder containing all photos
 *
 * @returns Blob containing the ZIP file
 */
export async function exportData(): Promise<Blob> {
  // Fetch all entities from IndexedDB
  const [locations, containers, items] = await Promise.all([
    getAllLocations(),
    getAllContainers(),
    getAllItems(),
  ]);

  // Process all entities and collect images
  const allImages: ImageFile[] = [];

  const exportedLocations = locations.map((loc) => {
    const { data, images } = exportLocation(loc);
    allImages.push(...images);
    return data;
  });

  const exportedContainers = containers.map((cont) => {
    const { data, images } = exportContainer(cont);
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
    containers: exportedContainers,
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
