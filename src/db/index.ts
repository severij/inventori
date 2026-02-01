import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Location, Container, Item } from '../types';

/**
 * IndexedDB schema definition for type safety with idb
 */
interface InventoriDB extends DBSchema {
  locations: {
    key: string;
    value: Location;
    indexes: {
      'by-shortId': string;
    };
  };
  containers: {
    key: string;
    value: Container;
    indexes: {
      'by-parent': string;
      'by-shortId': string;
    };
  };
  items: {
    key: string;
    value: Item;
    indexes: {
      'by-parent': string;
      'by-shortId': string;
    };
  };
}

const DB_NAME = 'inventori';
const DB_VERSION = 4; // Bump version to add shortId indexes

let dbPromise: Promise<IDBPDatabase<InventoriDB>> | null = null;

/**
 * Get the database instance, creating it if necessary.
 * Uses singleton pattern to reuse the same connection.
 */
export function getDB(): Promise<IDBPDatabase<InventoriDB>> {
  if (!dbPromise) {
    dbPromise = openDB<InventoriDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        // Create locations store
        if (!db.objectStoreNames.contains('locations')) {
          const locationStore = db.createObjectStore('locations', { keyPath: 'id' });
          locationStore.createIndex('by-shortId', 'shortId', { unique: true });
        } else if (oldVersion < 4) {
          // Add shortId index to existing store
          const locationStore = transaction.objectStore('locations');
          if (!locationStore.indexNames.contains('by-shortId')) {
            locationStore.createIndex('by-shortId', 'shortId', { unique: true });
          }
        }

        // Create containers store with parentId and shortId indexes
        if (!db.objectStoreNames.contains('containers')) {
          const containerStore = db.createObjectStore('containers', { keyPath: 'id' });
          containerStore.createIndex('by-parent', 'parentId');
          containerStore.createIndex('by-shortId', 'shortId', { unique: true });
        } else if (oldVersion < 4) {
          // Add shortId index to existing store
          const containerStore = transaction.objectStore('containers');
          if (!containerStore.indexNames.contains('by-shortId')) {
            containerStore.createIndex('by-shortId', 'shortId', { unique: true });
          }
        }

        // Create items store with parentId and shortId indexes
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-parent', 'parentId');
          itemStore.createIndex('by-shortId', 'shortId', { unique: true });
        } else if (oldVersion < 4) {
          // Add shortId index to existing store
          const itemStore = transaction.objectStore('items');
          if (!itemStore.indexNames.contains('by-shortId')) {
            itemStore.createIndex('by-shortId', 'shortId', { unique: true });
          }
          // Remove old category index if it exists (from earlier versions)
          if ((itemStore.indexNames as DOMStringList).contains('by-category')) {
            itemStore.deleteIndex('by-category');
          }
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Close the database connection.
 * Useful for testing or when the app is shutting down.
 */
export async function closeDB(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}

/**
 * Clear all data from the database.
 * This removes all locations, containers, and items.
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['locations', 'containers', 'items'], 'readwrite');
  await Promise.all([
    tx.objectStore('locations').clear(),
    tx.objectStore('containers').clear(),
    tx.objectStore('items').clear(),
    tx.done,
  ]);
}
