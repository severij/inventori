# Inventori UI Design Specification

**Last Updated:** Phase 33 - Image Lightbox Preview (COMPLETED ✅)

This document contains ASCII representations of all UI components, pages, and layouts for the Inventori app redesign.

## Current Status

- ✅ **Phase 11 Complete:** Core data model consolidated, build passing with zero TypeScript errors
- ✅ **Phase 12 Complete:** Home page redesigned with two tabs (Locations, Unassigned) and context-sensitive FAB
- ✅ **Phase 13 Complete:** Entity cards show recursive item counts with skeleton loading state
- ✅ **Phase 14 Complete:** View pages have collapsible sections, overflow menus, breadcrumbs with icons
- ✅ **Phase 15 Complete:** Form improvements with collapsible sections, tag input, LocationPicker with drill-down navigation, unassigned items support
- ✅ **Phase 16 Complete:** Tags system (tags page, rename/delete)
- ✅ **Phase 17 Complete:** Navigation polish (back button, consistency)
- ✅ **Phase 18 Complete:** Sub-locations, Item details display (tags + additional info), Settings page, i18n infrastructure
- ✅ **Phase 19 Complete:** Parent location picker for locations, circular reference prevention, location hierarchy management
- ✅ **Phase 20 Complete:** Show unassigned containers in LocationPicker with section headers
- ✅ **Phase 21 Complete:** Accessibility & UI consistency improvements (ARIA, keyboard nav, theme colors)
- ✅ **Phase 23 Complete:** Finnish translation completion (100% coverage)
- ✅ **Phase 25 Complete:** Optional item names with "Unnamed item" fallback display
- ✅ **Phase 26 Complete:** Duplicate/copy item via overflow menu
- ✅ **Phase 27 Complete:** Native camera for photo capture (replaced custom camera UI)
- ✅ **Phase 28 Complete:** Tag input inline "+" add button for mobile
- ✅ **Phase 32 Complete:** Inventory statistics display (home, location, container stats)
- ✅ **Phase 33 Complete:** Image lightbox preview with prev/next navigation

## Design Principles

1. **Clean/Minimal** - Reduce visual clutter, generous whitespace
2. **Mobile-First** - Touch-friendly targets (44px min), responsive
3. **Progressive Disclosure** - Show essential info first, details on demand
4. **Contextual Actions** - Actions appear where needed

---

## Color & Style Tokens

### Button Variants
| Variant | Use Case | Style |
|---------|----------|-------|
| Primary | Main action (Create, Save) | Solid accent, white text |
| Secondary | Alternative (Cancel, Edit) | Outlined, accent border |
| Danger | Destructive (Delete) | Red background/text |
| Ghost | Subtle (breadcrumb links) | Text only, hover underline |

### Spacing Scale
- `4px` - tight (icon to text)
- `8px` - compact (related elements)
- `16px` - comfortable (sections)
- `24px` - spacious (major breaks)

### Accessibility Standards

**Keyboard Navigation:**
- Tab: Move between interactive elements
- Escape: Close modals, menus, pickers
- Arrow keys: Navigate within menus, radio groups
- Enter/Space: Activate buttons, select options

**ARIA Requirements:**
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Menus: `role="menu"` on container, `role="menuitem"` on items
- Buttons: `aria-label` when text is not descriptive (icon-only buttons)
- Form inputs: Associated with labels via `id` and `htmlFor`

**Focus Management:**
- Visible focus indicators on all interactive elements
- Focus trapped within modals when open
- Focus returned to trigger element when modal closes

**Color Contrast:**
- Normal text: 4.5:1 minimum (WCAG AA)
- Large text (18px+ or 14px bold): 3:1 minimum
- Interactive elements: 3:1 minimum against background

### Visual Consistency Standards

**Border Radius:**
- `rounded-lg` - Cards, modals, dropdowns, buttons
- `rounded-md` - Input fields, tags
- `rounded-t-2xl` - Mobile bottom sheets

**Shadows:**
- `shadow-sm` - Subtle elevation (cards)
- `shadow-lg` - Menus, dropdowns, dialogs
- `shadow-2xl` - Mobile bottom sheets (high emphasis)

**Button Padding:**
- Standard buttons: `px-4 py-2 min-h-[44px]`
- Compact buttons: `px-3 py-2`
- Icon buttons: `p-2` (44x44 touch target)

**Hover States:**
- Use `hover:bg-surface-tertiary` (light mode)
- Use `dark:hover:bg-surface-secondary` (dark mode)
- Never use hardcoded gray-* colors

---

## Layout Components

### App Shell
```
┌─────────────────────────────────────┐
│ Header (sticky)                     │
├─────────────────────────────────────┤
│                                     │
│                                     │
│ Main Content                        │
│ (scrollable)                        │
│                                     │
│                                     │
│                               [FAB] │
└─────────────────────────────────────┘
```

