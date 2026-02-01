# Inventori - Requirements

A local-first home inventory progressive web app (PWA) for tracking items, their locations, and containers.

## Overview

Inventori helps users catalog and organize their physical belongings with a hierarchical structure of locations, containers, and items. The app works entirely offline using IndexedDB, with future plans for QR code scanning and peer-to-peer sync.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Storage | IndexedDB (via `idb` wrapper) |
| PWA | vite-plugin-pwa |
| Language | TypeScript |
| Routing | React Router (HashRouter) |

## Data Model

### ID Format

All entities use an 8-character Crockford Base32 ID as their primary key:

- **Format**: 8 characters using Crockford Base32 alphabet
- **Alphabet**: `0123456789ABCDEFGHJKMNPQRSTVWXYZ` (32 characters)
- **Excluded characters**: I, L, O, U (to avoid confusion with 1, 1, 0, and V)
- **Display**: Formatted as `XXXX-XXXX` with hyphen for readability
- **Storage**: Stored as `ABCDEFGH` (no hyphen)
- **Entropy**: 40 bits (~1 trillion combinations)
- **Generation**: Automatically generated when entity is created
- **Uniqueness**: Globally unique across all entity types
- **Use case**: Can be used on physical labels for quick lookup

Example: `7KM3-QRST`

### Location

A top-level place where items are stored (room, building, storage unit, etc.). Simple organizational entity.

```typescript
interface Location {
  id: string;              // 8-char Crockford Base32 ID
  name: string;            // e.g., "Living Room", "Garage", "Storage Unit #5"
  description?: string;
  parentId?: string;       // Can parent another Location (e.g., House A > House B > Kitchen)
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Notes:**
- No `type` field (separate entity type from Item)
- Locations can be nested (House > Room)
- No tracking fields (status, prices, dates)

### Item Status Enum

Item status tracking for lifecycle management:

```typescript
type ItemContainerStatus = 
  | 'IN_USE'        // Currently using/storing
  | 'STORED'        // Put away, not actively using
  | 'PACKED'        // Packed for moving/storage
  | 'LENT'          // Lent to someone
  | 'IN_REPAIR'     // Sent for repair
  | 'CONSIGNED'     // Left with consignment shop
  | 'TO_SELL'       // Marked to sell
  | 'TO_DONATE'     // Marked to donate
  | 'TO_REPAIR'     // Marked for repair
  | 'SOLD'          // Sold/transferred
  | 'DONATED'       // Donated
  | 'GIFTED'        // Gifted to someone
  | 'STOLEN'        // Reported stolen
  | 'LOST'          // Lost/missing
  | 'DISPOSED'      // Thrown away
  | 'RECYCLED';     // Recycled
```

### Item

Container or individual item stored in locations. Supports rich tracking data.

```typescript
interface Item {
  id: string;                            // 8-char Crockford Base32 ID
  name: string;
  description?: string;
  
  // Hierarchy (required)
  parentId: string;                      // Location ID or Item ID (must have parent)
  parentType: 'location' | 'item';       // Which store to query for parent
  
  // Item capabilities
  canHoldItems: boolean;                 // Can this item hold other items?
  quantity: number;                      // Default: 1 (quantity of items)
  
  // Status and counting
  status: ItemContainerStatus;           // Current state (default: 'IN_USE')
  includeInTotal: boolean;               // Include in inventory totals? (default: true)
                                         // Set to false for built-in structures (shelves, drawers)
  
