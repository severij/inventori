# Inventori - Implementation Plan

This document provides a step-by-step implementation plan for the Inventori home inventory PWA. Each phase builds upon the previous one. See `REQUIREMENTS.md` for full requirements and data model documentation.

## Prerequisites

- Node.js 18+ (installed via nvm)
- pnpm

To load Node.js/pnpm in your terminal, add this to `~/.bashrc`:
```bash
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## Phase 1: Project Setup

### 1.1 Initialize Vite Project

```bash
pnpm create vite@latest . --template react-ts
pnpm install
```

### 1.2 Install Dependencies

```bash
# Core dependencies
pnpm add react-router-dom idb

# Dev dependencies
pnpm add -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

### 1.3 Configure Tailwind CSS

1. Add `@tailwindcss/vite` plugin to `vite.config.ts`
2. Add Tailwind import to `src/index.css`: `@import "tailwindcss";`

### 1.4 Configure PWA

1. Add `vite-plugin-pwa` to `vite.config.ts`
2. Configure service worker and manifest options
3. Use placeholder icons (online URLs) until production icons are created

### 1.5 Setup Project Structure

Create the directory structure:
```
src/
├── components/
├── db/
├── hooks/
├── pages/
├── types/
└── utils/
```

**Deliverables:**
- [x] Vite + React + TypeScript running
- [x] Tailwind CSS configured
- [x] PWA plugin configured with manifest
- [x] Directory structure created

---

## Phase 2: Types and Database Layer

### 2.1 Define TypeScript Types

Create `src/types/index.ts` with interfaces:
- `Location`
- `Container`
- `Item`
- Union type `Entity = Location | Container | Item`
- Input types for create/update operations (`CreateLocationInput`, etc.)
- `BreadcrumbItem` for navigation

### 2.2 Initialize IndexedDB

Create `src/db/index.ts`:
- Database name: `inventori`
- Version: `1`
- Object stores: `locations`, `containers`, `items`
- Indexes on `parentId` for containers and items
- Index on `category` for items

### 2.3 Implement CRUD Operations

Create database operation modules:

**`src/db/locations.ts`:**
- `getAllLocations(): Promise<Location[]>`
- `getLocation(id: string): Promise<Location | undefined>`
- `createLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location>`
- `updateLocation(id: string, updates: Partial<Location>): Promise<Location>`
- `deleteLocation(id: string): Promise<void>` (cascade delete children)

**`src/db/containers.ts`:**
- `getAllContainers(): Promise<Container[]>`
- `getContainer(id: string): Promise<Container | undefined>`
- `getContainersByParent(parentId: string): Promise<Container[]>`
- `createContainer(container: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>): Promise<Container>`
- `updateContainer(id: string, updates: Partial<Container>): Promise<Container>`
- `deleteContainer(id: string): Promise<void>` (cascade delete children)

**`src/db/items.ts`:**
- `getAllItems(): Promise<Item[]>`
- `getItem(id: string): Promise<Item | undefined>`
- `getItemsByParent(parentId: string): Promise<Item[]>`
- `getItemsByCategory(category: string): Promise<Item[]>`
- `getUnassignedItems(): Promise<Item[]>`
- `createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item>`
- `updateItem(id: string, updates: Partial<Item>): Promise<Item>`
- `deleteItem(id: string): Promise<void>`

### 2.4 Create UUID Utility

Create `src/utils/uuid.ts`:
- Use `crypto.randomUUID()` for generating UUIDs

**Deliverables:**
- [x] TypeScript interfaces defined
- [x] IndexedDB initialized with schema
- [x] CRUD operations for all entity types
- [x] Cascade delete implemented for locations and containers
- [x] UUID utility created

---

## Phase 3: React Hooks

### 3.1 Entity Hooks

**`src/hooks/useLocations.ts`:**
- Fetch all locations
- Loading and error states
- Refetch function

**`src/hooks/useContainers.ts`:**
- Fetch containers (all or by parent)
- Loading and error states

**`src/hooks/useItems.ts`:**
- Fetch items (all, by parent, by category, unassigned)
- Loading and error states

### 3.2 Navigation Hooks

**`src/hooks/useChildren.ts`:**
- Given a parent ID and type, fetch all direct children (containers + items)
- Used for displaying contents of a location or container

**`src/hooks/useAncestors.ts`:**
- Given an entity ID, traverse up the hierarchy to build breadcrumb path
- Returns array of `{ id, name, type }` from root to current

### 3.3 Utility Hooks

**`src/hooks/useOffline.ts`:**
- Track online/offline status using `navigator.onLine`
- Listen to `online`/`offline` events

**Deliverables:**
- [x] All entity hooks implemented
- [x] useChildren hook for hierarchy navigation
- [x] useAncestors hook for breadcrumbs
- [x] useOffline hook for connectivity status