### Header
```
┌─────────────────────────────────────┐
│ [←]     Page Title         [🔍] [☰] │
└─────────────────────────────────────┘
  │           │                 │   │
  │           │                 │   └── Hamburger menu
  │           │                 └────── Search button
  │           └──────────────────────── Centered title
  └──────────────────────────────────── Back (to parent)
```

### Header with Overflow Menu (for View Pages)
```
┌─────────────────────────────────────┐
│ [←]     Page Title      [🔍] [⋮] [☰]│
└─────────────────────────────────────┘
                               │
                               └── Page actions menu
                                   ┌──────────┐
                                   │ Edit     │
                                   │ Delete   │
                                   └──────────┘
```

---

## Home Page

### Two-Tab Layout with Stats Bar
```
┌─────────────────────────────────────┐
│         Inventori          [🔍] [☰] │
├─────────────────────────────────────┤
│  📦 142 Items    │   💰 $12,450     │ ← Stats Bar
├─────────────────────────────────────┤
│ [Locations (8)]  [Unassigned (2)]   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📍 Kitchen                │ │
│ │           📍2  📦3  📄5        >│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📍 Garage                 │ │
│ │           📍0  📦2  📄12       >│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📍 Office                 │ │
│ │           📍1  📦0  📄8        >│ │
│ └─────────────────────────────────┘ │
│                                     │
│                                     │
│                        [+ Location] │
└─────────────────────────────────────┘
```

**Stats Bar:**
- Compact horizontal bar above tabs
- Shows global inventory totals
- Two columns: Total Items | Total Value
- Display-only (not clickable)
- Updates when items change or settings change
- Respects `includeInTotal` flag
- Uses user's currency and item counting preferences from Settings

### Unassigned Tab
```
┌─────────────────────────────────────┐
│         Inventori          [🔍] [☰] │
├─────────────────────────────────────┤
│ [Locations (8)]  [Unassigned (2)]   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📄 Mystery Cable          │ │
│ │                                >│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📄 Old Phone              │ │
│ │                           x2   >│ │
│ └─────────────────────────────────┘ │
│                                     │
│                                     │
│                                     │
│                            [+ Item] │
└─────────────────────────────────────┘
```

### Empty States

#### Locations Tab (Empty)
```
┌─────────────────────────────────────┐
│ [Locations (0)]  [Unassigned (0)]   │
├─────────────────────────────────────┤
│                                     │
│                                     │
│              📍                     │
│                                     │
│       No locations yet              │
│                                     │
│   Start by adding your first        │
│   location, like "Garage" or        │
│   "Living Room"                     │
│                                     │
│        [+ Add Location]             │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

#### Unassigned Tab (Empty)
```
┌─────────────────────────────────────┐
│ [Locations (8)]  [Unassigned (0)]   │
├─────────────────────────────────────┤
│                                     │
│                                     │
│              ✓                      │
│                                     │
│     No unassigned items             │
│                                     │
│   All items are organized in        │
│   locations. Nice work!             │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Location View Page

### Full Layout with Stats Card (Phase 32 Updated)
```
┌─────────────────────────────────────┐
│ [←]      Kitchen       [🔍] [☰]     │
├─────────────────────────────────────┤
│                                     │
│ 🏠 Home > 📍 Kitchen                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │     [  Hero Photo  ]            │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Kitchen                        [⋯]  │
│ ID: KZMT-Q7X3 [📋]                  │
│ Main cooking and dining area        │
│                                     │
│ ┌──────────────┬──────────────────┐ │ ← Stats Card
│ │ Total Items  │  Total Value     │ │
│ │     23       │    $1,450        │ │
│ └──────────────┴──────────────────┘ │
│                                     │
│ [+ Add Location]  [+ Add Item]      │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ ▼ Locations (2)                     │ ← Collapsible
│ ┌─────────────────────────────────┐ │
│ │ [img] 📍 Pantry            📋   │ │
│ │           0  3  8              >│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ▼ Contents (5)                      │ ← Collapsible
│ ┌─────────────────────────────────┐ │
│ │ [img] 📦 Refrigerator      📋   │ │
│ │           12 items             >│ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📄 Blender           📋   │ │
│ │                                >│ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Stats Card:**
- 2-column grid layout
- Shows recursive totals (includes sub-locations and their contents)
- Always visible (shows "0 items" and "$0.00" for empty locations)
- Display-only (not clickable)
- Positioned after description, before action buttons
- Respects `includeInTotal` flag and user's calculation preferences

### Location Overflow Menu (⋯)
```
                              ┌──────────┐
                              │ ✏️ Edit   │
                              │ ──────── │
                              │ 🗑️ Delete │ ← Red text
                              └──────────┘
