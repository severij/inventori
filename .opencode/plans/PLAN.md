# Inventori - Implementation Plan

This document provides a step-by-step implementation plan for the Inventori home inventory PWA. Each phase builds upon the previous one. See `REQUIREMENTS.md` for full requirements and data model documentation, and `UI_DESIGN.md` for UI mockups.

## Prerequisites

- Node.js 18+ (installed via nvm)
- pnpm

To load Node.js/pnpm in your terminal, add this to `~/.bashrc`:
```bash
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## Phase 1: Project Setup ✅

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

## Phase 2: Types and Database Layer ✅

### 2.1 Define TypeScript Types

Create `src/types/index.ts` with interfaces:
- `Location` (with 8-char Crockford Base32 `id` as primary key)
- `Item` (with 8-char Crockford Base32 `id` as primary key)
- Input types for create/update operations (`CreateLocationInput`, etc.)
- `BreadcrumbItem` for navigation

### 2.2 Initialize IndexedDB

Create `src/db/index.ts`:
- Database name: `inventori`
- Version: `7`
- Object stores: `locations`, `items`
- Indexes:
  - `by-parent` on `parentId` for locations and items

### 2.3 Implement CRUD Operations

Create database operation modules:

**`src/db/locations.ts`:**
- `getAllLocations(): Promise<Location[]>`
- `getLocation(id: string): Promise<Location | undefined>`
- `getLocationsByParent(parentId: string): Promise<Location[]>`
- `getTopLevelLocations(): Promise<Location[]>`
- `createLocation(input: CreateLocationInput): Promise<Location>` (auto-generates ID)
- `updateLocation(id: string, updates: UpdateLocationInput): Promise<Location>`
- `deleteLocation(id: string): Promise<void>` (cascade delete children)

**`src/db/items.ts`:**
- `getAllItems(): Promise<Item[]>`
- `getItem(id: string): Promise<Item | undefined>`
- `getItemsByParent(parentId: string, parentType: 'location' | 'item'): Promise<Item[]>`
- `getUnassignedItems(): Promise<Item[]>`
- `createItem(input: CreateItemInput): Promise<Item>` (auto-generates ID)
- `updateItem(id: string, updates: UpdateItemInput): Promise<Item>`
- `deleteItem(id: string): Promise<void>` (cascade delete children if canHoldItems)

### 2.4 Create Utility Functions

**`src/utils/shortId.ts`:**
- `generateId(): string` - Generate 8-char Crockford Base32 ID
- `generateUniqueId(isCollision): Promise<string>` - Generate with collision checking
- `formatShortId(id: string): string` - Format as `XXXX-XXXX`
- `normalizeShortId(input: string): string | null` - Normalize user input
- `looksLikeShortId(query: string): boolean` - Check if input looks like an ID

**Deliverables:**
- [x] TypeScript interfaces defined (with Crockford Base32 ID as primary key)
- [x] IndexedDB initialized with schema (v7)
- [x] CRUD operations for all entity types (with auto-generated ID)
- [x] Cascade delete implemented for locations and items
- [x] ID utility created (Crockford Base32)

---

## Phase 3: React Hooks ✅

### 3.1 Entity Hooks

**`src/hooks/useLocations.ts`:**
- Fetch all locations or by parent
- Loading and error states
- Refetch function

**`src/hooks/useItems.ts`:**
- Fetch items (all, by parent, unassigned)
- Loading and error states

### 3.2 Navigation Hooks

**`src/hooks/useChildren.ts`:**
- Given a parent ID and type, fetch all direct children (locations + items)
- Used for displaying contents of a location or item

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

## Phase 4: Core Components ✅

### 4.1 Layout Component

**`src/components/Layout.tsx`:**
- App shell with header and main content area
- Navigation back button
- Search icon linking to search page
- Offline indicator integration

### 4.2 Entity Display Components

**`src/components/EntityCard.tsx`:**
- Unified card component for displaying location/item
- Shows: photo thumbnail (if available), name, type icon
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

**`src/components/ItemForm.tsx`:**
- Fields: name, description, canHoldItems toggle
- Parent selector (optional - location or item)
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

**Deliverables:**
- [x] Layout with navigation
- [x] EntityCard for unified display
- [x] Breadcrumbs component
- [x] IdDisplay component for IDs
- [x] All form components (LocationForm, ItemForm)
- [x] PhotoCapture with camera and upload
- [x] SearchBar component

---

## Phase 5: Pages and Routing ✅

### 5.1 Setup React Router

**`src/App.tsx`:**
- Configure HashRouter (for compatibility with static hosting like GitHub Pages)
- Define routes (see below)
- Pages wrapped with Layout component

### 5.2 Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Two-tab home (Locations, Unassigned) |
| `/location/:id` | `LocationView` | View location contents |
| `/item/:id` | `ItemView` | View item details |
| `/add/location` | `AddLocation` | Create new location |
| `/add/item` | `AddItem` | Create new item |
| `/edit/location/:id` | `EditLocation` | Edit location |
| `/edit/item/:id` | `EditItem` | Edit item |
| `/search` | `Search` | Global search |
| `/tags` | `Tags` | Tag management |

### 5.3 Page Implementations

**`src/pages/Home.tsx`:**
- Two tabs: Locations, Unassigned
- List locations/items using EntityCard
- Context-sensitive FAB
- Empty states for each tab

**`src/pages/LocationView.tsx`:**
- Breadcrumbs with icons
- Location details (name, description, photo, ID)
- Collapsible sections for child locations and items
- Edit and Delete in overflow menu

**`src/pages/ItemView.tsx`:**
- Breadcrumbs with icons
- Item details (name, description, quantity, ID, tags)
- If canHoldItems, collapsible section for child items
- Edit and Delete in overflow menu

**`src/pages/Search.tsx`:**
- SearchBar at top
- Search across all entities (locations, items)
- ID exact match search
- Filter by type and tags
- Display results with location path

**`src/pages/Tags.tsx`:**
- List all tags with item counts
- Rename and delete actions via overflow menu
- Tap tag to search by that tag

**Deliverables:**
- [x] React Router configured (HashRouter)
- [x] All page components fully implemented
- [x] Navigation working between pages
- [x] CRUD operations connected to UI
- [x] Search functionality working

---

## Phase 6: PWA Features ✅

### 6.1 Service Worker Configuration

Update `vite.config.ts` PWA settings:
- Cache app shell and static assets
- Runtime caching strategy for images
- skipWaiting and clientsClaim for immediate updates

### 6.2 Web Manifest

Ensure `manifest.json` includes:
- `name` and `short_name`
- `description`
- `icons` (192x192, 512x512)
- `start_url`
- `display: standalone`
- `theme_color` and `background_color`

### 6.3 Install Prompt

Added install prompt functionality:
- `src/hooks/useInstallPrompt.ts` - Hook to capture `beforeinstallprompt` event
- Integrated into hamburger menu

### 6.4 Create App Icons

Icons created as SVG in `public/icons/`:
- `icon-192x192.svg`
- `icon-512x512.svg`
- `apple-touch-icon.svg` for iOS

**Deliverables:**
- [x] Service worker caching assets
- [x] Web manifest complete
- [x] App installable on mobile devices
- [x] Offline functionality

---

## Phase 7: Data Export/Import ✅

### 7.1 Export Utility

**`src/utils/export.ts`:**
- `exportData(): Promise<Blob>` - Export all data as ZIP file
- Include all locations, items (with ID fields)
- Store photos as separate files
- Return ZIP blob

Export format (v1.1):
```
inventori-backup-YYYY-MM-DD.zip
├── data.json
└── images/
    ├── location-{id}-{index}.{ext}
    └── item-{id}-{index}.{ext}
