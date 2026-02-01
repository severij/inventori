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
  };
  containers: {
    key: string;
    value: Container;
    indexes: {
      'by-parent': string;
    };
  };
  items: {
    key: string;
    value: Item;
    indexes: {
      'by-parent': string;
    };
  };
}

const DB_NAME = 'inventori';
const DB_VERSION = 5; // Bump version: shortId is now the primary id field

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
          db.createObjectStore('locations', { keyPath: 'id' });
        } else if (oldVersion < 5) {
          // Remove shortId index if it exists (no longer needed)
          const locationStore = transaction.objectStore('locations');
          if ((locationStore.indexNames as DOMStringList).contains('by-shortId')) {
            locationStore.deleteIndex('by-shortId');
          }
        }

        // Create containers store with parentId index
        if (!db.objectStoreNames.contains('containers')) {
          const containerStore = db.createObjectStore('containers', { keyPath: 'id' });
          containerStore.createIndex('by-parent', 'parentId');
        } else if (oldVersion < 5) {
          // Remove shortId index if it exists (no longer needed)
          const containerStore = transaction.objectStore('containers');
          if ((containerStore.indexNames as DOMStringList).contains('by-shortId')) {
            containerStore.deleteIndex('by-shortId');
          }
          // Ensure by-parent index exists
          if (!containerStore.indexNames.contains('by-parent')) {
            containerStore.createIndex('by-parent', 'parentId');
          }
        }

        // Create items store with parentId index
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-parent', 'parentId');
        } else if (oldVersion < 5) {
          // Remove shortId index if it exists (no longer needed)
          const itemStore = transaction.objectStore('items');
          if ((itemStore.indexNames as DOMStringList).contains('by-shortId')) {
            itemStore.deleteIndex('by-shortId');
          }
          // Ensure by-parent index exists
          if (!itemStore.indexNames.contains('by-parent')) {
            itemStore.createIndex('by-parent', 'parentId');
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