```

### Features (Phase 18)
- ✅ Breadcrumbs show emoji icons (🏠 Home > 📍 Kitchen)
- ✅ Overflow menu in location title header
- ✅ Edit/Delete in overflow menu
- ✅ Sub-locations section collapsible (Phase 18)
- ✅ Contents section collapsible (shows count in title)
- ✅ Contents defaultOpen: true (expanded on load)
- ✅ "+ Add Location" and "+ Add Item" buttons (Phase 18)

---

## Item View Page

### Regular Item (Phase 26 Updated)
```
┌─────────────────────────────────────┐
│ [←]      Blender       [🔍] [☰]     │
├─────────────────────────────────────┤
│                                     │
│ 🏠 Home > 📍 Kitchen > 📄 Blender   │
│                                     │
│ ┌───────┐ ┌───────┐ ┌───────┐       │
│ │ photo │ │ photo │ │ photo │       │ ← Horizontal scroll
│ └───────┘ └───────┘ └───────┘       │
│                                     │
│ Blender                       [⋯]   │
│ ID: ABCD-1234 [📋]                  │
│ Vitamix 5200, black                 │
│ x1                                  │
│                                     │
│ ─────────────────────────────────── │
│ Created: January 15, 2025           │
│ Updated: January 20, 2025           │
└─────────────────────────────────────┘
```

### Unnamed Item (Phase 25)
```
┌─────────────────────────────────────┐
│ [←]   Unnamed item     [🔍] [☰]     │
├─────────────────────────────────────┤
│                                     │
│ 🏠 Home > 📍 Kitchen > 📄 Unnamed item
│                                     │
│ ┌───────┐                           │
│ │ photo │                           │
│ └───────┘                           │
│                                     │
│ Unnamed item                  [⋯]   │  ← Fallback display name
│ ID: ABCD-1234 [📋]                  │
│                                     │
│ ─────────────────────────────────── │
│ Created: January 15, 2025           │
│ Updated: January 20, 2025           │
└─────────────────────────────────────┘
```

**Unnamed item fallback** (Phase 25):
- When `item.name` is undefined/empty, display "Unnamed item" (i18n: `common.unnamedItem`)
- Applied in: EntityCard title, ItemView heading, breadcrumbs, LocationPicker, toast messages
- Items can be created with photos only — name field is optional in ItemForm

**Photo Preview with Lightbox** (Phase 33):
- Photos displayed as horizontal scroll strip of thumbnails (192×192px)
- Tapping any thumbnail opens fullscreen lightbox overlay
- Lightbox features:
  - Full-size image centered on screen with `object-contain`
  - ← / → arrow buttons for prev/next navigation (hidden at boundaries)
  - Dot indicators (● ○ ○) showing current position, clickable to jump to photo
  - ✕ close button (top-right)
  - Escape key and backdrop click both close the overlay
  - Proper object URL lifecycle management (created once, revoked on unmount)
- Memory leak fixed: Previously, new object URLs were created on every render but never revoked

### Container Item - canHoldItems: true (Phase 32 Updated)
```
┌─────────────────────────────────────┐
│ [←]    Refrigerator    [🔍] [☰]     │
├─────────────────────────────────────┤
│                                     │
│ 🏠 Home > 📍 Kitchen > 📦 Refrigerator
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     [  Hero Photo  ]            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Refrigerator                   [⋯]  │
│ ID: WXYZ-5678 [📋]                  │
│ Samsung French Door, stainless      │
│                                     │
│ ┌──────────────┬──────────────────┐ │ ← Stats Card (containers only)
│ │ Total Items  │  Total Value     │ │
│ │     12       │    $180          │ │
│ └──────────────┴──────────────────┘ │
│                                     │
│ [+ Add Item]                        │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ ▼ Contents (12)                     │ ← Collapsible (defaultOpen)
│ ┌─────────────────────────────────┐ │
│ │ [img] 📄 Milk                   │ │
│ │                            x2  >│ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📄 Eggs                   │ │
│ │                           x12  >│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────────────────────────── │
│ Created: January 15, 2025           │
│ Updated: January 20, 2025           │
└─────────────────────────────────────┘
```

**Stats Card (Container Items):**
- Only displayed for items with `canHoldItems: true`
- Shows recursive totals (includes nested containers)
- Positioned after description, before "+ Add Item" button
- Same 2-column grid layout as LocationView stats
- Always visible for containers (shows zeros if empty)

### Features (Phase 26)
- ✅ Breadcrumbs show emoji icons (🏠 Home > 📍 Kitchen > 📄/📦 Item)
- ✅ Overflow menu (⋯) in item title header
- ✅ Edit/Duplicate/Delete in overflow menu
- ✅ Contents section collapsible (for containers only)
- ✅ Contents defaultOpen: true (expanded on load)
- ✅ "+ Add Item" button integrated with container section
- ✅ Unnamed items display "Unnamed item" fallback (Phase 25)
- ✅ "Duplicate" creates a copy with all fields pre-filled (Phase 26)

### Item Overflow Menu (⋮)
```
                              ┌──────────┐
                              │ ✏️ Edit   │
                              │ 📋 Duplicate│  ← Phase 26
                              │ ──────── │
                              │ 🗑️ Delete │  ← Red text
                              └──────────┘
