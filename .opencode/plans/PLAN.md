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
- `Location` (with 8-char Crockford Base32 `id` as primary key)
- `Container` (with 8-char Crockford Base32 `id` as primary key)
- `Item` (with 8-char Crockford Base32 `id` as primary key)
- Union type `Entity = Location | Container | Item`
- Input types for create/update operations (`CreateLocationInput`, etc.)
- `BreadcrumbItem` for navigation

### 2.2 Initialize IndexedDB

Create `src/db/index.ts`:
- Database name: `inventori`
- Version: `5`
- Object stores: `locations`, `containers`, `items`
- Indexes:
  - `by-parent` on `parentId` for containers and items

### 2.3 Implement CRUD Operations

Create database operation modules:

**`src/db/locations.ts`:**
- `getAllLocations(): Promise<Location[]>`
- `getLocation(id: string): Promise<Location | undefined>`
- `createLocation(input: CreateLocationInput): Promise<Location>` (auto-generates ID)
- `updateLocation(id: string, updates: UpdateLocationInput): Promise<Location>`
- `deleteLocation(id: string): Promise<void>` (cascade delete children)

**`src/db/containers.ts`:**
- `getAllContainers(): Promise<Container[]>`
- `getContainer(id: string): Promise<Container | undefined>`
- `getContainersByParent(parentId: string): Promise<Container[]>`
- `createContainer(input: CreateContainerInput): Promise<Container>` (auto-generates ID)
- `updateContainer(id: string, updates: UpdateContainerInput): Promise<Container>`
- `deleteContainer(id: string): Promise<void>` (cascade delete children)

**`src/db/items.ts`:**
- `getAllItems(): Promise<Item[]>`
- `getItem(id: string): Promise<Item | undefined>`
- `getItemsByParent(parentId: string): Promise<Item[]>`
- `getUnassignedItems(): Promise<Item[]>`
- `createItem(input: CreateItemInput): Promise<Item>` (auto-generates ID)
- `updateItem(id: string, updates: UpdateItemInput): Promise<Item>`
- `deleteItem(id: string): Promise<void>` (cascade delete children if isContainer)

### 2.4 Create Utility Functions

**`src/utils/shortId.ts`:**
- `generateId(): string` - Generate 8-char Crockford Base32 ID
- `generateUniqueId(isCollision): Promise<string>` - Generate with collision checking
- `formatShortId(id: string): string` - Format as `XXXX-XXXX`
- `normalizeShortId(input: string): string | null` - Normalize user input
- `looksLikeShortId(query: string): boolean` - Check if input looks like an ID

**Deliverables:**
- [x] TypeScript interfaces defined (with Crockford Base32 ID as primary key)
- [x] IndexedDB initialized with schema (v5)
- [x] CRUD operations for all entity types (with auto-generated ID)
- [x] Cascade delete implemented for locations and containers
- [x] ID utility created (Crockford Base32)

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
- Fetch items (all, by parent, unassigned)
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

**`src/components/IdDisplay.tsx`:**
- Displays formatted ID (XXXX-XXXX)
- Copy to clipboard button
- Used in entity view pages

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
- Fields: name, description, isContainer toggle
- Parent selector (optional - location, container, or item-container)
- Photo capture for item photos
- Quantity field

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
- [x] IdDisplay component for IDs
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
- Location details (name, description, photo, ID)
- List of containers and items in this location
- "Add Container" and "Add Item" buttons
- Edit and Delete actions

**`src/pages/ContainerView.tsx`:**
- Breadcrumbs showing full path
- Container details (with ID)
- List of child containers and items
- "Add Container" and "Add Item" buttons
- Edit and Delete actions

**`src/pages/ItemView.tsx`:**
- Breadcrumbs showing full path
- Item details (name, description, quantity, ID)
- Photo gallery
- If isContainer, list child items
- Edit and Delete actions

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
- ID exact match search (when input looks like an ID)
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

## Phase 7: Data Export/Import

### 7.1 Export Utility

