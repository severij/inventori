# Inventori - Requirements

A local-first home inventory progressive web app (PWA) for tracking items, their locations, and containers.

## Overview

Inventori helps users catalog and organize their physical belongings with a hierarchical structure of locations and items. The app works entirely offline using IndexedDB, with future plans for QR code scanning and peer-to-peer sync.

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

A place where items are stored (room, building, storage unit, etc.). Simple organizational entity.

```typescript
interface Location {
  id: string;              // 8-char Crockford Base32 ID
  name: string;            // e.g., "Living Room", "Garage", "Storage Unit #5"
  description?: string;
  parentId?: string;       // Can parent another Location (e.g., House > Kitchen)
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Notes:**
- Locations can be nested (House > Room)
- No tracking fields (tags, prices, dates)
- Child count cached for display

### Item

Container or individual item stored in locations. Supports rich tracking data.

```typescript
interface Item {
  id: string;                            // 8-char Crockford Base32 ID
  name?: string;                         // Optional - allows quick-add items (e.g., photo-only)
  description?: string;
  
  // Hierarchy (optional - allows unassigned items)
  parentId?: string;                     // Location ID or Item ID
  parentType?: 'location' | 'item';      // Which store to query for parent
  
  // Item capabilities
  canHoldItems: boolean;                 // Can this item hold other items? (default: false)
  quantity: number;                      // Default: 1 (quantity of items)
  
  // Counting
  includeInTotal: boolean;               // Include in inventory totals? (default: true)
                                         // Set to false for built-in structures (shelves, drawers)
  
  // Categorization and tracking
  tags: string[];                        // Categories/labels (e.g., ['electronics', 'to-sell'])
  purchasePrice?: number;                // Original purchase cost
  currentValue?: number;                 // Estimated current worth
  dateAcquired?: Date;                   // When purchased/acquired
  