```

**Duplicate flow** (Phase 26):
- Navigates to AddItem with all fields pre-filled (including photos as Blobs via route state)
- User can adjust any field before saving
- Creates new item with fresh ID and timestamps
- Shows "duplicated" toast on save

### Photo Lightbox (Phase 33)

**Mobile/Desktop view:**
```
┌───────────────────────────────────────┐
│ ✕                                     │ ← Close button (top-right)
│                                       │
│                                       │
│   [←]    [Full-size photo]    [→]     │ ← Prev/Next arrows (hidden at boundaries)
│                                       │
│                                       │
│        ●  ○  ○  ○ (dots)              │ ← Position indicators (clickable)
└───────────────────────────────────────┘
     (semi-transparent black background)
```

**Behavior:**
- Fixed-position overlay (z-50) covering full viewport
- Image centered, `object-contain` (preserves aspect ratio, fits screen)
- Clicking backdrop (black area) closes overlay
- Escape key closes overlay
- Prev/Next arrows navigate between photos, hidden when at boundaries
- Dot indicators show current position, clickable to jump to specific photo
- All object URLs created once on mount, properly revoked on unmount

---

## Entity Cards

### Location Card
```
┌─────────────────────────────────────┐
│ [48x48]  📍 Kitchen                 │
│  thumb       12 items              >│
└─────────────────────────────────────┘
          │         │
          │         └── Total recursive item count
          └────────────── Location icon
```

### Container Item Card
```
┌─────────────────────────────────────┐
│ [48x48]  📦 Toolbox                 │
│  thumb       8 items               >│
└─────────────────────────────────────┘
          │         │
          │         └── Total recursive item count
          └───────────── Container icon
```

### Regular Item Card
```
┌─────────────────────────────────────┐
│ [48x48]  📄 Hammer                  │
│  thumb                        x2   >│
└─────────────────────────────────────┘
                                  │
                                  └── Quantity (only if > 1)
```

### Item Card (No Photo)
```
┌─────────────────────────────────────┐
│ ┌──────┐  📄 Screwdriver            │
│ │  📄  │                      x5   >│
│ └──────┘                            │
└─────────────────────────────────────┘
     │
     └── Icon placeholder when no photo
```

### Icon Legend
```
📍 = Location
📦 = Container (item with canHoldItems: true)
📄 = Item (regular item)
```

---

## Search Page

### Initial State
```
┌─────────────────────────────────────┐
│ [←]       Search           [🔍] [☰] │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search...                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│                                     │
│              🔍                     │
│                                     │
│     Search your inventory           │
│                                     │
│   Search by name or description,    │
│   or enter a Label ID               │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### With Results
```
┌─────────────────────────────────────┐
│ [←]       Search           [🔍] [☰] │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 hammer                     ✕ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Type: [All] [Locations] [Items]     │
│ Tags: [tools ✕] [+ Add]             │
│                                     │
│ 3 results                           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📄 Claw Hammer            │ │
│ │       📍 Garage > Toolbox      >│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📄 Ball Peen Hammer       │ │
│ │       📍 Garage > Toolbox      >│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] 📄 Sledgehammer           │ │
│ │       📍 Garage > Wall Hooks   >│ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### ID Exact Match
```
│ ┌─────────────────────────────────┐ │
│ │ 🔍 KZMT-Q7X3                  ✕ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Label ID Match                │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ [img] 📍 Kitchen            │ │ │
│ │ │           📍2  📦3  📄5    >│ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
```

### No Results
```
│ ┌─────────────────────────────────┐ │
│ │ 🔍 xyz123                     ✕ │ │
│ └─────────────────────────────────┘ │
│                                     │
│                                     │
│              😕                     │
│                                     │
│   No results for "xyz123"           │
│                                     │
│   Try a different search term       │
│   or check for typos                │
│                                     │
```

---

## Tags Page

### List View
```
┌─────────────────────────────────────┐
│ [←]        Tags            [🔍] [☰] │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Filter tags...               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ electronics                23  ⋮│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ tools                      15  ⋮│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ seasonal                    8  ⋮│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ to-sell                     3  ⋮│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ kitchen                    12  ⋮│ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Tag Row Actions (⋮ Menu)
```
│ ┌─────────────────────────────────┐ │
│ │ electronics                23  ⋮│ │
│ └─────────────────────────────────┘ │
                                   │
                           ┌───────────┐
                           │ Rename    │
                           │ ───────── │
                           │ Delete    │ ← Red
                           └───────────┘
```

