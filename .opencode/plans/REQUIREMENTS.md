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

### Location

A top-level place where items and containers are stored (room, building, storage unit, etc.).

```typescript
interface Location {
  id: string;              // UUID
  type: 'location';
  name: string;            // e.g., "Living Room", "Garage", "Storage Unit #5"
  description?: string;
  shortId?: string;        // 8-char Crockford Base32 Label ID (auto-generated)
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Container

A storage unit that can hold items or other containers. Can be nested infinitely within locations or other containers.

```typescript
interface Container {
  id: string;              // UUID
  type: 'container';
  name: string;            // e.g., "Blue plastic bin", "Top drawer"
  description?: string;
  shortId?: string;        // 8-char Crockford Base32 Label ID (auto-generated)
  parentId: string;        // Location ID or Container ID
  parentType: 'location' | 'container' | 'item';
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Item

An individual inventory item. Items can also act as containers (e.g., a toolbox that holds tools).

```typescript
interface Item {
  id: string;              // UUID
  type: 'item';
  name: string;
  description?: string;
  shortId?: string;        // 8-char Crockford Base32 Label ID (auto-generated)
  
  // Hierarchy (optional - items can be unassigned)
  parentId?: string;
  parentType?: 'location' | 'container' | 'item';  // Items can be nested in other items
  
  // Item-specific fields
  isContainer: boolean;    // If true, this item can hold other items (e.g., toolbox)
  quantity: number;        // Default: 1
  photos: Blob[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Short ID (Label ID)

All entities have an auto-generated `shortId` for use on physical labels:

- **Format**: 8 characters using Crockford Base32 alphabet (excludes I, L, O, U for readability)
- **Display**: Formatted as `XXXX-XXXX` with hyphen for readability
- **Storage**: Stored as `ABCDEFGH` (no hyphen)
- **Uniqueness**: Globally unique across all entity types (locations, containers, items)
- **Generation**: Automatically generated when entity is created
- **Search**: Can search by Label ID in the search page (exact match)

Example: `7KM3-QRST`

### Hierarchy Example

```
Garage (location)
  Metal Shelf Unit (container)
    Red Toolbox (item, isContainer=true)
      Hammer (item)
      Screwdriver Set (item)
    Blue Bin (container)
      Christmas Lights (item)
  Car Jack (item - directly in location)

Living Room (location)
  TV (item - directly in location)
  Entertainment Center (container)
    PlayStation 5 (item)
```

## Version Roadmap

### v1 (Current Scope)

#### Core Features

1. **Location Management**
   - Create, view, edit, delete locations
   - View all containers and items within a location
   - Photo attachments
   - Auto-generated Label ID for physical labels

2. **Container Management**
   - Create, view, edit, delete containers
   - Nest containers within locations or other containers (infinite depth)
   - View all contents (child containers and items)
   - Photo attachments
   - Auto-generated Label ID for physical labels

3. **Item Management**
   - Create, view, edit, delete items
   - All data fields as defined in the data model
   - Items can be unassigned (no parent) or assigned to a location/container/item
   - Items can be marked as containers (`isContainer=true`) to hold other items
   - Photo attachments (multiple photos per item)
   - Auto-generated Label ID for physical labels

4. **Navigation & Organization**
   - Home page showing all locations
   - Drill-down navigation into locations and containers
   - Breadcrumb navigation showing current path

5. **Search**
   - Global search across all items, containers, and locations
   - Search by name, description
   - Search by Label ID (exact match when input looks like a Label ID)

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
- **shortId**: Included in export, collision-checked on import
- **Structure**: Flat format with separate arrays (not nested hierarchy)

The flat format preserves relationships via `parentId` and `parentType` fields, making it easy to re-import into IndexedDB.

### Import Behavior

Import uses a **merge by ID** strategy:
- Items with matching UUIDs are **updated** with imported data
- Items with new UUIDs are **added** to the database
- Existing items not in the import file are **preserved**
- **shortId collision handling**: If imported shortId conflicts with a different entity (different UUID), the shortId is cleared and a warning is shown

This is safe because UUIDs are globally unique - items created on different devices will have different IDs and won't conflict.

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
   - QR code contains entity UUID or Label ID
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
   - All IDs are UUIDs (for future sync compatibility)
   - Timestamps on all entities for conflict resolution
   - Cascade considerations when deleting locations/containers

## IndexedDB Schema

Database version: **4**

### Object Stores

| Store | Key Path | Indexes |
|-------|----------|---------|
| `locations` | `id` | `by-shortId` (unique) |
| `containers` | `id` | `by-parent` (parentId), `by-shortId` (unique) |
| `items` | `id` | `by-parent` (parentId), `by-shortId` (unique) |

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
│   │   ├── EntityCard.tsx      # Card for displaying location/container/item
│   │   ├── Breadcrumbs.tsx     # Navigation breadcrumbs
│   │   ├── ShortIdDisplay.tsx  # Label ID display with copy button
│   │   ├── LocationForm.tsx    # Form for creating/editing locations
│   │   ├── ContainerForm.tsx   # Form for creating/editing containers
│   │   ├── ItemForm.tsx        # Form for creating/editing items
│   │   ├── InstallButton.tsx   # PWA install prompt button (standalone)
│   │   └── ExportButton.tsx    # Data export trigger button (standalone)
│   ├── db/
│   │   ├── index.ts            # DB initialization and schema (v4)
│   │   ├── locations.ts        # Location CRUD operations
│   │   ├── containers.ts       # Container CRUD operations
│   │   └── items.ts            # Item CRUD operations
│   ├── hooks/
│   │   ├── useLocations.ts     # Location data hook
│   │   ├── useContainers.ts    # Container data hook
│   │   ├── useItems.ts         # Item data hook
│   │   ├── useChildren.ts      # Get children of a parent
│   │   ├── useAncestors.ts     # Get breadcrumb path
│   │   ├── useOffline.ts       # Offline status hook
│   │   └── useInstallPrompt.ts # PWA install prompt hook
│   ├── pages/
│   │   ├── Home.tsx            # List all locations
│   │   ├── LocationView.tsx    # View location contents
│   │   ├── ContainerView.tsx   # View container contents
│   │   ├── ItemView.tsx        # View item details
│   │   ├── AddLocation.tsx
│   │   ├── AddContainer.tsx
│   │   ├── AddItem.tsx
│   │   ├── EditLocation.tsx
│   │   ├── EditContainer.tsx
│   │   ├── EditItem.tsx
│   │   └── Search.tsx          # Global search page (includes Label ID search)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── utils/
│   │   ├── uuid.ts             # UUID generation
│   │   ├── shortId.ts          # Label ID generation (Crockford Base32)
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