---

## Phase 4: Core Components

### 4.1 Layout Component

**`src/components/Layout.tsx`:**
- App shell with header and main content area
- Navigation back button
- Search icon linking to search page
- Offline indicator integration

### 4.2 Entity Display Components

**`src/components/EntityCard.tsx`:**
- Unified card component for displaying location/container/item
- Shows: photo thumbnail (if available), name, type icon
- For items: shows quantity badge if > 1
- Click navigates to detail view

**`src/components/Breadcrumbs.tsx`:**
- Display navigation path using useAncestors
- Clickable links to each ancestor
- Current location shown but not clickable

### 4.3 Form Components

**`src/components/LocationForm.tsx`:**
- Fields: name, description
- Photo capture integration
- Submit creates/updates location

**`src/components/ContainerForm.tsx`:**
- Fields: name, description
- Parent selector (location or container)
- Photo capture integration

**`src/components/ItemForm.tsx`:**
- All item fields from data model
- Parent selector (optional - location or container)
- Photo capture for item photos
- Separate photo capture for receipt
- Date pickers for purchaseDate, disposalDate

### 4.4 Utility Components

**`src/components/PhotoCapture.tsx`:**
- Camera button (uses `getUserMedia` API)
- File upload button
- Preview of captured/selected photos
- Delete photo functionality
- Returns Blob array to parent

**`src/components/SearchBar.tsx`:**
- Text input with search icon
- Debounced input handling (150ms default for fast local queries)
- Clear button

**`src/components/SyncIndicator.tsx` (v3):**
- Shows connection status to sync server
- Deferred until P2P sync is implemented

**Deliverables:**
- [x] Layout with navigation
- [x] EntityCard for unified display
- [x] Breadcrumbs component
- [x] All form components (LocationForm, ContainerForm, ItemForm)
- [x] PhotoCapture with camera and upload
- [x] SearchBar component
- [ ] Sync status indicator (deferred to v3 with sync server)

---

## Phase 5: Pages and Routing

### 5.1 Setup React Router

**`src/App.tsx`:**
- Configure HashRouter (for compatibility with static hosting like GitHub Pages)
- Define routes (see below)
- Pages wrapped with Layout component in Phase 5.3

### 5.2 Routes

All routes configured in `src/App.tsx`. Query parameters (`?parentId=X&parentType=Y`) handled in components via `useSearchParams`.

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | List all locations |
| `/location/:id` | `LocationView` | View location contents |
| `/container/:id` | `ContainerView` | View container contents |
| `/item/:id` | `ItemView` | View item details |
| `/add/location` | `AddLocation` | Create new location |
| `/add/container` | `AddContainer` | Create new container (supports `?parentId&parentType`) |
| `/add/item` | `AddItem` | Create new item (supports `?parentId&parentType`) |
| `/edit/location/:id` | `EditLocation` | Edit location |
| `/edit/container/:id` | `EditContainer` | Edit container |
| `/edit/item/:id` | `EditItem` | Edit item |
| `/search` | `Search` | Global search |

### 5.3 Page Implementations

**`src/pages/Home.tsx`:**
- List all locations using EntityCard
- "Add Location" FAB or button
- Empty state when no locations

**`src/pages/LocationView.tsx`:**
- Breadcrumbs (just location name)
- Location details (name, description, photo)
- List of containers and items in this location
- "Add Container" and "Add Item" buttons
- Edit and Delete actions

**`src/pages/ContainerView.tsx`:**
- Breadcrumbs showing full path
- Container details
- List of child containers and items
- "Add Container" and "Add Item" buttons
- Edit and Delete actions

**`src/pages/ItemView.tsx`:**
- Breadcrumbs showing full path
- All item details displayed
- Photo gallery
- Receipt photo (if exists)
- Edit and Delete actions
- Link to manual URL (if exists)

**`src/pages/AddLocation.tsx`, `AddContainer.tsx`, `AddItem.tsx`:**
- Render respective form component
- Handle form submission (create entity)
- Navigate back on success

**`src/pages/EditLocation.tsx`, `EditContainer.tsx`, `EditItem.tsx`:**
- Fetch existing entity data
- Render form with pre-filled values
- Handle update submission
- Navigate back on success

**`src/pages/Search.tsx`:**
- SearchBar at top
- Search across all entities (locations, containers, items)
- Display results grouped by type or unified list
- Click result navigates to detail view

**Deliverables:**
- [x] React Router configured (HashRouter)
- [x] Placeholder page components created
- [x] All page components fully implemented
- [x] Navigation working between pages
- [x] CRUD operations connected to UI
- [x] Search functionality working

---

## Phase 6: PWA Features

### 6.1 Service Worker Configuration