  photos: Blob[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Notes:**
- Items can be unassigned (no parent) or assigned to a location/item
- Items with `canHoldItems: true` act as containers
- Items without a name display as "Unnamed item" (translatable)
- Tags replace the old status system for flexible categorization

### Hierarchy Example

```
House A (Location)
├── Kitchen (Location, parent: House A)
│   ├── Refrigerator (Item, canHoldItems: true, parent: Kitchen)
│   │   └── Leftovers (Item, quantity: 3, parent: Refrigerator)
│   └── Dishes (Item, quantity: 12, parent: Kitchen)
└── Garage (Location)
    ├── Metal Shelf (Item, canHoldItems: true, includeInTotal: false)
    │   ├── Red Toolbox (Item, canHoldItems: true, parent: Metal Shelf)
    │   │   ├── Hammer (Item, parent: Red Toolbox)
    │   │   └── Wrench (Item, parent: Red Toolbox)
    │   └── Blue Bin (Item, canHoldItems: true, parent: Metal Shelf)
    │       └── Christmas Lights (Item, parent: Blue Bin, tags: ['seasonal'])
    └── Car Jack (Item, quantity: 1)

Unassigned:
├── Mystery Cable (Item, no parent)
└── Old Phone (Item, no parent, tags: ['to-sell'])
```

### Item Counting Rules

Counting respects `includeInTotal` flag and quantity:

```
count = SUM(
  quantity for item
  WHERE includeInTotal: true
  Recursively includes nested items
)
```

**Important:** `includeInTotal: false` only excludes the item itself from the count. Items inside a container with `includeInTotal: false` are still counted (if they themselves have `includeInTotal: true`). The recursion into containers always happens regardless of the container's `includeInTotal` flag.

Example:
- Garage has: Metal Shelf (not counted), Car Jack, Toolbox with 2 items
- Count: Car Jack (1) + Toolbox (1) + 2 items = 4
- Metal Shelf excluded (includeInTotal: false), but items inside it are still counted

### Delete Behavior

When deleting locations or container items that have contents, users are given a choice:

**Cascade Delete:**
- Deletes the location/container and all items inside recursively
- Permanently removes all data

**Orphan Contents (Make Unassigned):**
- Deletes the location/container only
- Child items are made unassigned (moved to Inbox)
- Child locations (if any) are made top-level
- Safer option that preserves data

**Default:** The UI defaults to "Make contents unassigned" as the safer option.

### Tags

Tags provide flexible categorization:
- User-defined (not a fixed list)
- Multiple tags per item
- Used for filtering in Search
- Replaces the old `status` field

Common tag patterns:
- `to-sell`, `to-donate` - Items marked for disposal
- `lent-to-john` - Items lent out
- `seasonal`, `christmas` - Seasonal items
- `electronics`, `tools` - Category tags

---

## User Interface

See `UI_DESIGN.md` for detailed ASCII mockups of all pages and components.

### Home Page

Two-tab layout:
- **Locations tab**: List of top-level locations with child counts
- **Unassigned tab**: List of items without a parent

Features:
- Tab badges always show counts
- Context-sensitive FAB (+ Location or + Item)
- Empty states for each tab

### Location/Item View

- Breadcrumbs with icons (📍 location, 📦 container, 📄 item)
- Hero photo at top
- Collapsible sections for "Locations" and "Items" (collapsed by default)
- Edit/Delete in header overflow menu (⋮)
- Duplicate item via overflow menu (copies all fields to AddItem form for review before saving)
- "[+ Add Location]" and "[+ Add Item]" buttons always visible

### Entity Cards

Show at-a-glance information:
- Thumbnail on left
- Name and type icon
- Total item count as subtitle: `{N} items` (recursive, respecting includeInTotal)
- Quantity badge (if > 1)
- No description or ID (too cluttered)

### Forms

**ItemForm - Basic Information Section:**
- Name field (optional for items, required for locations)
- Quantity field (narrow, w-20, hidden when canHoldItems is true)
- Description field
- **Location/Parent selector** (LocationPicker component)
  - Optional (items can be unassigned)
  - Modal/bottom sheet drill-down interface
  - Mobile: 70% viewport height bottom sheet, rounded top corners
  - Desktop: Centered modal (max-w-[400px])
  - Opens at current location for easy navigation (built from ancestors)
  - Clear button (✕) to make item unassigned (only shows when item has location)
  - Auto-select for items without children (closes picker immediately)
  - Breadcrumb-style display on trigger button showing current path
  - Visual indicators: Icons (📍 location, 📦 container), arrow (>) for drillable items
  - Form submission prevention: All buttons have `type="button"`
  - Event handling: Overlay click handled with `stopPropagation()`
- Tags with autocomplete from existing tags and inline "+" add button for mobile
- Photos (camera + upload)

**ItemForm - Additional Information Section (collapsed by default):**
- Purchase price (optional)
- Current value (optional)
- Date acquired (optional)
- Include in totals checkbox (default: true)

**ItemForm - Container Toggle:**
- "This item can hold other items" checkbox (at top, separate from sections)

**ItemForm - Props:**
- `initialValues?: Item` — Pre-fills form for editing or duplicating
- `isEditMode?: boolean` — Overrides edit mode detection (defaults to `!!initialValues`). Controls button text and LocationPicker exclusion. Set to `false` when duplicating to show "Create Item" button.

### Search

- Text search across name/description
- ID exact match
- Filter by type: All, Locations, Items
- Filter by tags
- Tag filter URL format: repeated `tags` parameter (e.g., `/search?tags=electronics&tags=tools`)
- Clicking tag chips in ItemView navigates to Search with that tag pre-filtered
- Results show location path as subtitle

### Tags Page

- Accessible via hamburger menu → "Manage Tags"
- List all tags with item counts
- Overflow menu (⋮) for Rename/Delete actions
- Tap tag → Search filtered by that tag

### Navigation

- Back button (←): Goes to parent in hierarchy (not browser back)
- Browser back: Goes to previous page in history
- After save: Replace history (skip edit page on back)
- Hamburger menu (☰): App-wide options (Settings, Manage Tags, Install)

### Settings

Accessed via hamburger menu → Settings. Settings persist in localStorage.

**Appearance:**
- Theme: Light / Dark / System (default: System)

**Regional:**
- Language: English / Suomi (default: English)
- Currency: USD / EUR (default: USD)
- Date Format: System default / DD/MM/YYYY / MM/DD/YYYY / YYYY-MM-DD (default: System)

**Inventory Stats:**
- Item Counting Method: Count unique items / Sum quantities (default: Count unique items)
  - "Count unique items": Each item record counts as 1 (organizational view)
  - "Sum quantities": Sum all `item.quantity` fields (physical count)
- Value Calculation: Current value (with fallback) / Current value only / Purchase price only (default: Current value with fallback)
  - "Current value (with fallback)": Use `currentValue`, fallback to `purchasePrice` if not set
  - "Current value only": Only use `currentValue` field (items without it count as $0)
  - "Purchase price only": Only use `purchasePrice` field (original cost)

**Data Management:**
- Export Data: Download ZIP backup
- Import Data: Restore from ZIP backup

**Notes:**
- Stats settings affect how totals are calculated on Home page, LocationView, and ItemView
- All stats respect the `includeInTotal` flag (items with `includeInTotal: false` are excluded)
- Stats are recursive (locations include sub-locations, containers include nested containers)

---

## Version Roadmap

### v1 (Current)

#### Core Features

1. **Location Management**
   - Create, view, edit, delete locations
   - Nested locations (location inside location)
   - Photo attachments
   - ID displayed for physical labels

 2. **Item Management**
    - Create, view, edit, delete items
    - Duplicate items (deep copy all fields including photos, new ID/timestamps)
    - Items can be assigned to locations or other items
   - Items can be unassigned
   - Items can hold other items (`canHoldItems: true`)
   - Tags for categorization
   - Optional: purchase price, current value, date acquired
   - Photo attachments (multiple)
   - ID displayed for physical labels

3. **Navigation & Organization**
   - Two-tab home page (Locations, Unassigned)
   - Drill-down navigation with collapsible sections
   - Breadcrumb navigation with icons

4. **Search**
   - Search by name, description
   - Search by ID (exact match)
   - Filter by type and tags

5. **Tags**
   - Add tags to items
   - Autocomplete from existing tags
   - Manage tags page (rename, delete)
   - Tag filtering in search

 6. **Photo Capture**
    - Native camera app integration via `capture="environment"` (opens device camera on mobile)
    - File upload from gallery/filesystem
    - Photo preview and deletion

7. **Data Management**
    - ZIP export/backup
    - ZIP import/restore (merge by ID)

8. **Settings**
    - Appearance: Theme selection (Light/Dark/System)
    - Regional: Language (English/Finnish), Currency, Date Format
    - Data Management: Export/Import access
    - Internationalization (i18n) support for English and Finnish

#### PWA Features

1. **Offline-First**
   - Full functionality without internet
   - Service worker caching

2. **Installable**
   - Web app manifest
   - "Add to Home Screen" support
   - App icons

3. **Static Hosting Compatible**
   - HashRouter for GitHub Pages compatibility

### v2 (Deferred)

1. **QR Code Generation** - Printable QR codes for entities
2. **QR Code Scanning** - Camera-based scanning to navigate

### v3 (Deferred)

1. **P2P Sync** - Peer-to-peer synchronization between devices

---

## Export/Import Format

The export utility produces a ZIP file:

```
inventori-backup-YYYY-MM-DD.zip
├── data.json
└── images/
    ├── location-{id}-{index}.{ext}
    └── item-{id}-{index}.{ext}
```

### data.json structure (v2.0)

```typescript
interface ExportData {
  version: "2.0";           // v2.0: Containers as items with canHoldItems
  exportedAt: string;       // ISO 8601 timestamp
  locations: ExportedLocation[];
  items: ExportedItem[];
}

interface ExportedLocation {
  id: string;
  name: string;
  description?: string;
  photos: string[];         // filenames in images/ folder
  createdAt: string;        // ISO date string
  updatedAt: string;        // ISO date string
}

interface ExportedItem {
  id: string;
  name?: string;                // Optional since Phase 25
  description?: string;
  parentId?: string;
  parentType?: 'location' | 'item';
  canHoldItems: boolean;    // v2.0: replaces isContainer
  quantity: number;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Backward Compatibility

**v1.1 → v2.0 Migration:**
- Old `ExportedContainer` objects are automatically converted to Items with `canHoldItems: true`
- Old `parentType: 'container'` is converted to `parentType: 'item'`
- Import utility supports both v1.1 and v2.0 formats

### Import Behavior

**Merge by ID** strategy:
- Matching IDs: Updated with imported data
- New IDs: Added to database
- Missing from import: Preserved

---

## Non-Functional Requirements

1. **Performance**
   - Fast initial load
   - Smooth scrolling
   - Cached child counts

2. **Responsiveness**
   - Mobile-first design
   - Works on phone, tablet, desktop
   - Touch-friendly (44px min targets)

3. **Accessibility**
   - Semantic HTML (proper heading hierarchy, landmarks)
   - Keyboard navigation (Tab, Escape, Arrow keys where appropriate)
   - Screen reader support (ARIA labels, roles, states)
   - Focus management (focus trapping in modals, visible focus indicators)
   - Color contrast (WCAG AA 4.5:1 for normal text, 3:1 for large text)
   - All interactive elements accessible via keyboard
   - Proper form label associations

4. **Data Integrity**
   - High-entropy IDs
   - Timestamps for conflict resolution
   - Cascade delete handling

5. **Visual Consistency**
   - Consistent use of theme tokens (no hardcoded colors)
   - Standardized button sizes and padding
   - Unified border-radius scale (rounded-lg for cards/modals, rounded-md for inputs)
   - Consistent shadow levels for similar UI elements
   - Unified hover/active states using theme colors

---

## IndexedDB Schema

**Database version: 7**

| Store | Key Path | Indexes |
|-------|----------|---------|
| `locations` | `id` | `by-parent` (parentId) |
| `items` | `id` | `by-parent` (parentId) |

---

## Project Structure

```
inventori/
├── public/                       # Static assets
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # App shell with header
│   │   ├── Tabs.tsx             # Tab navigation component
│   │   ├── CollapsibleSection.tsx # Collapsible content section
│   │   ├── OverflowMenu.tsx     # Dropdown menu (⋮)
│   │   ├── EntityCard.tsx       # Card for location/item
│   │   ├── Breadcrumbs.tsx      # Navigation breadcrumbs with icons
│   │   ├── TagInput.tsx         # Tag chip input with autocomplete
│   │   ├── HamburgerMenu.tsx    # App menu
│   │   ├── ConfirmDialog.tsx    # Confirmation dialog
│   │   ├── SearchBar.tsx        # Debounced search input
│   │   ├── PhotoCapture.tsx     # Camera/upload component
│   │   ├── IdDisplay.tsx        # ID display with copy
│   │   ├── LocationForm.tsx     # Location form
│   │   └── ItemForm.tsx         # Item form with collapsible sections
│   ├── db/
│   │   ├── index.ts             # DB initialization (v7)
│   │   ├── locations.ts         # Location CRUD
│   │   ├── items.ts             # Item CRUD
│   │   └── tags.ts              # Tag management (rename, delete)
│   ├── hooks/
│   │   ├── useLocations.ts      # Location data
│   │   ├── useItems.ts          # Item data
│   │   ├── useChildren.ts       # Children of parent
│   │   ├── useTotalItemCount.ts # Recursive total item count
│   │   ├── useAncestors.ts      # Breadcrumb path
│   │   ├── useTags.ts           # All tags with counts
│   │   ├── useOffline.ts        # Offline status
│   │   └── useInstallPrompt.ts  # PWA install
│   ├── pages/
│   │   ├── Home.tsx             # Two-tab home (Locations, Unassigned)
│   │   ├── LocationView.tsx     # Location details
│   │   ├── ItemView.tsx         # Item details
│   │   ├── AddLocation.tsx      # Create location
│   │   ├── AddItem.tsx          # Create item
│   │   ├── EditLocation.tsx     # Edit location
│   │   ├── EditItem.tsx         # Edit item
│   │   ├── Search.tsx           # Search with filters
│   │   └── Tags.tsx             # Tag management
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   ├── shortId.ts           # ID generation
│   │   ├── counts.ts            # Count calculation
│   │   ├── export.ts            # ZIP export
│   │   └── import.ts            # ZIP import
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind imports
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Development

### Prerequisites

Node.js 18+ installed via nvm.

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |

---

## Version History

| Version | Status | Key Features |
|---------|--------|--------------|
| v1.0 | Released | Basic inventory: locations, containers, items |
| v1.1 | Released | Photos, search, export/import, PWA |
| v2.0 | In Progress | UI redesign: two-tab home, entity cards with item counts, collapsible sections, overflow menus, breadcrumb icons, tags system, unassigned items (Phases 12-14 complete)