### Empty State
```
┌─────────────────────────────────────┐
│ [←]        Tags            [🔍] [☰] │
├─────────────────────────────────────┤
│                                     │
│                                     │
│              🏷️                     │
│                                     │
│        No tags yet                  │
│                                     │
│   Tags are created when you         │
│   add them to items                 │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## LocationPicker Component

### Mobile - Bottom Sheet

```
Screen:
┌──────────────────────────────────┐
│ (scroll content area)            │
│                                  │
│                                  │
│                                  │ ← Original page content scrollable
│                                  │
├──────────────────────────────────┤ ← Rounded top corners
│ ❌ Location Selection          ✕  │
├──────────────────────────────────┤
│                                  │
│ 📍 Kitchen                    ▼  │ ← Current location (drillable)
│                                  │
│ ┌────────────────────────────────┐│
│ │ [← Back]    Select Kitchen    ││ ← Breadcrumb navigation
│ ├────────────────────────────────┤│
│ │                                ││
│ │ [📍 Bedroom]              [▼]  ││ ← Has children - drillable
│ │ [📍 Garage]               [▼]  ││
│ │ [📍 Attic]                [▼]  ││
│ │                                ││
│ │ [❌] Unassigned            [▼]  ││ ← Always available at top
│ │                                ││
│ │                                ││
│ │                                ││
│ │                                ││
│ │                                ││
│ └────────────────────────────────┘│
│                                  │
└──────────────────────────────────┘

Dimensions:
- Height: 70vh (70% viewport height)
- Rounded corners on top
- Draggable area at top (handle)
```

### Mobile - Drill-down (Inside Location)

```
┌──────────────────────────────────┐
│ ❌ Location Selection          ✕  │
├──────────────────────────────────┤
│                                  │
│ 📍 Kitchen > 📦 Refrigerator   ▼  │ ← Current selection
│                                  │
│ ┌────────────────────────────────┐│
│ │ [← Back]    Select Refrig...  ││
│ ├────────────────────────────────┤│
│ │                                ││
│ │ [📄 Milk]                 [✓]  ││ ← No children - auto-select
│ │ [📄 Eggs]                 [✓]  ││
│ │ [📄 Leftovers]            [✓]  ││
│ │ [📦 Freezer]              [▼]  ││ ← Has children - drillable
│ │                                ││
│ │ [← Go Back] [Select [name]]    ││ ← Manual selection option
│ │                                ││
│ └────────────────────────────────┘│
│                                  │
└──────────────────────────────────┘
```

### Desktop - Modal

```
┌─────────────────────────────────┐
│ ❌ Location Selection          ✕  │
├─────────────────────────────────┤
│                                 │
│ 📍 Kitchen                   ▼  │ ← Current
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [← Back]  Select Kitchen    │ │
│ ├─────────────────────────────┤ │
│ │                             │ │
│ │ [📍 Bedroom]           [▼]  │ │
│ │ [📍 Garage]            [▼]  │ │
│ │ [📍 Attic]             [▼]  │ │
│ │                             │ │
│ │ [❌] Unassigned        [▼]  │ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘

Dimensions:
- Max width: 400px
- Centered on screen
- Fixed position overlay
```

### Desktop - Modal (Inside Location)

```
┌─────────────────────────────────┐
│ ❌ Location Selection          ✕  │
├─────────────────────────────────┤
│                                 │
│ 📍 Kitchen > 📦 Refrig...    ▼  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [← Back]  Select Refrig... │ │
│ ├─────────────────────────────┤ │
│ │                             │ │
│ │ [📄 Milk]             [✓]   │ │
│ │ [📄 Eggs]             [✓]   │ │
│ │ [📄 Leftovers]        [✓]   │ │
│ │ [📦 Freezer]          [▼]   │ │
│ │                             │ │
│ │ [← Go Back] [Select]        │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Features

**Visual Indicators:**
- 📍 Location icon
- 📦 Container/item icon
- ❌ Unassigned (special icon)
- ▼ Indicates item has children (drillable)
- ✓ Indicates no children (auto-select on click)
- ← Back arrow for navigation

**Behavior:**
1. Picker opens at current location (built from ancestors)
2. Click item with children → drill down into that item
3. Click item without children → auto-select and close
4. Click "[← Go Back] [Select]" → manually select current location
5. Click "[← Back]" in breadcrumb → go up one level
6. Click "❌" clear button in ItemForm → set to unassigned
7. Click overlay → close picker without selecting

**Button Types:**
- All interactive buttons use `type="button"` (prevents form submission)
- Overlay click uses `stopPropagation()` to prevent bubbling

---

### Add/Edit Item Form

```
┌─────────────────────────────────────┐
│ [←]      Add Item          [🔍] [☰] │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [ ] This item can hold others   │ │
│ │     Enable for boxes, shelves,  │ │
│ │     drawers, bags, etc.         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Basic Information ─────────────┐ │
│ │                                 │ │
│ │ Name              Quantity *    │ │  ← Name is optional (Phase 25)
│ │ ┌──────────────┐  ┌──────────┐  │ │
│ │ │ Hammer       │  │    3     │  │ │
│ │ └──────────────┘  └──────────┘  │ │
│ │                                 │ │
│ │ Description                     │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │                             │ │ │
│ │ │                             │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ Location (optional)             │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 📍 Kitchen              ▼ ✕│ │ │ ← LocationPicker + Clear button
│ │ └─────────────────────────────┘ │ │
│ │ (Click to select location)      │ │
│ │                                 │ │
│ │ Tags                            │ │
│ │ [electronics ✕] [kitchen ✕]     │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ sea...                      │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ Photos                          │ │
│ │ [📷 Camera]  [📁 Upload]        │ │  ← Camera opens native app (Phase 27)
│ │ ┌───────┐ ┌───────┐             │ │
│ │ │ photo │ │ photo │             │ │
│ │ │   ✕   │ │   ✕   │             │ │
│ │ └───────┘ └───────┘             │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ▶ Additional Information            │ ← Collapsed
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │          Create Item            │ │
│ └─────────────────────────────────┘ │
│              Cancel                 │
│                                     │
└─────────────────────────────────────┘
```