Update `vite.config.ts` PWA settings:
- Cache app shell and static assets (globPatterns for js, css, html, fonts, images)
- Runtime caching strategy for images (CacheFirst, 30 days)
- Runtime caching for Google Fonts (CacheFirst, 1 year)
- skipWaiting and clientsClaim for immediate updates

Updated files:
- `vite.config.ts` - Enhanced workbox configuration with runtime caching
- `index.html` - Added PWA meta tags, theme-color, iOS support
- `public/icons/icon-192x192.svg` - App icon
- `public/icons/icon-512x512.svg` - Large app icon
- `public/apple-touch-icon.svg` - iOS home screen icon

### 6.2 Web Manifest

Ensure `manifest.json` includes:
- `name` and `short_name`
- `description`
- `icons` (192x192, 512x512)
- `start_url`
- `display: standalone`
- `theme_color` and `background_color`

All fields verified in generated `dist/manifest.webmanifest`.

### 6.3 Install Prompt

Added install prompt functionality:
- `src/hooks/useInstallPrompt.ts` - Hook to capture `beforeinstallprompt` event
- `src/components/InstallButton.tsx` - Button component that shows when app is installable
- Integrated into Home page

### 6.4 Create App Icons

Icons created as SVG in `public/icons/`:
- `icon-192x192.svg`
- `icon-512x512.svg`
- `apple-touch-icon.svg` for iOS

SVG format used for scalability. PNG versions can be added later if compatibility issues arise.

**Deliverables:**
- [x] Service worker caching assets
- [x] Web manifest complete
- [x] App installable on mobile devices (install prompt added)
- [x] Offline functionality (IndexedDB local-first, service worker precaching)

---

## Phase 7: Data Export

### 7.1 Export Utility

**`src/utils/export.ts`:**
- `exportData(): Promise<string>` - Export all data as JSON
- Include all locations, containers, items
- Convert Blobs to base64 for photos
- Return JSON string

Implemented with:
- Flat export format with separate arrays for locations, containers, items
- Metadata: `version` (1.0) and `exportedAt` timestamp
- All photos converted to base64 data URLs
- All dates converted to ISO strings
- Helper function `downloadExport()` to trigger browser download
- Helper function `generateExportFilename()` for consistent naming

Export format:
```json
{
  "version": "1.0",
  "exportedAt": "2026-01-31T12:00:00.000Z",
  "locations": [...],
  "containers": [...],
  "items": [...]
}
```

### 7.2 Export UI

Add "Export Data" button to settings or home page:
- Triggers download of JSON file
- Filename: `inventori-backup-{date}.json`

Implemented with:
- `src/components/ExportButton.tsx` - Button component with loading/error states
- Settings section added to Home page (`src/pages/Home.tsx`)
- Shows spinner during export
- Displays error message if export fails

**Deliverables:**
- [x] Export function implemented
- [x] Download trigger in UI
- [x] Exported JSON includes all data with photos

---

## Phase 8: Polish and Testing

### 8.1 UI Polish

- Loading states (spinners/skeletons)
- Empty states with helpful messages
- Error states with retry options
- Confirm dialogs for delete actions
- Toast notifications for success/error

### 8.2 Responsive Design

- Test on mobile (375px)
- Test on tablet (768px)
- Test on desktop (1024px+)
- Ensure touch targets are 44x44px minimum

### 8.3 Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation
- Focus management on route changes

### 8.4 Testing

- Manual testing of all CRUD operations
- Test offline functionality
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test PWA installation

**Deliverables:**
- [ ] All loading/empty/error states
- [ ] Responsive on all device sizes
- [ ] Accessible to keyboard and screen readers
- [ ] Cross-browser tested

---

## Summary Checklist

- [x] **Phase 1:** Project setup (Vite, Tailwind, PWA config)
- [x] **Phase 2:** Types and database layer (IndexedDB, CRUD)
- [x] **Phase 3:** React hooks (data fetching, navigation)
- [x] **Phase 4:** Core components (Layout, Cards, Forms, Photos, Search)
- [x] **Phase 5:** Pages and routing (all views, search)
- [x] **Phase 6:** PWA features (offline, installable)
- [x] **Phase 7:** Data export (JSON backup)
- [ ] **Phase 8:** Polish and testing

## Notes for Implementers

1. **Photo Storage:** Photos are stored as Blobs directly in IndexedDB. Consider size limits and potentially compressing images before storage.

2. **Cascade Deletes:** When deleting a location or container, all child containers and items must also be deleted. Implement recursively.

3. **UUIDs:** Always use `crypto.randomUUID()` for IDs to ensure compatibility with future QR codes and P2P sync.

4. **Timestamps:** Always set `createdAt` on creation and update `updatedAt` on every modification.

5. **Parent References:** When moving items/containers, update both `parentId` and `parentType`.

6. **Search:** For v1, a simple in-memory filter is sufficient. For larger inventories, consider IndexedDB full-text search or a search index.
