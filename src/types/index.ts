/**
 * Type definitions for Inventori home inventory app
 */

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
 * Supports rich tracking data (prices, dates, tags, etc.)
 * Items can be unassigned (no parent) or assigned to a Location or another Item
 */
export interface Item {
  id: string; // 8-char Crockford Base32 ID
  name?: string; // Optional - allows quick-add items (e.g., photo-only)
  description?: string;

  // Hierarchy (optional - allows unassigned items)
  parentId?: string; // Location ID or Item ID (undefined for unassigned items)
  parentType?: 'location' | 'item'; // Which store to query for parent

  // Item capabilities
  canHoldItems: boolean; // Can this item hold other items?
  quantity: number; // Default: 1

  // Counting
  includeInTotal: boolean; // Include in inventory totals? Default: true

  // Categorization and tracking
  tags: string[]; // Default: []
  purchasePrice?: number;
  currentValue?: number;
  dateAcquired?: Date;

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
  /** For items: true if item can hold other items (container), false if regular item */
  canHoldItems?: boolean;
}