**`src/utils/export.ts`:**
- `exportData(): Promise<Blob>` - Export all data as ZIP file
- Include all locations, containers, items (with ID fields)
- Store photos as separate files (not embedded base64)
- Return ZIP blob

Implemented with:
- ZIP archive format using JSZip library
- Structure: `data.json` + `images/` folder
- Images stored uncompressed (STORE mode) for speed
- Metadata: `version` (1.1) and `exportedAt` timestamp
- All dates converted to ISO strings
- ID fields included in export
- Helper function `downloadExport()` to trigger browser download
- Helper function `generateExportFilename()` for consistent naming

Export format (v1.1):
```
inventori-backup-YYYY-MM-DD.zip
├── data.json
└── images/
    ├── location-{id}-{index}.{ext}
    ├── container-{id}-{index}.{ext}
    └── item-{id}-{index}.{ext}
```

data.json structure:
```json
{
  "version": "1.1",
  "exportedAt": "2026-02-01T12:00:00.000Z",
  "locations": [{ "id": "ABCD1234", "photos": ["location-ABCD1234-0.jpg"], ... }],
  "containers": [...],
  "items": [...]
}
```

### 7.2 Import Utility

**`src/utils/import.ts`:**
- `importData(file: File): Promise<ImportResult>` - Import data from ZIP
- `previewImport(file: File)` - Preview import file without importing
- `isZipFile(file)` - File type detection

Implemented with:
- Merge by ID strategy: existing items updated, new items added
- Only supports v1.1 ZIP format (no backward compatibility)
- Extracts images from ZIP and converts filenames back to Blobs
- ISO date strings converted back to Date objects
- Validation of export format and version compatibility
- `ImportResult` includes:
  - `warnings`: Array of non-fatal issues (e.g., missing images)
  - `errors`: Array of fatal issues
  - Counts of added/updated items per entity type

### 7.3 Export/Import UI

Accessible from hamburger menu in header:
- **Export Data**: Downloads ZIP backup file
- **Import Data**: Opens file picker (accepts .zip), shows confirmation dialog

Implemented with:
- `src/components/HamburgerMenu.tsx` - Dropdown menu with:
  - Export Data option (with loading spinner)
  - Import Data option (with file picker and confirmation)
  - Install App option (shows when PWA is installable)
- `src/components/ConfirmDialog.tsx` - Reusable confirmation dialog
- Import confirmation shows file details (version, date, counts) before importing
- Displays warnings for missing images after import
- Page reloads after successful import to reflect changes

**Deliverables:**
- [x] Export function implemented (ZIP with separate images, includes ID)
- [x] Import function implemented (merge by ID)
- [x] Download trigger in UI (hamburger menu)
- [x] Import trigger in UI with confirmation dialog

---

## Phase 8: Polish and Testing

### 8.1 UI Polish

- [x] Loading states (spinners/skeletons)
- [x] Empty states with helpful messages
- [x] Error states with retry options
- [x] Confirm dialogs for delete actions
- [x] Toast notifications for success/error

### 8.2 Responsive Design

- [x] Test on mobile (375px)
- [x] Test on tablet (768px)
- [x] Test on desktop (1024px+)
- [x] Ensure touch targets are 44x44px minimum

### 8.3 Accessibility

- [x] Semantic HTML elements
- [x] ARIA labels where needed
- [x] Keyboard navigation
- [x] Focus management on route changes
- [x] Focus trap in ConfirmDialog
- [x] Error announcements with `role="alert"`
- [x] Form field error associations with `aria-describedby`
- [x] Form field invalid states with `aria-invalid`
- [x] Screen reader only text for visual indicators (e.g., required asterisks)
- [x] Breadcrumbs separator icons marked with `aria-hidden`
- [x] ID display button with accessible labels

### 8.4 Testing

- [x] Manual testing of all CRUD operations
- [x] Test offline functionality
- [x] Test on multiple browsers (Chrome, Firefox, Safari)
- [x] Test PWA installation

**Deliverables:**
- [x] All loading/empty/error states
- [x] Responsive on all device sizes
- [x] Accessible to keyboard and screen readers
- [x] Cross-browser tested

