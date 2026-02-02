/**
 * Type definitions for Inventori home inventory app
 */

/**
 * Item/Container status enum for tracking lifecycle
 */
export type ItemContainerStatus =
  | 'IN_USE'
  | 'STORED'
  | 'PACKED'
  | 'LENT'
  | 'IN_REPAIR'
  | 'CONSIGNED'
  | 'TO_SELL'
  | 'TO_DONATE'
  | 'TO_REPAIR'
  | 'SOLD'
  | 'DONATED'
  | 'GIFTED'
  | 'STOLEN'
  | 'LOST'
  | 'DISPOSED'
  | 'RECYCLED';

/**
 * A top-level place where items are stored
 * (room, building, storage unit, etc.)
 * Simple organizational entity - can parent other Locations or Items
 */
export interface Location {
  id: string; // 8-char Crockford Base32 ID
  name: string;
  description?: string;
  parentId?: string; // Can parent another Location
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Container or individual item stored in locations
 * Supports rich tracking data (prices, dates, status, etc.)
 * Items MUST have a parent (Location or another Item)
 */
export interface Item {
  id: string; // 8-char Crockford Base32 ID
  name: string;
  description?: string;

  // Hierarchy (required)
  parentId: string; // Location ID or Item ID
  parentType: 'location' | 'item'; // Which store to query for parent

  // Item capabilities
  canHoldItems: boolean; // Can this item hold other items?
  quantity: number; // Default: 1

  // Status and counting
  status: ItemContainerStatus; // Default: 'IN_USE'
  includeInTotal: boolean; // Include in inventory totals? Default: true

  // Categorization and tracking
  tags: string[]; // Default: []
  purchasePrice?: number;
  currentValue?: number;
  dateAcquired?: Date;
  dateDisposed?: Date;

  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for creating a new Location
 */
export type CreateLocationInput = Omit<
  Location,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Input type for updating a Location
 */
export type UpdateLocationInput = Partial<
  Omit<Location, 'id' | 'createdAt' | 'updatedAt'>
>;

/**
 * Input type for creating a new Item
 */
export type CreateItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Input type for updating an Item
 */
export type UpdateItemInput = Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'location' | 'item';
}