**Location/Parent Selector (LocationPicker):**
- Shows current location path with icon: `📍 Kitchen` or `📦 Toolbox`
- Empty/Unassigned: `(No location selected)`
- Clear button (✕): Only shows if item has a location assigned
- Click trigger to open picker
- Mobile: Opens as 70vh bottom sheet
- Desktop: Opens as centered modal (400px max-width)

### Additional Information Section (Expanded)
```
│ ▼ Additional Information (4 fields) │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │ Purchase Price                  │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ $                           │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ Original price paid for item    │ │
│ │                                 │ │
│ │ Current Value                   │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ $                           │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ Estimated resale/replacement    │ │
│ │                                 │ │
│ │ Date Acquired                   │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ mm/dd/yyyy                  │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ When you acquired this item     │ │
│ │                                 │ │
│ │ [✓] Include in inventory totals │ │
│ │     Include in total value and  │ │
│ │     quantity calculations       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
```

### Tag Input with Autocomplete (Phase 28 Updated)
```
│ Tags                                │
│ [electronics ✕] [kitchen ✕]         │
│ ┌──────────────────────────────[+]┐ │  ← "+" button appears when text entered
│ │ sea...                          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ seasonal (8 items)              │ │
│ │ sealed (2 items)                │ │
│ └─────────────────────────────────┘ │
```

**Tag Input States (Phase 28):**
```
Empty input:
┌─────────────────────────────────────┐
│ Add tags...                         │  ← Full width, fully rounded
└─────────────────────────────────────┘

With text entered:
┌──────────────────────────────┐ ┌──┐
│ sea...                       │ │+ │  ← Accent-colored "+" button
└──────────────────────────────┘ └──┘
  rounded-l-lg                   rounded-r-lg, w-10 h-10

With text + suggestion highlighted:
┌──────────────────────────────┐ ┌──┐
│ sea...                       │ │+ │  ← Tapping adds highlighted suggestion
└──────────────────────────────┘ └──┘
┌─────────────────────────────────────┐
│ ▸ seasonal (8 items)                │  ← Highlighted
│   sealed (2 items)                  │
└─────────────────────────────────────┘
```

- "+" button only visible when `inputValue.trim()` is non-empty
- Button is square (w-10 h-10, matching input height)
- Styled: `bg-accent-500 hover:bg-accent-600 text-white`
- Has `aria-label="Add tag"` and `type="button"`
- Enter key still works on desktop keyboards
- Fixes mobile issue where Enter key blurs input instead of adding tag

### PhotoCapture Component (Phase 27)

Simplified from custom in-browser camera (784 lines) to native camera delegation (160 lines).

```
Photos (2/5)
┌──────────┐ ┌──────────┐
│ [📷]     │ │ [📁]     │
│ Camera   │ │ Upload   │
└──────────┘ └──────────┘

┌───────┐ ┌───────┐
│ photo │ │ photo │
│   ✕   │ │   ✕   │
└───────┘ └───────┘
```

**Camera button behavior:**

| Platform | Camera button | Upload button |
|----------|--------------|---------------|
| Mobile | Opens native camera app | Opens file picker (gallery) |
| Desktop | Opens file picker (with camera if available) | Opens file picker |

**Implementation:**
- Camera: `<input type="file" accept="image/*" capture="environment">` (hidden, triggered by button)
- Upload: `<input type="file" accept="image/*" multiple>` (hidden, triggered by button)
- Both buttons are `type="button"` with `min-h-[44px]` touch targets
- Photo thumbnails show with "✕" remove button overlay (80×80px, separate from lightbox)
- Tapping thumbnail (not the ✕) opens fullscreen lightbox to preview without closing form (Phase 33)
- Max photos configurable via `maxPhotos` prop (default 5)
- Buttons hidden when max photos reached

### Add/Edit Location Form
```
┌─────────────────────────────────────┐
│ [←]    Add Location        [🔍] [☰] │
├─────────────────────────────────────┤
│                                     │
│ Name *                              │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Description                         │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Parent Location                     │
│ ┌─────────────────────────────────┐ │
│ │ None (top-level)              ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Photos                              │
│ [📷 Camera]  [📁 Upload]            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        Create Location          │ │
│ └─────────────────────────────────┘ │
│              Cancel                 │
│                                     │
└─────────────────────────────────────┘
```

---

## Hamburger Menu