---

## Phase 9: Data Model Consolidation

### 9.1 Separate Location and Item Types with Rich Item Tracking

Refactor to separate `Location` (simple organizational) and `Item` (rich tracking) types:

**`src/types/index.ts`:**
- Define `ItemContainerStatus` enum (16 values: IN_USE, STORED, PACKED, LENT, IN_REPAIR, CONSIGNED, TO_SELL, TO_DONATE, TO_REPAIR, SOLD, DONATED, GIFTED, STOLEN, LOST, DISPOSED, RECYCLED)
- Define `Location` interface (simple):
  - `id`, `name`, `description`, `parentId` (optional, can parent other locations), `photos`, `createdAt`, `updatedAt`
  - No `type` field (separate entity type from Item)
- Define `Item` interface (rich tracking):
  - `id`, `name`, `description`
  - `parentId` (required), `parentType: 'location' | 'item'` (tells which store to query)
  - `canHoldItems: boolean` (can this item hold other items?)
  - `quantity: number` (default: 1)
  - `status: ItemContainerStatus` (default: 'IN_USE')
  - `includeInTotal: boolean` (include in inventory totals? default: true)
  - `tags: string[]` (categories, default: [])
  - `purchasePrice?: number`, `currentValue?: number`, `dateAcquired?: Date`, `dateDisposed?: Date` (optional financial tracking)
  - `photos`, `createdAt`, `updatedAt`
- Add `CreateLocationInput`, `UpdateLocationInput`, `CreateItemInput`, `UpdateItemInput`
- Keep `BreadcrumbItem` interface
- Remove: old Container/Entity types, old input types, ParentType union

### 9.2 Update Database Schema to v6

**`src/db/index.ts`:**
- Bump schema version to 6
- Keep two separate stores (separate, not consolidated):
  - `locations`: Location entities, key `id`, no indexes
  - `items`: Item entities, key `id`, index `by-parent` on `parentId`
- No automatic data migration needed (fresh schema v6)

**`src/db/locations.ts` (UPDATED):**
- Update function signatures to use new `Location` type
- Functions:
  - `getLocation(id: string): Promise<Location | undefined>`
  - `getAllLocations(): Promise<Location[]>`
  - `getLocationsByParent(parentId: string): Promise<Location[]>`
  - `createLocation(input: CreateLocationInput): Promise<Location>`
  - `updateLocation(id: string, updates: UpdateLocationInput): Promise<Location>`
  - `deleteLocation(id: string, deleteChildren?: boolean): Promise<void>` - Soft cascade: orphan child locations, delete child items
- Add parent validation (parent location must exist)
- Only update `updatedAt` if content actually changed

