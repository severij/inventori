import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Location, Item } from '../types';

/**
 * IndexedDB schema definition for type safety with idb
 * v6: Location and Item stores (separate, not consolidated)
 */
interface InventoriDB extends DBSchema {
  locations: {
    key: string;
    value: Location;
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
const DB_VERSION = 6; // v6: Location and Item stores (Phase 9.1)

let dbPromise: Promise<IDBPDatabase<InventoriDB>> | null = null;

/**
 * Get the database instance, creating it if necessary.
 * Uses singleton pattern to reuse the same connection.
 */
export function getDB(): Promise<IDBPDatabase<InventoriDB>> {
  if (!dbPromise) {
     dbPromise = openDB<InventoriDB>(DB_NAME, DB_VERSION, {
       upgrade(db, oldVersion, _newVersion, transaction) {
         // Create locations store (no indexes)
         if (!db.objectStoreNames.contains('locations')) {
           db.createObjectStore('locations', { keyPath: 'id' });
         }

         // Create items store with parentId index
         if (!db.objectStoreNames.contains('items')) {
           const itemStore = db.createObjectStore('items', { keyPath: 'id' });
           itemStore.createIndex('by-parent', 'parentId');
         } else if (oldVersion < 6) {
           // For existing items store, ensure by-parent index exists
           const itemStore = transaction.objectStore('items');
           if (!itemStore.indexNames.contains('by-parent')) {
             itemStore.createIndex('by-parent', 'parentId');
           }
         }

          // Delete old containers store if it exists (from v5 or earlier)
          if ((db.objectStoreNames as any).contains('containers')) {
            (db as any).deleteObjectStore('containers');
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
 * This removes all locations and items.
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['locations', 'items'], 'readwrite');
  await Promise.all([
    tx.objectStore('locations').clear(),
    tx.objectStore('items').clear(),
    tx.done,
  ]);
}