```
┌─────────────────────────────────────┐
│         Inventori          [🔍] [☰] │
└─────────────────────────────────────┘
                                   │
                           ┌───────────────┐
                           │ Manage Tags   │
                           │ Settings      │
                           │ ───────────── │
                           │ Install App   │
                           └───────────────┘
```

- Export/Import moved to Settings page (Phase 18)
- "Clear All Data" moved to Settings page (Phase 18)

---

## Breadcrumbs

### Format
```
📍 Home > 📍 Kitchen > 📦 Refrigerator > 📄 Leftovers
   │         │            │                │
   │         │            │                └── Current (not clickable)
   │         │            └───────────────── Container item (clickable)
   │         └────────────────────────────── Location (clickable)
   └──────────────────────────────────────── Home link (clickable)
```

### Mobile (Truncated)
```
📍 ... > 📦 Refrigerator > 📄 Leftovers
```

---

## Collapsible Section Component

### Collapsed State
```
─────────────────────────────────────
 ▼ Section Title
─────────────────────────────────────
(content is hidden, height: 0)
```

### Expanded State
```
─────────────────────────────────────
 ▼ Section Title
─────────────────────────────────────
 
 (section content)
 Item 1
 Item 2
 Item 3
 
─────────────────────────────────────
```

### Features
- Click anywhere on header to toggle
- Smooth 300ms height animation
- Unicode chevron (▼) rotates 180° when collapsed
- Top border-t for visual separation
- No count badge in title


---

## Tabs Component

### Active Tab Indication
```
┌───────────────┐ ┌───────────────┐
│ Locations (8) │ │ Unassigned (2)│
└───────────────┘ └───────────────┘
 ═══════════════   ─ ─ ─ ─ ─ ─ ─ ─
       │                  │
       │                  └── Inactive (no underline)
       └───────────────────── Active (accent underline)
```

---

## Overflow Menu Component

### Trigger Button
```
[⋯]  ← Three dots emoji
```

### Desktop Menu Dropdown
```
┌──────────────────┐
│ ✏️  Edit         │
│ 📋  Duplicate    │  ← Items only (Phase 26)
│ 🗑️  Delete       │  ← Red text
└──────────────────┘
  ↓ Positioned below button
```

### Mobile Bottom Sheet
```
Screen:
┌──────────────────────────────┐
│  (semi-transparent overlay)  │
│                              │
│  ┌──────────────────────────┐│
│  │                          ││
│  │    ═════════════════     ││ ← Drag handle
│  │    ✏️  Edit              ││
│  │    📋  Duplicate         ││ ← Items only (Phase 26)
│  │    🗑️  Delete            ││ ← Red text
│  │                          ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

### Features
- Desktop: Dropdown (192px wide) positioned bottom-left
- Mobile (<768px): Full-width bottom sheet drawer
- Click outside overlay to close
- Menu items: Emoji icon + label
- Destructive items shown in red
- Automatic close after selection


---

## Confirm Dialog

### Delete Confirmation
```
┌─────────────────────────────────────┐
│                                     │
│         Delete "Kitchen"?           │
│                                     │
│   This will also delete all         │
│   contents (2 locations, 5 items).  │
│   This action cannot be undone.     │
│                                     │
│   ┌─────────┐  ┌─────────────────┐  │
│   │ Cancel  │  │     Delete      │  │
│   └─────────┘  └─────────────────┘  │
│                       │             │
│                       └── Red/danger│
└─────────────────────────────────────┘
```

### Rename Tag Dialog
```
┌─────────────────────────────────────┐
│                                     │
│           Rename Tag                │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ electronics                 │   │
│   └─────────────────────────────┘   │
│                                     │
│   This will update 23 items.        │
│                                     │
│   ┌─────────┐  ┌─────────────────┐  │
│   │ Cancel  │  │     Rename      │  │
│   └─────────┘  └─────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Delete Tag Dialog
```
┌─────────────────────────────────────┐
│                                     │
│      Delete tag "electronics"?      │
│                                     │
│   This tag will be removed from     │
│   23 items. This action cannot      │
│   be undone.                        │
│                                     │
│   ┌─────────┐  ┌─────────────────┐  │
│   │ Cancel  │  │     Delete      │  │
│   └─────────┘  └─────────────────┘  │
│                       │             │
│                       └── Red/danger│
└─────────────────────────────────────┘
```

---

## Toast Notifications

### Success
```
┌─────────────────────────────────────┐
│ ✓  "Kitchen" has been created       │
└─────────────────────────────────────┘
    │
    └── Green accent
```

### Error
```
┌─────────────────────────────────────┐
│ ✕  Failed to save. Please try again │
└─────────────────────────────────────┘
    │
    └── Red accent
```

---

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Full-width cards
- Tabs stack if needed
- FAB positioned bottom-right

### Tablet (640px - 1024px)
- Max content width: 640px
- Centered content
- Same layout as mobile

### Desktop (> 1024px)
- Max content width: 896px
- Centered content
- Larger touch targets optional

---

## Accessibility Notes