**`src/db/items.ts` (UPDATED):**
- Consolidated Item CRUD operations
- Functions:
  - `getItem(id: string): Promise<Item | undefined>`
  - `getAllItems(): Promise<Item[]>`
  - `getItemsByParent(parentId: string, parentType: 'location' | 'item'): Promise<Item[]>`
  - `getDisposalItems(): Promise<Item[]>` - Items with disposal-related statuses
  - `createItem(input: CreateItemInput): Promise<Item>` - Apply defaults, validate parent exists
  - `updateItem(id: string, updates: UpdateItemInput): Promise<Item>` - Validate, only update timestamp if changed
  - `deleteItem(id: string, deleteChildren?: boolean): Promise<void>` - Soft cascade: delete children (items can't be orphaned)
- Validate parentId and parentType on create/update
- Validate parent exists in correct store (Location or Item)
- If parentType='item', validate parent has `canHoldItems: true`
- No circular hierarchies

**Delete:**
- `src/db/containers.ts` (merge functionality into items.ts)

### 9.3 Update React Hooks

**`src/hooks/useEntities.ts` (NEW):**
- Consolidated from `useContainers.ts` and `useItems.ts`
- Options: `parentId`, `unassignedOnly`, `excludeDisposal`, `countableOnly`

**`src/hooks/useDescendantCount.ts` (NEW - KEY FEATURE):**
- In-memory cache with React `useMemo` for recursive counting
- Respects `isCountable` and `markedForDisposal` flags
- Respects `quantity` field for entity counting
- Cache invalidation on entity CRUD operations
- Used on Home, LocationView, and EntityView pages

**Update: `src/hooks/useChildren.ts`**
- Now calls `getEntitiesByParent()` instead of separate container/item calls

**Update: `src/hooks/useAncestors.ts`**
- Support traversing with `parentType: 'entity'`

**Delete:**
- `src/hooks/useContainers.ts`
- `src/hooks/useItems.ts`

### 9.4 Update Components

**`src/components/EntityForm.tsx` (NEW - MERGED):**
- Consolidated from `LocationForm.tsx`, `ContainerForm.tsx`, `ItemForm.tsx`
- Fields:
  - Name (required)
  - Description (optional)
  - Can hold items toggle (shows/hides quantity field)
  - Parent selector (locations + entities)
  - **NEW:** Marked for disposal checkbox
  - **NEW:** Count in totals checkbox
  - Photos
- Logic:
  - If `canHoldItems: true` → hide quantity, force to 1
  - If `canHoldItems: false` → show quantity field
  - Defaults: `markedForDisposal: false`, `isCountable: true`

**Update: `src/components/EntityCard.tsx`**
- Add visual indicators:
  - If `markedForDisposal: true` → strikethrough + 🗑️ badge
  - Show child count badge if `canHoldItems: true`

**Update: `src/components/HamburgerMenu.tsx`**
- Add links to new pages:
  - 🗑️ Disposal Items
  - 📭 Unassigned Items

**Delete:**
- `src/components/ContainerForm.tsx`
- `src/components/ItemForm.tsx`

### 9.5 Create Unified Entity Pages

**`src/pages/EntityView.tsx` (NEW - MERGED):**
- Merged from `ContainerView.tsx` and `ItemView.tsx`
- Shows entity details (name, description, ID, photos)
- Status indicators (marked for disposal, countable flag)
- If `canHoldItems: true`:
  - List child entities
  - Display total descendants count in header
  - Example: "Red Toolbox (12 items inside)"
- Edit/Delete actions
- Route: `/entity/:id`

**`src/pages/AddEntity.tsx` (NEW - MERGED):**
- Use EntityForm
- Support query params: `?parentId=X&parentType=location|entity`
- Redirect to `/entity/:id` on success
- Route: `/add/entity`

**`src/pages/EditEntity.tsx` (NEW - MERGED):**
- Fetch entity by ID
- Use EntityForm with pre-filled values
- Update on submit
- Route: `/edit/entity/:id`

**`src/pages/DisposalItems.tsx` (NEW - UTILITY PAGE):**
- List all entities with `markedForDisposal: true`
- Show total count at top: "🗑️ Items for Disposal (12)"
- Each item shows:
  - Name
  - Full path (breadcrumb: Garage > Metal Shelf > Red Toolbox)
  - Quantity
  - Photo thumbnail
- Actions:
  - [View] → navigate to entity view
  - [Restore] → toggle `markedForDisposal: false`
- Route: `/disposal`

**`src/pages/UnassignedItems.tsx` (NEW - UTILITY PAGE):**
- List all entities with no `parentId` (unassigned)
- Show total count: "📭 Unassigned Items (7)"
- Display as grid/cards with:
  - Name
  - Photo thumbnail
  - Quantity
  - Type indicator (item vs container)
- Click item → navigate to EntityView
- In EntityView, user can edit and assign a parent
- Route: `/unassigned`

### 9.6 Update Counting Throughout App

**`src/pages/Home.tsx`:**
- Display global counts:
  - "Total items: 245" (excludes disposal)
  - "(Including disposal: 257)" (includes disposal items)
- Per-location cards show: "📍 Living Room (45 items)"
- Quick access buttons/links:
  - [🗑️ Disposal Items] → `/disposal`
  - [📭 Unassigned Items] → `/unassigned`
- Uses `useDescendantCount()` hook for all counts

**`src/pages/LocationView.tsx`:**
- Header shows: "Garage" with subtitle "45 items inside"
- Uses `useDescendantCount({ parentId: locationId })`

**`src/pages/EntityView.tsx`:**
- If `canHoldItems: true` → show "12 items inside"
- Uses `useDescendantCount({ parentId: entityId })`

**`src/pages/Search.tsx`:**
- Search across locations + entities
- Results show with counts where applicable

### 9.7 Update Routing

**`src/App.tsx`:**
- Add new routes:
  ```typescript
  {
    path: '/entity/:id',
    element: <EntityView />,
  },
  {
    path: '/add/entity',
    element: <AddEntity />,
  },
  {
    path: '/edit/entity/:id',
    element: <EditEntity />,
  },
  {
    path: '/disposal',
    element: <DisposalItems />,
  },
  {
    path: '/unassigned',
    element: <UnassignedItems />,
  },
  ```
- Remove old routes:
  - `/container/:id`, `/item/:id`
  - `/add/container`, `/add/item`
  - `/edit/container/:id`, `/edit/item/:id`

### 9.8 Update Export/Import

**`src/utils/export.ts`:**
- Bump version to 2.0
- Export format includes new flags: `markedForDisposal`, `isCountable`
- Combined entities array instead of separate containers/items
- Image naming: `{id}-{index}.jpg` (no type prefix)

**`src/utils/import.ts`:**
- Handle v2.0 format with new flags
- Merge by ID strategy (unchanged)

### 9.9 Create v1.1 → v2.0 Conversion Script

**`scripts/convert-backup.ts` (NEW):**
- Standalone Node.js/TypeScript script
- Reads v1.1 ZIP export (old format with containers/items)
- Converts to v2.0 format (unified entities)
- Conversion logic:
  - Old containers → Entity with `canHoldItems: true, quantity: 1, markedForDisposal: false, isCountable: true`
  - Old items → Entity with `canHoldItems: <original>, quantity: <original>, markedForDisposal: false, isCountable: true`
  - Force `quantity: 1` if `canHoldItems: true`
  - Image files: rename from `container-{id}-{index}.jpg`, `item-{id}-{index}.jpg` → `{id}-{index}.jpg`
  - All IDs preserved
  - All timestamps preserved
- Outputs new ZIP with v2.0 structure
- Usage: `pnpm convert-backup old-backup.zip new-backup-v2.zip`

**Package additions:**
```json
{
  "devDependencies": {
    "jszip": "^3.10.1"
  },
  "scripts": {
    "convert-backup": "ts-node scripts/convert-backup.ts"
  }
}
```

**Deliverables:**
- [ ] Entity type consolidation complete
- [ ] Database schema v6
- [ ] In-memory caching for counts
- [ ] Two new utility pages (Disposal, Unassigned)
- [ ] Entity counts displayed throughout app
- [ ] v1.1 → v2.0 conversion script working
- [ ] Export/import v2.0 format
- [ ] All routes updated to /entity
- [ ] Manual testing complete

---

## Phase 10: Post-v2.0 Enhancements

These are improvements after v2.0 release, focusing on user convenience features.

### 10.1 Entity Text Export Feature

**Problem:** Users want to share entity information (for selling, AI assistance, etc.) without manually typing details.

**Solution:** Add copy-to-clipboard and download options for entity text + photos.

**Files to Create:**
- `src/utils/entityTextFormatter.ts` - Format entity as minimal text
- `src/utils/photoZipDownloader.ts` - Create ZIP with text + photos

**Files to Modify:**
- `src/pages/EntityView.tsx` - Add two action buttons

**Text Format (Minimal):**
```
Name: {name}
Quantity: {quantity}
Description: {description}
```

**Copy Options:**

**Option 1: Copy as Text** `[📋 Copy Text]`
- Copy formatted text to clipboard
- Toast: "✅ Copied to clipboard"
- Use case: Paste into AI chat, notes, email

**Option 2: Download ZIP** `[📥 Download ZIP]`
- Create ZIP file containing:
  - `entity.txt` - Formatted entity text
  - `images/` folder - All entity photos
- Filename: `entity-{sanitized-name}-{id}.zip`
- Toast: "✅ Downloaded entity-{name}-{id}.zip"
- Use case: Marketplace listing, complete sharing package

**Implementation Tasks:**
1. Create `entityTextFormatter.ts` with `formatEntityAsText(entity): string` function
2. Create `photoZipDownloader.ts` with `downloadEntityAsZip(entity, textContent)` function
3. Add two buttons to EntityView action area
4. Wire up click handlers
5. Show toast notifications for feedback
6. Test with various entity types and photo counts

**Testing:**
- [x] Text format correct (Name, Quantity, Description only)
- [x] Copy to clipboard works on all browsers
- [x] Download ZIP contains text file + all photos
- [x] Works with 0, 1, and multiple photos
- [x] Handles special characters in entity names
- [x] Toast notifications appear correctly

**Dependencies:**
- JSZip library (for ZIP creation)
- Browser Clipboard API (native)
- Browser File Download API (native)

**Deliverables:**
- [x] Copy text button functional
- [x] Download ZIP button functional
- [x] Text format minimal and clean
- [x] Photos included in ZIP export

---

### 10.2 Step-by-Step Parent Picker

**Problem:** When editing an entity's parent, the dropdown shows 50+ nested items (locations + all containers + nested containers), making it overwhelming to find the right parent, especially if you don't remember the exact name.

**Solution:** Replace dropdown with modal dialog containing a step-by-step breadcrumb-based picker that progressively narrows options.

**Files to Create:**
- `src/components/ParentPickerModal.tsx` - Modal with step-by-step picker
- `src/hooks/useParentPicker.ts` - Logic for navigation and hierarchy traversal

**Files to Modify:**
- `src/components/EntityForm.tsx` - Replace dropdown with [Change] button
- `src/pages/EditEntity.tsx` - Pass current entity to form

**How It Works:**

**Step 1: Select Location**
```
Where do you want to store this item?

📍 Bedroom
📍 Kitchen
📍 Living Room
📍 Garage
```
User clicks a location → advances to Step 2

**Step 2+: Select Container (within location)**
```
Bedroom › Select container

Options in Bedroom:
📦 Closet
📦 Dresser
📦 Under Bed Storage
🏠 Store directly in Bedroom
```
User clicks a container → advances to Step 3 (if container has children) or confirms

**Step 3+ (Optional nested containers):**
```
Bedroom › Closet › Select sub-container

Options in Closet:
📦 Shelf 1
📦 Shelf 2
📦 Hanging Rod
🏠 Store directly in Closet
```
User can continue deeper or select current level

**Breadcrumb Navigation:**
- Shows current path: `Bedroom > Closet > Shelf 1`
- Click breadcrumb item to go back to that level
- Back button to return to previous step
- Cancel button to close without changing

**Current Parent Pre-Selection:**
- When editing existing entity, modal shows current parent path in breadcrumb
- Current parent is pre-selected/highlighted
- User can confirm or change selection

**UI in EntityForm:**
```
Parent Selection:
┌──────────────────────────────┐
│ Bedroom > Closet > Shelf 1   │  [🔄 Change]
└──────────────────────────────┘
```

When user clicks `[🔄 Change]` → Modal opens with step-by-step picker

**Implementation Tasks:**
1. Create `ParentPickerModal.tsx` component:
   - Breadcrumb showing current path
   - List of available options at current step
   - Back button and breadcrumb navigation
   - Select button to confirm choice
2. Create `useParentPicker.ts` hook:
   - Track current navigation step (location → containers → nested containers)
   - Fetch items available at each step
   - Handle back/forward navigation
   - Return selected parent (parentId + parentType)
3. Update `EntityForm.tsx`:
   - Replace parent dropdown with modal trigger button
   - Display selected parent path
   - Handle modal confirm
4. Test with deeply nested container hierarchies (5+ levels)

**Benefits:**
- ✅ Only relevant options shown at each step (progressively narrow)
- ✅ Visual hierarchy through breadcrumb (easy to understand where you are)
- ✅ Browse visually without needing to remember exact names
- ✅ Mobile-friendly (modal takes full screen)
- ✅ Scales well with large inventories (100+ containers)
- ✅ Pre-selects current parent to speed up editing

**Testing:**
- [x] Modal opens when clicking [Change] button
- [x] Step 1 displays all locations
- [x] Selecting location → Step 2 (shows containers in that location)
- [x] Can navigate back via Back button
- [x] Can navigate back via breadcrumb clicks
- [x] Breadcrumb shows correct path
- [x] Current parent pre-selected when editing
- [x] Can select container at any nesting depth
- [x] "Store directly in [Parent]" option works
- [x] Modal closes and form updates on selection
- [x] Cancel closes modal without changes
- [x] Works with deeply nested containers (5+ levels)
- [x] Mobile-friendly interface
- [x] Performance acceptable with many containers

**Deliverables:**
- [x] Modal component functional
- [x] Step-by-step navigation works
- [x] Breadcrumb navigation implemented
- [x] Current parent pre-selected
- [x] Form integration complete

---

## Phase 10 Summary

| Feature | Files Created | Files Modified | Time Estimate |
|---------|--------------|-----------------|---------------|
| 10.1: Text Export | 2 | 1 | 1.5-2 hours |
| 10.2: Parent Picker | 2 | 2 | 2-2.5 hours |
| **Total** | 4 | 3 | 3.5-4.5 hours |

---

## Summary Checklist

- [x] **Phase 1:** Project setup (Vite, Tailwind, PWA config)
- [x] **Phase 2:** Types and database layer (IndexedDB, CRUD)
- [x] **Phase 3:** React hooks (data fetching, navigation)
- [x] **Phase 4:** Core components (Layout, Cards, Forms, Photos, Search)
- [x] **Phase 5:** Pages and routing (all views, search)
- [x] **Phase 6:** PWA features (offline, installable)
- [x] **Phase 7:** Data export (JSON backup)
- [x] **Phase 8:** Polish and testing
- [ ] **Phase 9:** Data model consolidation (Entity merging, counting, utilities)
- [ ] **Phase 10:** Post-v2.0 enhancements (Text export, parent picker)

## Notes for Implementers

1. **Photo Storage:** Photos are stored as Blobs directly in IndexedDB. Consider size limits and potentially compressing images before storage.

2. **Cascade Deletes:** When deleting a location or entity, all child entities must also be deleted. Implement recursively.

3. **IDs:** Use 8-character Crockford Base32 IDs as primary keys. These provide high entropy (~1 trillion combinations) for future sync compatibility and can be used on physical labels.

4. **ID Format:** Crockford Base32 alphabet excludes I, L, O, U to avoid confusion. The `shortId.ts` utility handles generation, formatting (XXXX-XXXX), and normalization.

5. **Timestamps:** Always set `createdAt` on creation and update `updatedAt` on every modification.

6. **Parent References:** When moving entities, update both `parentId` and `parentType`.

7. **Search:** For v1, a simple in-memory filter is sufficient. ID search uses exact match. For larger inventories, consider IndexedDB full-text search or a search index.

8. **Entity Consolidation:** Container and Item are now unified as Entity. The three boolean flags control behavior:
   - `canHoldItems` - Whether this entity can contain other entities
   - `markedForDisposal` - Indicates item is for sale/donation/disposal
   - `isCountable` - Whether to include in inventory totals (excludes built-in structures)

9. **Counting Strategy:** Uses in-memory cache with React `useMemo`:
   - Cache keyed by `parentId` + `excludeDisposal` flag
   - Recursive counting for nested entities
   - Automatic invalidation on entity changes
   - Respects both `isCountable` and `markedForDisposal` flags in calculations

10. **v1.1 to v2.0 Migration:** Old exports (with separate containers/items stores) can be converted using the standalone Node.js script. Users run conversion locally, then import new v2.0 format into app.
