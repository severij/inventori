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
| Routing | React Router |

## Data Model

### Location

A top-level place where items and containers are stored (room, building, storage unit, etc.).

```typescript
interface Location {
  id: string;              // UUID (QR code value in v2)
  type: 'location';
  name: string;            // e.g., "Living Room", "Garage", "Storage Unit #5"
  description?: string;
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Container

A storage unit that can hold items or other containers. Can be nested infinitely within locations or other containers.

```typescript
interface Container {
  id: string;              // UUID (QR code value in v2)
  type: 'container';
  name: string;            // e.g., "Blue plastic bin", "Top drawer"
  description?: string;
  parentId: string;        // Location ID or Container ID
  parentType: 'location' | 'container';
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Item

An individual inventory item.

```typescript
interface Item {
  id: string;              // UUID (QR code value in v2)
  type: 'item';
  name: string;
  description?: string;
  
  // Hierarchy (optional - items can be unassigned)
  parentId?: string;
  parentType?: 'location' | 'container';
  
  // Item-specific fields
  category?: string;       // e.g., "Electronics", "Tools", "Kitchen"
  quantity: number;        // Default: 1
  brand?: string;
  manualUrl?: string;      // Link to product manual/documentation
  photos: Blob[];
  
  // Purchase info
  purchaseDate?: Date;
  purchasePrice?: number;
  purchaseStore?: string;
  receiptPhoto?: Blob;
  
  // Lifecycle
  disposalDate?: Date;     // Soft delete - when item was sold/donated/trashed
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Hierarchy Example

```
Garage (location)
  Metal Shelf Unit (container)
    Red Toolbox (container)
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

2. **Container Management**
   - Create, view, edit, delete containers
   - Nest containers within locations or other containers (infinite depth)
   - View all contents (child containers and items)
   - Photo attachments

3. **Item Management**
   - Create, view, edit, delete items
   - All data fields as defined in the data model
   - Items can be unassigned (no parent) or assigned to a location/container
   - Photo attachments (multiple photos per item)
   - Receipt photo attachment

4. **Navigation & Organization**
   - Home page showing all locations
   - Drill-down navigation into locations and containers
   - Breadcrumb navigation showing current path
   - Category-based filtering for items

5. **Search**
   - Global search across all items, containers, and locations
   - Search by name, description, category, brand

6. **Photo Capture**
   - Camera integration for taking photos
   - File upload for existing photos
   - Photo preview and deletion

7. **Data Management**
   - JSON export/backup of all data

#### PWA Features

1. **Offline-First**
   - Full functionality without internet connection
   - Service worker caching for app shell and assets

2. **Installable**
   - Web app manifest
   - "Add to Home Screen" support
   - App icons (192x192, 512x512)
   - Splash screen

3. **Offline Indicator**
   - Visual indicator when offline

### v2 (Deferred)

1. **QR Code Generation**
   - Generate printable QR codes for locations, containers, and items
   - QR code contains entity UUID
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

### Object Stores

| Store | Key Path | Indexes |
|-------|----------|---------|
| `locations` | `id` | - |
| `containers` | `id` | `parentId` |
| `items` | `id` | `parentId`, `category` |

## Project Structure

```
inventori/
├── public/                       # Static assets
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # App shell with navigation
│   │   ├── SearchBar.tsx       # Search input component
│   │   ├── PhotoCapture.tsx    # Camera/upload component
│   │   ├── EntityCard.tsx      # Card for displaying location/container/item
│   │   ├── Breadcrumbs.tsx     # Navigation breadcrumbs
│   │   ├── LocationForm.tsx    # Form for creating/editing locations
│   │   ├── ContainerForm.tsx   # Form for creating/editing containers
│   │   ├── ItemForm.tsx        # Form for creating/editing items
│   │   └── OfflineIndicator.tsx
│   ├── db/
│   │   ├── index.ts            # DB initialization and schema
│   │   ├── locations.ts        # Location CRUD operations
│   │   ├── containers.ts       # Container CRUD operations
│   │   └── items.ts            # Item CRUD operations
│   ├── hooks/
│   │   ├── useLocations.ts     # Location data hook
│   │   ├── useContainers.ts    # Container data hook
│   │   ├── useItems.ts         # Item data hook
│   │   ├── useChildren.ts      # Get children of a parent
│   │   ├── useAncestors.ts     # Get breadcrumb path
│   │   └── useOffline.ts       # Offline status hook
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
│   │   └── Search.tsx          # Global search page
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── utils/
│   │   ├── uuid.ts             # UUID generation
│   │   └── export.ts           # JSON export functionality
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
