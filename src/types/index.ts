/**
 * Type definitions for Inventori home inventory app
 */

/** Parent type for hierarchy relationships */
export type ParentType = 'location' | 'container' | 'item';

/** Entity type discriminator */
export type EntityType = 'location' | 'container' | 'item';

/**
 * A top-level place where items and containers are stored
 * (room, building, storage unit, etc.)
 */
export interface Location {
  id: string;
  type: 'location';
  name: string;
  description?: string;
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A pure organizational container (drawer, shelf, etc.).
 * Does not have purchase/tracking info - use Item with isContainer for that.
 * Can be nested inside locations, other containers, or items with isContainer=true.
 */
export interface Container {
  id: string;
  type: 'container';
  name: string;
  description?: string;
  parentId: string;
  parentType: ParentType;
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * An individual inventory item.
 * Items with isContainer: true can hold containers and other items.
 */
export interface Item {
  id: string;
  type: 'item';
  name: string;
  description?: string;

  // Hierarchy (optional - items can be unassigned)
  parentId?: string;
  parentType?: ParentType;

  // Container capability - if true, this item can hold containers and other items
  isContainer: boolean;

  // Item-specific fields
  quantity: number;
  photos: Blob[];

  createdAt: Date;
  updatedAt: Date;
}

/** Union type for any entity that can be stored */
export type Entity = Location | Container | Item;

/** Union type for entities that can have QR codes (all of them in v2) */
export type Scannable = Entity;

/**
 * Input type for creating a new Location
 * (excludes auto-generated fields)
 */
export type CreateLocationInput = Omit<Location, 'id' | 'type' | 'createdAt' | 'updatedAt'>;

/**
 * Input type for creating a new Container
 * (excludes auto-generated fields)
 */
export type CreateContainerInput = Omit<Container, 'id' | 'type' | 'createdAt' | 'updatedAt'>;

/**
 * Input type for creating a new Item
 * (excludes auto-generated fields)
 */
export type CreateItemInput = Omit<Item, 'id' | 'type' | 'createdAt' | 'updatedAt'>;

/**
 * Input type for updating a Location
 * (all fields optional except id)
 */
export type UpdateLocationInput = Partial<Omit<Location, 'id' | 'type' | 'createdAt' | 'updatedAt'>>;

/**
 * Input type for updating a Container
 * (all fields optional except id)
 */
export type UpdateContainerInput = Partial<Omit<Container, 'id' | 'type' | 'createdAt' | 'updatedAt'>>;

/**
 * Input type for updating an Item
 * (all fields optional except id)
 */
export type UpdateItemInput = Partial<Omit<Item, 'id' | 'type' | 'createdAt' | 'updatedAt'>>;

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  id: string;
  name: string;
  type: EntityType;
}
