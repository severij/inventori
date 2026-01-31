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
      'by-category': string;
    };
  };
}

const DB_NAME = 'inventori';
const DB_VERSION = 3; // Bump version to add back containers store

let dbPromise: Promise<IDBPDatabase<InventoriDB>> | null = null;

/**
 * Get the database instance, creating it if necessary.
 * Uses singleton pattern to reuse the same connection.
 */
export function getDB(): Promise<IDBPDatabase<InventoriDB>> {
  if (!dbPromise) {
    dbPromise = openDB<InventoriDB>(DB_NAME, DB_VERSION, {
      upgrade(db, _oldVersion, _newVersion, _transaction) {
        // Create locations store
        if (!db.objectStoreNames.contains('locations')) {
          db.createObjectStore('locations', { keyPath: 'id' });
        }

        // Create containers store with parentId index
        if (!db.objectStoreNames.contains('containers')) {
          const containerStore = db.createObjectStore('containers', { keyPath: 'id' });
          containerStore.createIndex('by-parent', 'parentId');
        }

        // Create items store with parentId and category indexes
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-parent', 'parentId');
          itemStore.createIndex('by-category', 'category');
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