```

### 7.2 Import Utility

**`src/utils/import.ts`:**
- `importData(file: File): Promise<ImportResult>` - Import data from ZIP
- `previewImport(file: File)` - Preview import file without importing
- Merge by ID strategy

### 7.3 Export/Import UI

Accessible from hamburger menu in header:
- **Export Data**: Downloads ZIP backup file
- **Import Data**: Opens file picker, shows confirmation dialog

**Deliverables:**
- [x] Export function implemented (ZIP with separate images)
- [x] Import function implemented (merge by ID)
- [x] Download trigger in UI (hamburger menu)
- [x] Import trigger in UI with confirmation dialog

---

## Phase 8: Polish and Testing ✅

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

### 8.4 Testing

- [x] Manual testing of all CRUD operations
- [x] Test offline functionality
- [x] Test on multiple browsers
- [x] Test PWA installation

**Deliverables:**
- [x] All loading/empty/error states
- [x] Responsive on all device sizes
- [x] Accessible to keyboard and screen readers
- [x] Cross-browser tested

---

## Phase 9: Data Model Consolidation ✅

Phase 9 merged Container and Item types, consolidating into a unified Item type with `canHoldItems: boolean`. Database schema updated to v6/v7.

**Key Changes:**
- Removed separate Container type
- Items with `canHoldItems: true` act as containers
- Removed: `status` enum, `dateDisposed` field
- Made `parentId` optional (allows unassigned items)
- Added `tags: string[]` for flexible categorization

**Deliverables:**
- [x] Entity type consolidation complete
- [x] Database schema updated
- [x] All routes updated

---

## Phase 10: Post-v1.0 Enhancements

### 10.1 Entity Text Export Feature (DEFERRED)

Copy-to-clipboard and download options for entity text + photos. Deferred to focus on core UI redesign first.

**Files to Create:**
- `src/utils/entityTextFormatter.ts`
- `src/utils/photoZipDownloader.ts`

**Deliverables:**
- [ ] Copy text button functional
- [ ] Download ZIP button functional

### 10.2 Step-by-Step Parent Picker ✅

Replaced dropdown with modal dialog containing step-by-step breadcrumb-based picker.

**Files Created:**
- `src/components/ParentPickerModal.tsx`
- `src/hooks/useParentPicker.ts`

**Deliverables:**
- [x] Modal component functional
- [x] Step-by-step navigation works
- [x] Current parent pre-selected

---

## Phase 11: Critical Fixes ✅

**Status: COMPLETE** 

Fixed TypeScript errors and aligned codebase with new data model (removed Containers, made items unassignable optional).

### 11.1 Delete Orphaned Container Files ✅

Files deleted:
- `src/pages/AddContainer.tsx`
- `src/pages/ContainerView.tsx`
- `src/pages/EditContainer.tsx`

### 11.2 Update Data Model ✅

**`src/types/index.ts`:**
- ✅ Removed `ItemContainerStatus` enum entirely
- ✅ Removed `status` field from Item interface
- ✅ Removed `dateDisposed` field from Item interface
- ✅ Made `parentId` optional on Item (allows unassigned items)
- ✅ Made `parentType` optional on Item

### 11.3 Update Database Schema ✅

**`src/db/index.ts`:**
- ✅ Bumped `DB_VERSION` from 6 to 7
- ✅ No migration needed (fields optional/removed at type level only)

### 11.4 Update Database Functions ✅

**`src/db/items.ts`:**
- ✅ Added `getUnassignedItems(): Promise<Item[]>` function
- ✅ Updated `createItem` to handle optional `parentId`/`parentType`
- ✅ Updated `updateItem` to handle optional `parentId`/`parentType`
- ✅ Removed all `status` and `dateDisposed` handling

### 11.5 Fix Search Page ✅

**`src/pages/Search.tsx`:**
- ✅ Removed `useContainers` and `getContainer` imports
- ✅ Removed `Entity` type import, using `Location | Item` instead
- ✅ Simplified to show only Locations and Items (no Containers section)
- ✅ Updated filtering logic
- ✅ No more TypeScript errors

### 11.6 Fix App.tsx Routes ✅

**`src/App.tsx`:**
- ✅ Removed container route imports (ContainerView, AddContainer, EditContainer)
- ✅ Removed container routes:
  - `/container/:id`
  - `/add/container`
  - `/edit/container/:id`

### 11.7 Fix ItemForm and Related Pages ✅

**`src/components/ItemForm.tsx`:**
- ✅ Removed `status: 'IN_USE'` field from createItem call
- ✅ Kept `includeInTotal: true` (required field)
- ✅ Kept `tags: []` (required field)

**`src/pages/AddItem.tsx`:**
- ✅ Removed `ParentType` import
- ✅ Added logic to convert old `parentType=container` to `parentType=item` for backward compatibility

**`src/pages/Home.tsx`:**
- ✅ Added missing `entityType="location"` prop to EntityCard

### 11.8 Fix View Pages ✅

**`src/hooks/useChildren.ts`:**
- ✅ Updated to return single `children` array (not split into containers/items)
- ✅ Added sorting to put `canHoldItems: true` items first

**`src/pages/ItemView.tsx`:**
- ✅ Updated `useChildren(id, 'item')` call with explicit parentType
- ✅ Changed from `containers` and `childItems` to single `children` array
- ✅ Replaced `item.isContainer` with `item.canHoldItems`
- ✅ Removed "Add Container" button - now only "+ Add Item"
- ✅ Updated content list to use single `children` array
- ✅ Added `entityType="item"` to EntityCard components

**`src/pages/LocationView.tsx`:**
- ✅ Updated `useChildren(id, 'location')` call with explicit parentType
- ✅ Changed from `containers` and `items` to single `children` array
- ✅ Removed "Add Container" button - now only "+ Add Item"
- ✅ Updated content list to use single `children` array
- ✅ Added `entityType="item"` to EntityCard components

### 11.9 Fix Export Utility ✅

**`src/utils/export.ts`:**
- ✅ Removed `getAllContainers` import
- ✅ Removed `Container` type import
- ✅ Bumped `EXPORT_VERSION` to `'2.0'` (breaking change)
- ✅ Removed `ExportedContainer` interface entirely
- ✅ Updated `ExportedLocation` to remove `type` field
- ✅ Updated `ExportedItem` to use `canHoldItems` instead of `isContainer`
- ✅ Updated `ExportData` to remove `containers` array
- ✅ Removed `exportContainer()` function
- ✅ Updated `generateImageFilename()` to only accept `'location' | 'item'`
- ✅ Updated `exportData()` to skip container processing

### 11.10 Fix Import Utility ✅

**`src/utils/import.ts`:**
- ✅ Removed `getContainer` import
- ✅ Removed `Container` and `ExportedContainer` imports
- ✅ Updated `SUPPORTED_VERSION` to `SUPPORTED_VERSIONS = ['1.1', '2.0']`
- ✅ Removed `containers` from `ImportResult` interface
- ✅ Simplified `isIdCollision()` to only check locations/items
- ✅ Removed `importContainer()` function
- ✅ Updated `importItem()` to use `canHoldItems` instead of `isContainer`
- ✅ Updated `validateExportData()` to support both v1.1 and v2.0
- ✅ Added v1.1 backward compatibility: converts old containers to items with `canHoldItems: true`
- ✅ Updated error messages to mention both versions
- ✅ Updated `previewImport()` to remove containers from counts

**`src/components/HamburgerMenu.tsx`:**
- ✅ Updated `importPreview` type to remove containers
- ✅ Updated import success check logic
- ✅ Removed containers from UI display

**Deliverables:**
- ✅ All orphaned container files deleted
- ✅ `ItemContainerStatus` enum removed
- ✅ `status` and `dateDisposed` fields removed from Item
- ✅ `parentId` and `parentType` made optional
- ✅ Database version bumped to v7
- ✅ `getUnassignedItems()` function added
- ✅ Search page working without container imports
- ✅ All view pages fixed with proper `useChildren` usage
- ✅ Home page fixed with `entityType` props
- ✅ Routes updated
- ✅ Forms updated
- ✅ Export/import updated with v2.0 format and v1.1 backward compatibility
- ✅ `pnpm build` succeeds with zero TypeScript errors
- ✅ Vite build succeeds
- ✅ PWA manifest generated

---

## Phase 12: Home Page Redesign ✅

**Status: COMPLETE** 

Redesigned the home page with two-tab layout per UI_DESIGN.md. All components created, hooks implemented, and comprehensive testing documentation prepared.

### 12.1 Create Tabs Component ✅

**`src/components/Tabs.tsx`:**
- ✅ Reusable controlled component with animated underline
- ✅ Badge support for item counts
- ✅ Smooth CSS transitions
- ✅ Full accessibility (ARIA labels, semantic HTML)
- ✅ Render prop pattern for flexible content

### 12.2 Create useTopLevelLocations Hook ✅

**`src/db/locations.ts`:**
- ✅ Added `getTopLevelLocations(): Promise<Location[]>` function

**`src/hooks/useLocations.ts`:**
- ✅ Added `useTopLevelLocations()` hook
- ✅ Fetches locations where `parentId` is undefined
- ✅ Independent loading/error state
- ✅ Refetch capability

### 12.3 Create useUnassignedItems Hook ✅

**`src/hooks/useItems.ts`:**
- ✅ Added `useUnassignedItems()` hook
- ✅ Fetches items where `parentId` or `parentType` is undefined
- ✅ Independent loading/error state
- ✅ Refetch capability

### 12.4 Home Page Redesign ✅

**`src/pages/Home.tsx`:**
- ✅ Complete rewrite (70 → 146 lines)
- ✅ Two-tab layout (Locations + Unassigned)
- ✅ Parallel data fetching (both hooks call simultaneously)
- ✅ Per-tab rendering functions
- ✅ Per-tab loading, error, empty states
- ✅ Badge counts on tabs
- ✅ Tab state managed with `useState`

### 12.5 FAB Component ✅

**`src/components/FAB.tsx`:**
- ✅ Reusable FAB component
- ✅ Icon + text label layout
- ✅ Responsive (text hidden on mobile)
- ✅ Fixed position bottom-right (16px spacing)
- ✅ Accessible with ARIA labels
- ✅ Context-sensitive behavior in Home.tsx

**Home.tsx Integration:**
- ✅ Locations tab FAB: "+ Location" → `/add/location`
- ✅ Unassigned tab FAB: "+ Item" → `/add/item`
- ✅ FAB shows on all states except errors
- ✅ Fixed double-plus bug

### 12.6 Testing & Verification ✅

**Build Verification:**
- ✅ TypeScript compilation: PASS (0 errors, 0 warnings)
- ✅ Vite build: PASS (85 modules, 412.07 KB)
- ✅ Service worker: PASS
- ✅ PWA manifest: PASS
- ✅ Build time: 1.92s (optimized)

**Documentation Created:**
- ✅ Phase 12 Summary document
- ✅ Manual testing guide with 13 scenarios
- ✅ Testing checklist
- ✅ Performance guidelines
- ✅ Accessibility requirements

**Deliverables:**
- ✅ Tabs component created and working
- ✅ Home page has two tabs (Locations, Unassigned)
- ✅ Tab counts always visible
- ✅ Context-sensitive FAB working
- ✅ Empty states implemented with messaging
- ✅ Loading states with skeletons
- ✅ Error states with retry
- ✅ FAB responsive (desktop: icon+text, mobile: icon only)
- ✅ All TypeScript types correct
- ✅ Build succeeds with zero errors
- ✅ Comprehensive testing documentation complete
- ✅ Ready for manual testing

---

## Phase 13: Entity Card Redesign

**Status: COMPLETE ✅**

Update EntityCard to show total item count (recursive) instead of description/ID.

### 13.1 Create Count Calculation Utility ✅

**`src/utils/counts.ts`:**
- ✅ `getTotalItemCount(parentId, parentType): Promise<number>`
- ✅ Recursive count of all descendant items
- ✅ Factors in quantity (e.g., Eggs×12 = 12 items)
- ✅ Respects `includeInTotal` flag (excludes items with false)
- ✅ No caching (direct database queries)
- ✅ Counts through location nesting AND container items

### 13.2 Create useTotalItemCount Hook ✅

**`src/hooks/useTotalItemCount.ts` (renamed from useChildCounts):**
- ✅ Wrapper around count utility with React state management
- ✅ Returns: `{ count, loading, error, refetch }`
- ✅ Re-fetches when parentId or parentType changes
- ✅ No caching (direct database queries)

### 13.3 Update EntityCard ✅

**`src/components/EntityCard.tsx`:**
- ✅ Display total item count as subtitle: `{N} items`
- ✅ Locations: Show recursive item count (all descendants, respecting includeInTotal)
- ✅ Container items: Show recursive item count (items inside)
- ✅ Regular items: No subtitle (only quantity badge if > 1)
- ✅ Remove ID display
- ✅ Remove "Container" badge (icon already indicates it)
- ✅ Keep quantity badge for items > 1
- ✅ Show skeleton text (░░░░░░░░) while counts load

**Build Verification:**
- ✅ TypeScript compilation: 0 errors
- ✅ Vite build: PASS (87 modules, 412.82 KB)
- ✅ PWA manifest: PASS

**Deliverables:**
- ✅ Count utility with recursive counting
- ✅ useTotalItemCount hook working
- ✅ EntityCard shows `{N} items` subtitle
- ✅ No ID display
- ✅ No Container badge
- ✅ Quantity badge working
- ✅ Skeleton loading state

---

## Phase 14: View Page Improvements

**Status: COMPLETE ✅**

Update LocationView and ItemView with collapsible sections and overflow menu.

### 14.1 Create CollapsibleSection Component ✅

**`src/components/CollapsibleSection.tsx`:**
- ✅ Props: title, children, defaultOpen, className
- ✅ Unicode chevron (▼) for state indicator
- ✅ Smooth 300ms height animation expand/collapse
- ✅ Click anywhere on header to toggle
- ✅ Accessible (ARIA expanded)

### 14.2 Create OverflowMenu Component ✅

**`src/components/OverflowMenu.tsx`:**
- ✅ Trigger: Three dots emoji (⋯)
- ✅ Desktop: Dropdown menu with shadow
- ✅ Mobile: Bottom sheet drawer with overlay
- ✅ Support for destructive items (red text)
- ✅ Click outside to close
- ✅ Accessible (ARIA menu, labels)
- ✅ MenuItem interface with id, label, icon, onClick, destructive

### 14.3 Update LocationView ✅

**`src/pages/LocationView.tsx`:**
- ✅ Add overflow menu (⋯) to location details header with Edit/Delete
- ✅ Remove inline Edit/Delete buttons
- ✅ Wrap Contents section with CollapsibleSection (defaultOpen: true)
- ✅ Integrate "[+ Add Item]" button with location details card
- ✅ getLocationMenuItems() helper function

### 14.4 Update ItemView ✅

**`src/pages/ItemView.tsx`:**
- ✅ Add overflow menu (⋯) to item details header with Edit/Delete
- ✅ Remove inline Edit/Delete buttons
- ✅ If `canHoldItems: true`: Wrap Contents with CollapsibleSection (defaultOpen: true)
- ✅ Integrate "[+ Add Item]" button with container section
- ✅ getItemMenuItems() helper function

### 14.5 Update Breadcrumbs ✅

**`src/components/Breadcrumbs.tsx`:**
- ✅ Add icons to Home link: 🏠
- ✅ Add icons to each breadcrumb segment:
  - 📍 for locations
  - 📦 for container items (`canHoldItems: true`)
  - 📄 for regular items
- ✅ getItemIcon() helper function
- ✅ BreadcrumbItem updated with optional `canHoldItems` field
- ✅ useAncestors() hook updated to include `canHoldItems`

**Deliverables:**
- [x] CollapsibleSection component created
- [x] OverflowMenu component created
- [x] LocationView has collapsible Contents section (defaultOpen: true)
- [x] ItemView has collapsible Contents section (defaultOpen: true)
- [x] Edit/Delete moved to overflow menu
- [x] Breadcrumbs have icons
- [x] Types updated (BreadcrumbItem with canHoldItems)
- [x] useAncestors hook updated to pass canHoldItems

---

## Phase 15: Form Improvements

**Status: COMPLETE** ✅

Update forms with collapsible sections and tag input.

### 15.1 Create CollapsibleFormSection Component ✅

**`src/components/CollapsibleFormSection.tsx`:** (110 lines)
- Similar to CollapsibleSection but styled for forms
- Used for "Additional Info" section
- Semantic HTML using fieldset/legend
- Field count display in header

### 15.2 Create TagInput Component ✅

**`src/components/TagInput.tsx`:** (233 lines)
- Chip display for current tags
- Text input for adding new tags
- Autocomplete dropdown from existing tags
- Show item counts in suggestions: "seasonal (8 items)"
- Remove tag on chip ✕ click
- Accessible
- Keyboard navigation support

### 15.3 Create useTags Hook ✅

**`src/hooks/useTags.ts`:** (74 lines)
- Fetch all unique tags from all items
- Return tags with item counts
- Used for autocomplete and Tags page

### 15.4 Update ItemForm ✅

**`src/components/ItemForm.tsx`:** (400+ lines)

Consolidated form design with single "Basic Information" section:

**Container Toggle (at top, separate):**
- "This item can hold other items" checkbox
- Enable for boxes, shelves, drawers, bags, etc.

**Basic Information Section (fieldset):**
- Name field (required, flex-1)
  - Quantity field (narrow w-20, required)
  - On same row: `<div className="flex gap-3">`
- Description field (textarea)
- Location/Parent selector (required)
- Tags with TagInput component
  - Autocomplete from existing tags
  - Show tag usage counts
- Photos (with PhotoCapture component)

**Additional Information Section (CollapsibleFormSection):**
- Collapsed by default (`defaultOpen: false`)
- Shows field count in header (e.g., "Additional Information (4)")
- Purchase Price (optional, $ prefix)
- Current Value (optional, $ prefix)
- Date Acquired (optional, date input)
- Include in Inventory Totals (checkbox, default: true)

**Implementation Details:**
- Integrated CollapsibleFormSection and TagInput components
- Full state management for all fields
- Date conversion: ISO string ↔ date input format
- Quantity field hidden when `canHoldItems` is true
- All new fields properly included in form submission
- Existing functionality preserved

### 15.5 Update LocationForm

**`src/components/LocationForm.tsx`:**
- Not needed - Locations don't require additional fields
- LocationForm remains simple with name, description, and photos

**Deliverables:**
- [x] CollapsibleFormSection component created
- [x] TagInput component with autocomplete
- [x] useTags hook working
- [x] ItemForm has collapsible "Additional Information"
- [x] ItemForm properly submits all new fields
- [x] LocationForm update deferred (not needed)

---

## Phase 16: Tags System

**Status: NOT STARTED**

Implement dedicated Tags page and tag management.

### 16.1 Create Tags Database Functions

**`src/db/tags.ts`:**
- `getAllTags(): Promise<{ tag: string; count: number }[]>` - Get all tags with item counts
- `renameTag(oldName: string, newName: string): Promise<void>` - Update tag on all items
- `deleteTag(tagName: string): Promise<void>` - Remove tag from all items

### 16.2 Create Tags Page

**`src/pages/Tags.tsx`:**
- List all tags with item counts
- Filter input at top
- Each tag row has overflow menu (⋮) with:
  - Rename (opens dialog)
  - Delete (opens confirm dialog)
- Tap tag → Navigate to Search filtered by that tag
- Empty state when no tags

### 16.3 Add Tags Route

**`src/App.tsx`:**
- Add route: `/tags` → `Tags` page

### 16.4 Update Hamburger Menu

**`src/components/HamburgerMenu.tsx`:**
- Add "Manage Tags" option → navigates to `/tags`

### 16.5 Add Tag Filters to Search

**`src/pages/Search.tsx`:**
- Add tag filter chips below search bar
- Show "[tag ✕]" for active filters
- "[+ Add]" button to add tag filter
- Tag autocomplete when adding filter

**Deliverables:**
- [ ] Tags database functions working
- [ ] Tags page lists all tags with counts
- [ ] Tag rename updates all items
- [ ] Tag delete removes from all items
- [ ] Tags accessible via hamburger menu
- [ ] Search has tag filter chips

---

## Phase 17: Navigation Polish

**Status: NOT STARTED**

Final navigation improvements and consistency.

### 17.1 Back Button Behavior

**All view pages:**
- Back button (←) navigates to parent in hierarchy:
  - Item → Parent item or parent location
  - Location → Parent location or Home
  - Top-level → Home
- Browser back button still works as normal (previous page)

### 17.2 Replace History on Save

**All edit pages:**
- After successful save, use `navigate(path, { replace: true })`
- This skips the edit page when pressing browser back

### 17.3 Button Style Consistency

**Review all pages:**
- Primary buttons: Solid accent color
- Secondary buttons: Outlined
- Danger buttons: Red
- Ghost buttons: Text only
- Ensure consistent sizing and spacing

### 17.4 Final Testing

- Test all navigation flows
- Test back button behavior
- Test browser back vs app back
- Test all CRUD operations
- Test on mobile

**Deliverables:**
- [ ] Back button goes to parent in hierarchy
- [ ] Edit pages replace history on save
- [ ] Consistent button styles
- [ ] All navigation flows tested

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
- [x] **Phase 9:** Data model consolidation
- [x] **Phase 10:** Post-v1.0 enhancements (10.1 deferred, 10.2 parent picker done)
- [x] **Phase 11:** Critical fixes (build errors) ✅ COMPLETE
- [x] **Phase 12:** Home page redesign (two tabs) ✅ COMPLETE
- [x] **Phase 13:** Entity card redesign (icon counts) ✅ COMPLETE
- [x] **Phase 14:** View page improvements (collapsible, overflow menu) ✅ COMPLETE
- [x] **Phase 15:** Form improvements (collapsible, tag input) ✅ COMPLETE
- [ ] **Phase 16:** Tags system (tags page, management)
- [ ] **Phase 17:** Navigation polish (back button, consistency)

## Notes for Implementers

1. **Photo Storage:** Photos are stored as Blobs directly in IndexedDB. Consider size limits and potentially compressing images before storage.

2. **Cascade Deletes:** When deleting a location or item, all child entities must also be deleted. Implement recursively.

3. **IDs:** Use 8-character Crockford Base32 IDs as primary keys. These provide high entropy (~1 trillion combinations) for future sync compatibility and can be used on physical labels.

4. **ID Format:** Crockford Base32 alphabet excludes I, L, O, U to avoid confusion. The `shortId.ts` utility handles generation, formatting (XXXX-XXXX), and normalization.

5. **Timestamps:** Always set `createdAt` on creation and update `updatedAt` on every modification.

6. **Parent References:** When moving items, update both `parentId` and `parentType`.

7. **Tags:** User-defined strings, not a fixed enum. Tags are created when added to items and can be renamed/deleted via the Tags page.

8. **Counting Strategy:** Use caching for child counts to avoid repeated database queries. Cache invalidation happens on entity CRUD operations.

9. **Unassigned Items:** Items can have no parent (`parentId: undefined`). These appear in the Unassigned tab on the Home page.

10. **Container Items:** Items with `canHoldItems: true` can contain other items. They display with a 📦 icon and show child item counts.