1. **Minimum touch targets**: 44x44px
2. **Focus indicators**: Visible ring on all interactive elements
3. **Color contrast**: WCAG AA compliant
4. **Screen readers**: Proper ARIA labels on icons and buttons
5. **Keyboard navigation**: Tab order follows visual order
6. **Skip links**: "Skip to main content" at top
7. **Focus trap**: In dialogs and menus

---

## Navigation Behavior

### Back Button (←)
The back button in the header navigates to the **parent in hierarchy**, not browser back:

```
ItemView (child item)
  ← back → ItemView (parent item with canHoldItems)
    ← back → LocationView (parent location)
      ← back → LocationView (parent location)
        ← back → Home
```

### Browser Back
Browser back button navigates to **previous page in history** (normal browser behavior).

### After Save
When saving an item/location, use `navigate(path, { replace: true })` to skip the edit page on browser back:

```
Before save:
  Home → LocationView → EditLocation

After save (with replace):
  Home → LocationView  ← browser back goes here

Instead of:
  Home → LocationView → EditLocation ← would go here without replace
```

---

## FAB (Floating Action Button)

### Position
```
                                     ┐
                                      │ 16px from edge
                        [+ Button]   ─┘
─────────────────────────────────────┘
                          16px from bottom
```

### Context-Sensitive Text
| Page | Active Tab | FAB Text |
|------|------------|----------|
| Home | Locations | "+ Location" |
| Home | Unassigned | "+ Item" |
| LocationView | - | Both buttons visible (not FAB) |
| ItemView (canHoldItems) | - | "+ Item" button visible |
| ItemView (regular) | - | No FAB |

---

## Loading States

### Spinner
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              ◌                      │
│           Loading...                │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### Skeleton Cards
```
┌─────────────────────────────────────┐
│ [░░░░]  ░░░░░░░░░░░░                │
│         ░░░░░░░░                   >│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [░░░░]  ░░░░░░░░░░░░░░              │
│         ░░░░░░                     >│
└─────────────────────────────────────┘
```

---

## Settings Page

Accessible via hamburger menu → Settings. All settings persist in localStorage.

### Settings Page Layout

```
┌─────────────────────────────────────┐
│ ← Settings                        ⋮ │
├─────────────────────────────────────┤
│                                     │
│ ◾ APPEARANCE                        │
│                                     │
│ Theme                               │
│ ◉ System default  ◯ Light ◯ Dark    │
│                                     │
│ ◾ REGIONAL                          │
│                                     │
│ Language                            │
│ [English           ▼]               │
│                                     │
│ Currency                            │
│ [USD               ▼]               │
│                                     │
│ Date Format                         │
│ [System default    ▼]               │
│                                     │
│ ◾ DATA MANAGEMENT                   │
│                                     │
│ ┌──────────────────────────────────┐│
│ │ 📥 Export Data                  ││
│ │ Download a backup of all data   ││
│ └──────────────────────────────────┘│
│                                     │
│ ┌──────────────────────────────────┐│
│ │ 📤 Import Data                  ││
│ │ Restore data from a backup      ││
│ └──────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### ItemView - Additional Information Section

When an item has additional details (purchase price, current value, date acquired, or includeInTotal=false), show collapsible "Additional Information" section:

```
┌─────────────────────────────────────┐
│ ← Item Name                       ⋮ │
├─────────────────────────────────────┤
│                                     │
│ [Photos gallery]                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Item Name                    x2 │ │
│ │ ID: XXXX-XXXX                   │ │
│ │ Description text here...        │ │
│ │                                 │ │
│ │ [electronics] [to-sell]         │ │ ← Tags (clickable)
│ └─────────────────────────────────┘ │
│                                     │
│ ▼ Additional Information            │ ← Collapsible
│ ┌─────────────────────────────────┐ │
│ │ Purchase Price    $49.99        │ │ ← Formatted currency
│ │ Current Value     $25.00        │ │ ← Only shown if set
│ │ Date Acquired     Jan 15, 2024  │ │ ← Formatted date
│ │ Include in Totals No            │ │ ← Only shown if false
│ └─────────────────────────────────┘ │
│                                     │
│ ▼ Contents (3)                      │ ← If canHoldItems
│ ├── [📦] Toolbox                    │
│ ├── [📄] Hammer                     │
│ └── [📄] Wrench                     │
│                                     │
│ Created: February 1, 2026           │
│ Updated: February 3, 2026           │
│                                     │
└─────────────────────────────────────┘
```

### Tag Chips in ItemView

Tags appear as clickable chips below the item description. Clicking a tag navigates to the Search page with that tag filter applied.

```
[electronics] [to-sell] [fragile]
```

Each chip styling:
- Background: accent-100 (light blue/purple)
- Text: accent-700 (darker shade)
- Hover: accent-200 (slightly darker background)
- Padding: compact (4px 8px)
- Rounded corners
- Cursor: pointer
- Click navigates to: `/search?tags={tagname}` (uses repeated `tags` parameter format)

---