  // Categorization and tracking
  tags: string[];                        // Categories/labels (e.g., ['electronics', 'gifts', 'seasonal'])
  purchasePrice?: number;                // Original purchase cost (currency assumed consistent)
  currentValue?: number;                 // Estimated current worth
  dateAcquired?: Date;                   // When purchased/acquired
  dateDisposed?: Date;                   // When sold/donated/thrown away
  
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Hierarchy Example

```
House A (Location)
├── House B (Location, parent: House A)
│   └── Kitchen (Location, parent: House B)
│       ├── Refrigerator (Item, canHoldItems: true, parent: Kitchen)
│       │   └── Leftovers (Item, quantity: 3, parent: Refrigerator)
│       └── Dishes (Item, quantity: 12, parent: Kitchen)
└── Garage (Location)
    ├── Metal Shelf (Item, canHoldItems: true, includeInTotal: false)
    │   ├── Red Toolbox (Item, canHoldItems: true, parent: Metal Shelf)
    │   │   ├── Hammer (Item, parent: Red Toolbox)
    │   │   └── Wrench (Item, parent: Red Toolbox)
    │   └── Blue Bin (Item, canHoldItems: true, parent: Metal Shelf)
    │       └── Christmas Lights (Item, quantity: 1, parent: Blue Bin)
    └── Car Jack (Item, quantity: 1)
```

### Item Counting Rules

Counting respects both `includeInTotal` flag and quantity:

```
count = SUM(
  quantity for item
  WHERE includeInTotal: true
  Recursively includes nested items
)
```

Example:
- Garage has: Metal Shelf (notCounted), Car Jack, Toolbox with 2 items
- Count: Car Jack (1) + Toolbox (1) + 2 items = 4
- Metal Shelf excluded (includeInTotal: false)

## Version Roadmap

### v1 (Current Scope)

#### Core Features

1. **Location Management**
   - Create, view, edit, delete locations
   - View all containers and items within a location
   - Photo attachments
   - ID displayed for physical labels

2. **Container Management**
   - Create, view, edit, delete containers
   - Nest containers within locations or other containers (infinite depth)
   - View all contents (child containers and items)
   - Photo attachments
   - ID displayed for physical labels

3. **Item Management**
   - Create, view, edit, delete items
   - All data fields as defined in the data model
   - Items can be unassigned (no parent) or assigned to a location/container/item
   - Items can be marked as containers (`isContainer=true`) to hold other items
   - Photo attachments (multiple photos per item)
   - ID displayed for physical labels

4. **Navigation & Organization**
   - Home page showing all locations
   - Drill-down navigation into locations and containers
   - Breadcrumb navigation showing current path

5. **Search**
   - Global search across all items, containers, and locations
   - Search by name, description
   - Search by ID (exact match when input looks like an ID)

6. **Photo Capture**
   - Camera integration for taking photos
   - File upload for existing photos
   - Photo preview and deletion

7. **Data Management**
   - ZIP export/backup of all data (v1.1 format)
   - ZIP import/restore from backup (merge by ID)

## Export/Import Format

The export utility produces a ZIP file with the following structure:

```
inventori-backup-YYYY-MM-DD.zip
├── data.json
└── images/
    ├── location-{id}-{index}.{ext}
    ├── container-{id}-{index}.{ext}
    └── item-{id}-{index}.{ext}
```

### data.json structure

```typescript
interface ExportData {
  version: "1.1";           // Export format version
  exportedAt: string;       // ISO 8601 timestamp
  locations: ExportedLocation[];
  containers: ExportedContainer[];
  items: ExportedItem[];
}
```

Key transformations from IndexedDB to export:
- **Photos (Blob[])**: Stored as separate files in `images/` folder, referenced by filename
- **Dates**: Converted to ISO 8601 strings
- **IDs**: 8-char Crockford Base32 IDs preserved
- **Structure**: Flat format with separate arrays (not nested hierarchy)

The flat format preserves relationships via `parentId` and `parentType` fields, making it easy to re-import into IndexedDB.

### Import Behavior

Import uses a **merge by ID** strategy:
- Items with matching IDs are **updated** with imported data
- Items with new IDs are **added** to the database
- Existing items not in the import file are **preserved**

This is safe because IDs are generated with high entropy (~1 trillion combinations) - items created on different devices will have different IDs and won't conflict.

#### PWA Features

1. **Offline-First**
   - Full functionality without internet connection
   - Service worker caching for app shell and assets
   - Runtime caching for images and fonts

2. **Installable**
   - Web app manifest
   - "Add to Home Screen" support
   - App icons (SVG format: 192x192, 512x512)
   - Apple touch icon for iOS
   - PWA meta tags for iOS standalone mode

3. **Static Hosting Compatible**
   - Uses HashRouter for compatibility with GitHub Pages and other static hosts
   - No server-side configuration required

4. **Sync Status Indicator (v3)**
   - Visual indicator showing connection to sync server
   - Deferred until P2P sync is implemented

### v2 (Deferred)

1. **QR Code Generation**
   - Generate printable QR codes for locations, containers, and items
   - QR code contains entity ID
   - Print-friendly layout

2. **QR Code Scanning**
   - Camera-based QR code scanning
   - Scan to navigate directly to location/container/item

### v3 (Deferred)

1. **P2P Sync**
   - Peer-to-peer synchronization between devices
   - Conflict resolution using timestamps

## Non-Functional Requirements

1. **Performance**
   - Fast initial load time
   - Smooth scrolling and navigation
   - Efficient IndexedDB queries with proper indexes

2. **Responsiveness**
   - Mobile-first design
   - Works on phone, tablet, and desktop
   - Touch-friendly UI

3. **Accessibility**
   - Semantic HTML
   - Keyboard navigation
   - Screen reader support

4. **Data Integrity**
   - All IDs are 8-char Crockford Base32 (high entropy for sync compatibility)
   - Timestamps on all entities for conflict resolution
   - Cascade considerations when deleting locations/containers

## IndexedDB Schema

Database version: **6** (v2.0+)

Previous versions:
- v1-5: Original schema with separate locations, containers, items stores
- v6: Location and Item stores (Phase 9)

### Object Stores

| Store | Key Path | Indexes |
|-------|----------|---------|
| `locations` | `id` | - |
| `items` | `id` | `by-parent` (parentId) |

## Project Structure

```
inventori/
├── public/                       # Static assets
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # App shell with navigation
│   │   ├── HamburgerMenu.tsx   # Dropdown menu with app actions
│   │   ├── ConfirmDialog.tsx   # Reusable confirmation dialog
│   │   ├── SearchBar.tsx       # Debounced search input component
│   │   ├── PhotoCapture.tsx    # Camera/upload component
│   │   ├── EntityCard.tsx      # Card for displaying location/item
│   │   ├── Breadcrumbs.tsx     # Navigation breadcrumbs
│   │   ├── IdDisplay.tsx       # ID display with copy button
│   │   ├── LocationForm.tsx    # Form for creating/editing locations
│   │   ├── ItemForm.tsx        # Form for creating/editing items
│   │   ├── InstallButton.tsx   # PWA install prompt button (standalone)
│   │   └── ExportButton.tsx    # Data export trigger button (standalone)
│   ├── db/
│   │   ├── index.ts            # DB initialization and schema (v6)
│   │   ├── locations.ts        # Location CRUD operations
│   │   └── items.ts            # Item CRUD operations
│   ├── hooks/
│   │   ├── useLocations.ts     # Location data hook
│   │   ├── useItems.ts         # Item data hook
│   │   ├── useChildren.ts      # Get children of a parent
│   │   ├── useAncestors.ts     # Get breadcrumb path
│   │   ├── useOffline.ts       # Offline status hook
│   │   └── useInstallPrompt.ts # PWA install prompt hook
│   ├── pages/
│   │   ├── Home.tsx            # List all locations
│   │   ├── LocationView.tsx    # View location contents and items
│   │   ├── ItemView.tsx        # View item details
│   │   ├── AddLocation.tsx     # Create location
│   │   ├── AddItem.tsx         # Create item
│   │   ├── EditLocation.tsx    # Edit location
│   │   ├── EditItem.tsx        # Edit item
│   │   └── Search.tsx          # Global search page (includes ID search)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces (Location, Item, ItemContainerStatus)
│   ├── utils/
│   │   ├── shortId.ts          # ID generation (Crockford Base32)
│   │   ├── export.ts           # ZIP export functionality
│   │   └── import.ts           # ZIP import functionality
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind imports
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development

### Prerequisites

Node.js 18+ installed via nvm. Add to `~/.bashrc`:
```bash
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server at http://localhost:5173 |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |

---

## Phase 10 Features (Post-v2.0 Enhancements)

### Phase 10.1: Entity Text Export

**Feature:** Allow users to share entity information with minimal text format, optionally including photos in a ZIP file.

**Text Format (Minimal):**
```
Name: {name}
Quantity: {quantity}
Description: {description}
```

**Copy Options:**

1. **Copy as Text** `[📋 Copy Text]`
   - Copy formatted text to clipboard
   - Perfect for: AI agents, notes, quick sharing
   - Toast: "✅ Copied to clipboard"

2. **Download ZIP** `[📥 Download ZIP]`
   - ZIP file containing:
     - `entity.txt` - Formatted text
     - `images/` folder - All entity photos
   - Filename: `entity-{name}-{id}.zip`
   - Perfect for: Marketplace listings, complete sharing package
   - Toast: "✅ Downloaded entity-{name}-{id}.zip"

**UI Location:** EntityView page action buttons

**Use Cases:**
- Create AI-assisted marketplace listings
- Share item details with buyers/sellers
- Quick reference copying
- Organize information before selling/trading

---

### Phase 10.2: Step-by-Step Parent Picker

**Problem Fixed:** Current dropdown shows 50+ nested items (locations + all containers), making it overwhelming to select a parent, especially when exact name not remembered.

**Solution:** Modal with progressive step-by-step breadcrumb navigation that narrows options at each step.

**How It Works:**

1. **Step 1: Select Location**
   - Lists all locations
   - User selects one or continues to nested containers

2. **Step 2+: Select Container (within location)**
   - Shows containers available in that location
   - User can:
     - Select a container as final parent
     - Drill deeper into container's children
     - Go back to previous step

3. **Breadcrumb Navigation**
   - Shows current path: `Bedroom > Closet > Shelf 1`
   - Click to go back to any level
   - Visual hierarchy shows where you are

**Current Parent Pre-Selection:**
- When editing existing entity, modal opens with current parent already selected
- User can confirm or change selection

**UI in EntityForm:**
```
Parent Selection:
┌──────────────────────────────┐
│ Bedroom > Closet > Shelf 1   │  [🔄 Change]
└──────────────────────────────┘
```

**Benefits:**
- ✅ Only relevant options at each step
- ✅ Browse visually without remembering exact names
- ✅ Works with deeply nested containers (5+ levels)
- ✅ Mobile-friendly (full-screen modal)
- ✅ Scales with large inventories (100+ containers)
- ✅ Pre-selects current parent for fast editing

---

## Version History

| Version | Status | Key Features |
|---------|--------|--------------|
| v1.0 | Released | Basic inventory: locations, containers, items |
| v1.1 | Released | Photos, search, export/import, PWA |
| v2.0 | Planned | Entity consolidation, disposal tracking, counting |
| v2.1 | Planned | Entity text export, improved parent picker |

