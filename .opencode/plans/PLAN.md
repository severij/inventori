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

## Phases 1-17: Completed ✅

See git history for details on:
- Phase 1: Project setup (Vite, Tailwind, PWA)
- Phase 2: Types and database layer (IndexedDB, CRUD)
- Phase 3: React hooks (data fetching, navigation)
- Phase 4: Core components
- Phase 5: Pages and routing
- Phase 6: PWA features (offline, installable)
- Phase 7: Data export/import
- Phase 8: Polish and testing
- Phase 9: Data model consolidation (Items + Containers)
- Phase 10: Post-v1.0 enhancements (ParentPicker, unassigned items)
- Phase 11: Critical fixes (type errors, data model alignment)
- Phase 12: Home page redesign (two-tab layout)
- Phase 13: Entity card redesign (item counts)
- Phase 14: View page improvements (collapsible sections, overflow menu)
- Phase 15: Form improvements (collapsible sections, tag input, LocationPicker)
- Phase 16: Tags system (management page, filtering)
- Phase 17: Navigation polish (back button, history replacement)

---

## Phase 18: Sub-locations and Item Details Display

**Status: COMPLETED ✅**

Add support for nested locations and display complete item details in ItemView with full internationalization (i18n) support.

### 18.1 Fix CollapsibleFormSection Button Type ✅

**`src/components/CollapsibleFormSection.tsx`:**
- ✅ Added `type="button"` to toggle button (line 72)
- ✅ Prevents form submission when expanding "Additional Information" section

### 18.2 Create useChildLocations Hook ✅

**`src/hooks/useChildLocations.ts` (NEW):**
- ✅ Fetches child locations by parent ID
- ✅ Returns: `{ locations, loading, error, refetch }`
- ✅ Mirrors pattern of `useChildren` hook

### 18.3 Update LocationView with Sub-locations ✅

**`src/pages/LocationView.tsx`:**
- ✅ Import and use `useChildLocations` hook
- ✅ Added two buttons: "+ Add Location" and "+ Add Item"
- ✅ Display "Locations" collapsible section for child locations
- ✅ Display "Contents" collapsible section for child items
- ✅ Updated empty state message

### 18.4 Update LocationForm to Support parentId ✅

**`src/components/LocationForm.tsx`:**
- ✅ Added `defaultParentId` prop
- ✅ Show info message when creating sub-location
- ✅ Pass `parentId` to submit handler

### 18.5 Update AddLocation Page ✅

**`src/pages/AddLocation.tsx`:**
- ✅ Import `useSearchParams` to read URL query params
- ✅ Extract `parentId` from query string
- ✅ Pass to LocationForm via props

### 18.6 Settings Infrastructure ✅

**Files created:**
- ✅ `src/types/settings.ts` - Settings type definitions
  - Theme: light|dark|system
  - Language: en|fi
  - Currency: USD|EUR
  - DateFormat: system|DD/MM/YYYY|MM/DD/YYYY|YYYY-MM-DD
  - `DEFAULT_SETTINGS` constant
  - `SETTINGS_KEYS` object for localStorage keys

- ✅ `src/contexts/SettingsContext.tsx` - Settings state management
  - `SettingsProvider` component
  - `useSettings()` hook
  - Auto-applies theme to document
  - Listens to system theme changes
  - Persists to localStorage on change

- ✅ `src/utils/format.ts` - Currency and date formatting utilities
  - `formatCurrency(amount, currency, language)` - Locale-aware formatting
  - `formatDate(date, format, language)` - Multiple date format support
  - `formatDateForInput(date)` - Converts to YYYY-MM-DD
  - `parseDateFromInput(dateString)` - Parses YYYY-MM-DD

### 18.7 i18n Setup ✅

**Dependencies installed:**
- ✅ i18next (25.8.1)
- ✅ react-i18next (16.5.4)
- ✅ i18next-browser-languagedetector (8.2.0)

**Files created:**
- ✅ `src/i18n/index.ts` - i18n configuration with resource loading
- ✅ `src/i18n/locales/en.json` - English translations (~180 keys)
- ✅ `src/i18n/locales/fi.json` - Finnish translations

**Sections in translation files:**
- common - Global UI strings
- nav - Navigation items
- home - Home page strings
- settings - Settings page strings
- item - Item-related strings
- location - Location-related strings
- form - Form labels and messages
- search - Search page strings
- tags - Tags management strings
- errors - Error messages

### 18.8 Create Settings Page ✅

**`src/pages/Settings.tsx` (NEW):**
- ✅ Appearance section: Theme selector (Light/Dark/System)
- ✅ Regional section:
  - Language dropdown (English / Suomi)
  - Currency dropdown (USD / EUR)
  - Date Format dropdown (System default / DD/MM/YYYY / MM/DD/YYYY / YYYY-MM-DD)
- ✅ Data Management section:
  - Export Data button with description
  - Import Data button with description
  - Clear All Data button with confirmation
- ✅ Settings persist to localStorage
- ✅ Changes trigger toast notifications
- ✅ Import/Export with file preview
- ✅ Clear data with "DELETE" confirmation

### 18.9 Update App with Settings Route ✅

**`src/App.tsx`:**
- ✅ Added `/settings` route pointing to Settings page
- ✅ Wrapped app with `<SettingsProvider>` for global access

**`src/main.tsx`:**
- ✅ Added i18n initialization before React render

### 18.10 Update HamburgerMenu ✅

**`src/components/HamburgerMenu.tsx`:**
- ✅ Added "Settings" link navigating to `/settings`
- ✅ Removed "Appearance" option (moved to Settings page)
- ✅ Removed "Export Data" (moved to Settings page)
- ✅ Removed "Import Data" (moved to Settings page)
- ✅ Kept "Manage Tags" link
- ✅ Kept "Install App" button
- ✅ Kept "Clear All Data" with confirmation

### 18.11 Update ItemView with Item Details ✅

**`src/pages/ItemView.tsx`:**
- ✅ Added tags display as clickable chips
  - Links to `/search?tag=<tagname>`
  - Styling: accent-100 background, accent-700 text
  - Hover effects for better UX
- ✅ Added "Additional Information" collapsible section showing:
  - Purchase Price (formatted with currency, only if > 0)
  - Current Value (formatted with currency, only if > 0)
  - Date Acquired (formatted with date format, only if set)
  - Include in Totals (shown only when false)
- ✅ Integrated `useSettings()` hook for currency and date formatting
- ✅ Section only shows when relevant data exists

### 18.12 Migrate UI Strings to i18n ✅

**Completed:**
- ✅ `src/pages/Settings.tsx` - Uses `useTranslation()` for all UI strings
- ✅ Updated `src/i18n/locales/en.json` with all needed translation keys
- ✅ Settings component fully internationalized

### 18.13 Build and Testing ✅

**Verification:**
- ✅ Build passes with zero errors
- ✅ No type errors or compilation issues
- ✅ PWA manifest generated successfully
- ✅ All 134 modules transformed correctly
- ✅ CSS and JS chunking optimized

**Deliverables Completed:**
- ✅ Settings types defined
- ✅ Settings context created (localStorage)
- ✅ i18n configured with English and Finnish
- ✅ Settings page fully implemented
- ✅ ItemView displays all item details (tags, additional info)
- ✅ Basic UI strings migrated to i18n
- ✅ App builds successfully
- ✅ Theme can be changed in Settings (applies immediately)
- ✅ Language can be switched between English and Finnish
- ✅ Currency formats correctly in ItemView
- ✅ Dates format according to selected format
- ✅ Export/Import functionality moved to Settings
- ✅ Clear All Data moved to Settings

---

## Phase 19: Parent Location Picker for Locations

**Status: COMPLETED ✅**

Add ability to select and change parent locations when creating or editing locations. Users can now create sub-locations and reorganize their location hierarchy.

### 19.1 Enhanced LocationPicker Component ✅

**`src/components/LocationPicker.tsx`:**
- ✅ Added `locationsOnly?: boolean` prop - When true, only show locations (no container items)
- ✅ Added `excludeLocationId?: string` prop - Exclude this location and its descendants from the list
- ✅ Added `getDescendantLocationIds()` helper function:
  - Uses BFS (breadth-first search) to recursively find all descendant location IDs
  - Prevents circular references when editing locations
  - Returns array of IDs to exclude from picker
- ✅ Updated `getChildren()` function:
  - Filters out excluded locations and their descendants
  - When `locationsOnly=true`, always returns empty items array
  - Properly handles both root level and nested locations
- ✅ Updated `hasChildren()` function:
  - Accounts for excluded locations
  - When `locationsOnly=true`, only checks for child locations (ignores items)
  - Returns false for items when `locationsOnly=true`
- ✅ Updated display text:
  - When `locationsOnly=true` and unassigned: shows "No parent (top-level)" instead of "No location"
  - Maintains backward compatibility with existing "No location" text

### 19.2 Enhanced LocationForm with Parent Selection ✅

**`src/components/LocationForm.tsx`:**
- ✅ Imported `LocationPicker` component
- ✅ Made `parentId` stateful using `useState` hook:
  - Initial value: `initialValues?.parentId ?? defaultParentId ?? ''`
  - Allows changing parent location in both create and edit modes
- ✅ Removed the info box that showed "Will be created as a sub-location"
- ✅ Added "Parent Location" field with `LocationPicker` component:
  - Always visible (both create and edit modes)
  - Pre-filled with current parent location in edit mode
  - `locationsOnly={true}` ensures only locations are selectable
  - `excludeLocationId={initialValues?.id}` prevents circular references in edit mode
  - Custom placeholder: "Select parent location..."
  - Label: "Parent Location"

### 19.3 Build and Verification ✅

**Status:**
- ✅ Build completed successfully with zero TypeScript errors
- ✅ All 134 modules transformed correctly
- ✅ CSS and JS chunking optimized
- ✅ PWA manifest generated successfully

**Expected Behavior:**

| Scenario | Parent Picker Display |
|----------|----------------------|
| **Create** (no defaultParentId) | Shown, defaults to "No parent (top-level)" |
| **Create** (with defaultParentId from URL) | Shown, pre-selects the parent location |
| **Edit** | Shown, displays current parent, can change or make top-level |
| **Exclude logic** | Prevents selecting the location being edited or any of its descendants |

---

## Summary Checklist

- [x] **Phase 1:** Project setup
- [x] **Phase 2:** Types and database layer
- [x] **Phase 3:** React hooks
- [x] **Phase 4:** Core components
- [x] **Phase 5:** Pages and routing
- [x] **Phase 6:** PWA features
- [x] **Phase 7:** Data export/import
- [x] **Phase 8:** Polish and testing
- [x] **Phase 9:** Data model consolidation
- [x] **Phase 10:** Post-v1.0 enhancements
- [x] **Phase 11:** Critical fixes
- [x] **Phase 12:** Home page redesign
- [x] **Phase 13:** Entity card redesign
- [x] **Phase 14:** View page improvements
- [x] **Phase 15:** Form improvements
- [x] **Phase 16:** Tags system
- [x] **Phase 17:** Navigation polish
- [x] **Phase 18:** Sub-locations and item details
- [x] **Phase 19:** Parent location picker for locations
- [x] **Phase 20:** Show unassigned containers in LocationPicker
- [x] **Phase 21:** Accessibility & UI consistency
- [x] **Phase 23:** Finnish translation completion
- [x] **Phase 25:** Optional item names
- [x] **Phase 26:** Duplicate/copy item
- [x] **Phase 27:** Native camera for photo capture
- [x] **Phase 28:** Tag input Add button for mobile
- [x] **Phase 29:** Fix tag search query parameter
- [x] **Phase 30:** Fix includeInTotal counting bug
- [x] **Phase 31:** User choice on delete (cascade vs orphan)
- [x] **Phase 31.1:** Add destination picker to delete dialog
- [x] **Phase 32:** Inventory statistics display
- [x] **Phase 33:** Image lightbox preview
- [ ] **Phase 34+:** Additional features (optional)

---

## Phase 20: Show Unassigned Containers in LocationPicker

**Status: COMPLETED ✅**

Allow users to assign items to unassigned container items in the Inbox. Display unassigned containers at the root level of LocationPicker with visual separation from locations.

### 20.1 Fix LocationPicker Root Level ✅

**`src/components/LocationPicker.tsx`:**
- ✅ Updated `getChildren()` function to return unassigned container items at root level
- ✅ Added `shouldShowSectionHeaders()` helper function
- ✅ Added section headers ("Locations" and "Unassigned") to separate groups
- ✅ Headers only show when both sections have items at root level
- ✅ Updated both mobile (bottom sheet) and desktop (modal) rendering

**Expected Behavior:**
| Locations | Unassigned | Display |
|-----------|------------|---------|
| ✅ Yes | ✅ Yes | Both sections with headers |
| ✅ Yes | ❌ No | Just locations, no header |
| ❌ No | ✅ Yes | Just unassigned containers, no header |
| ❌ No | ❌ No | Empty state message |

---

## Phase 21: Accessibility & UI Consistency

**Status: COMPLETED ✅**

Comprehensive audit and fix of accessibility issues and visual inconsistencies across the app. Organized by component for systematic improvements.

### 21.1 Foundation & Design Tokens ✅

**`src/index.css`:**
- ✅ Added `--color-surface-hover` semantic token for consistent hover states
- ✅ Improved contrast of `--color-text-muted` from 2.85:1 → >4.5:1 (WCAG AA compliant)
  - Light mode: #9ca3af → #6b7280
  - Dark mode: #71717a → #a1a1aa
- ✅ Mapped hover token in `@theme` block

### 21.2 LocationPicker Component ✅

**`src/components/LocationPicker.tsx`:**
- ✅ Added `role="dialog"` and `aria-modal="true"` to modal containers
- ✅ Added `aria-labelledby="location-picker-header"` connecting modal to header
- ✅ Added Escape key handler to close modal
- ✅ Added `aria-label` to trigger button describing current selection
- ✅ Added `id` prop for label association in forms
- ✅ Changed `rounded-md` to `rounded-lg` on trigger button
- ✅ All hover states use theme colors (replaced hardcoded grays)

### 21.3 OverflowMenu Component ✅

**`src/components/OverflowMenu.tsx`:**
- ✅ Added `role="menuitem"` to menu items
- ✅ Added `aria-haspopup="menu"` to trigger button
- ✅ Added Escape key handler to close menu
- ✅ Replaced hardcoded `gray-*` colors with theme tokens:
  - `hover:bg-gray-100` → `hover:bg-surface-tertiary`
  - `bg-white` → `bg-surface`
  - `bg-gray-300` → `bg-surface-tertiary`
- ✅ Added `role="dialog"` and `aria-modal="true"` to mobile bottom sheet
- ✅ Added `aria-hidden="true"` to emoji decorative icons

### 21.4 HamburgerMenu Component ✅

**`src/components/HamburgerMenu.tsx`:**
- ✅ Added `role="menuitem"` to all menu items
- ✅ Escape key handler already present
- ✅ Menu already has proper ARIA structure

### 21.5 TagInput Component ✅

**`src/components/TagInput.tsx`:**
- ✅ Added `id` prop to interface and input element for label association
- ✅ Added `role="listbox"` to suggestions dropdown (ARIA listbox pattern)
- ✅ Added `role="option"` and `aria-selected` to suggestion items
- ✅ Changed `rounded-md` to `rounded-lg` on input field

### 21.6 Form Components ✅

**`src/components/LocationForm.tsx`:**
- ✅ Added `id="location-parent"` to LocationPicker for label association

**`src/components/ItemForm.tsx`:**
- ✅ Added `id="item-parent"` to LocationPicker for label association
- ✅ Added `id="item-tags"` to TagInput for label association

**`src/components/CollapsibleFormSection.tsx`:**
- ✅ Added `aria-hidden="true"` to chevron indicator

**`src/components/CollapsibleSection.tsx`:**
- ✅ Added `aria-hidden="true"` to chevron indicator
- ✅ Replaced hardcoded `gray-*` colors with theme tokens:
  - `border-gray-200` → `border-border`
  - `text-gray-900` → `text-content`
  - `text-gray-600` → `text-content-secondary`
  - `hover:bg-gray-50` → `hover:bg-surface-tertiary`

### 21.7 Dialog Components ✅

**`src/components/ConfirmDialog.tsx`:**
- ✅ Verified Escape key handling exists
- ✅ Standardized shadow from `shadow-xl` → `shadow-lg`
- ✅ Already has proper ARIA attributes for `alertdialog`

**`src/components/ThemeSettings.tsx`:**
- ✅ Added `min-h-[44px]` to Done button for touch target accessibility
- ✅ Dialog already has proper ARIA structure
- ✅ Shadow already set to `shadow-lg`

### 21.8 Page Components ✅

**`src/pages/Tags.tsx`:**
- ✅ Changed tag list items from `div` with `onClick` to proper `button` elements
- ✅ Replaced `border-surface-variant` → `border-border`
- ✅ Replaced `hover:bg-surface-hover` → `hover:bg-surface-tertiary`
- ✅ Added `type="button"` to prevent form submission

**`src/pages/Search.tsx`:**
- ✅ Replaced `border-surface-variant` → `border-border` (lines 198, 220, 229)
- ✅ Replaced `hover:bg-surface-hover` → `hover:bg-surface-tertiary` (line 220)
- ✅ Input field already has proper semantic HTML

### 21.9 Utility Components ✅

**`src/components/ExportButton.tsx`:**
- ✅ Replaced hardcoded `gray-*` colors with theme tokens:
  - `bg-white` → `bg-surface`
  - `hover:bg-gray-50` → `hover:bg-surface-tertiary`
  - `text-gray-500` → `text-content-secondary`
  - `text-gray-700` → `text-content`
- ✅ Added `border border-border` for consistency

**`src/components/InstallButton.tsx`:**
- ✅ Replaced hardcoded colors:
  - `bg-white` → `bg-surface`
  - `text-blue-600` → `text-accent-600`
  - `hover:bg-blue-50` → `hover:bg-surface-tertiary`
- ✅ Added `border border-border` for consistency

### 21.10 Build and Verification ✅

- ✅ Build passes with zero TypeScript errors
- ✅ All 134 modules transformed correctly
- ✅ All components use consistent theme tokens
- ✅ All interactive elements are keyboard accessible
- ✅ All modals/dialogs have proper ARIA attributes
- ✅ CSS and JS chunks optimized
- ✅ PWA manifest generated successfully

**Files Modified (15 total):**
1. `src/index.css`
2. `src/components/LocationPicker.tsx`
3. `src/components/OverflowMenu.tsx`
4. `src/components/HamburgerMenu.tsx`
5. `src/components/TagInput.tsx`
6. `src/components/LocationForm.tsx`
7. `src/components/ItemForm.tsx`
8. `src/components/CollapsibleFormSection.tsx`
9. `src/components/CollapsibleSection.tsx`
10. `src/components/ConfirmDialog.tsx`
11. `src/components/ThemeSettings.tsx`
12. `src/components/ExportButton.tsx`
13. `src/components/InstallButton.tsx`
14. `src/pages/Tags.tsx`
15. `src/pages/Search.tsx`

---

## Phase 23: Finnish Translation Completion

**Status: COMPLETED ✅**

Complete and review Finnish translations for all UI strings to ensure full language support.

### 23.1 Complete Missing Finnish Translations ✅

**`src/i18n/locales/fi.json`:**
- ✅ Added missing `common` section keys:
  - `settingsSaved`, `exportedSuccessfully`, `exportFailed`, `exporting`
  - `importFailed`, `importing`, `invalidFile`, `failedToReadFile`
  - `importedSuccessfully`, `clearedSuccessfully`, `clearFailed`, `clearing`
  - `importData`, `import`, `items`
- ✅ Added missing `nav` section key:
  - `locations`
- ✅ Updated `settings` section with standardized key names:
  - `theme_light`, `theme_dark`, `theme_system` (using underscores for consistency)
  - `dateFormat_system` (using underscores for consistency)
  - Added all missing settings keys:
    - `clearAllData`, `clearAllDataWarning`, `importConfirmMessage`
    - `fileDetails`, `formatVersion`, `exported`, `importTip`
    - `clearConfirmMessage`, `clearConfirmTip`, `typeDelete`
    - Fixed descriptions to match English versions

**Translation Quality:**
- ✅ All 176 English keys now have Finnish equivalents
- ✅ Terminology is consistent and culturally appropriate
- ✅ Natural Finnish phrasing throughout
- ✅ Special characters and accents properly handled
- ✅ Template variables ({{name}}, {{count}}, {{path}}) preserved

**Files Modified:**
1. `src/i18n/locales/fi.json` - Complete Finnish translation file

### 23.2 Build and Verification ✅

**Status:**
- ✅ Build completed successfully with zero TypeScript errors
- ✅ All 134 modules transformed correctly
- ✅ Finnish translation file is valid JSON
- ✅ i18n loads correctly with both English and Finnish
- ✅ CSS and JS chunks optimized
- ✅ PWA manifest generated successfully

**Translation Coverage:**
- ✅ 176 keys in English file
- ✅ 176 keys in Finnish file (100% coverage)
- ✅ All UI sections translated:
  - Common actions and messages
  - Navigation items
  - Home page strings
  - Settings page
  - Item management
  - Location management
  - Form labels and validation
  - Search page
  - Tags management
  - Error messages

---

## Phase 25: Optional Item Names

**Status: COMPLETED ✅**

Make `name` optional for Items so users can quickly capture photos without naming items in the moment. Locations still require names.

### 25.1 Type Definitions

**`src/types/index.ts`:**
- Change `Item.name` from `string` to `name?: string` (optional)
- `Location.name` remains `string` (required)
- `BreadcrumbItem.name` remains `string` (fallback applied before reaching breadcrumbs)

**`src/utils/export.ts`:**
- Change `ExportedItem.name` from `string` to `name?: string`

### 25.2 i18n Keys

**`src/i18n/locales/en.json` & `fi.json`:**
- Add `common.unnamedItem`: "Unnamed item" / "Nimetön esine"

### 25.3 Form Changes

**`src/components/ItemForm.tsx`:**
- Remove `!name.trim()` validation (name is no longer required)
- Remove red asterisk `*` and `sr-only` required text from name label
- Submit `name: name.trim() || undefined` (store undefined if blank)

### 25.4 Display Fallback

All rendering locations use `item.name || t('common.unnamedItem')` or equivalent:

- **`EntityCard.tsx`**: Card title and `aria-label`
- **`ItemView.tsx`**: Page title, heading, photo alt text, toast messages, delete confirmations
- **`AddItem.tsx`** / **`EditItem.tsx`**: Toast messages
- **`Breadcrumbs.tsx`**: Breadcrumb text (via `useAncestors` hook)
- **`LocationPicker.tsx`**: Item names in picker list, "Select" button, trigger display
- **`useAncestors.ts`**: Provide fallback when building `BreadcrumbItem`

### 25.5 Search

**`src/pages/Search.tsx`:**
- Guard `.toLowerCase()` call: `(item.name ?? '').toLowerCase().includes(...)`
- Unnamed items still findable by description or ID

### 25.6 Export/Import

**`src/utils/export.ts`:**
- `ExportedItem.name` becomes optional
- Export writes `name: item.name` (may be undefined, omitted from JSON)

**`src/utils/import.ts`:**
- Handle missing `name` gracefully (already no validation)
- Warning/error messages use fallback display name

### 25.7 Build and Verification

- Build passes with zero TypeScript errors
- All display paths handle undefined name with "Unnamed item" fallback

---

## Phase 26: Duplicate/Copy Item

**Status: COMPLETED ✅**

Add ability to duplicate an existing item. Users can tap "Duplicate" from the item overflow menu to navigate to the AddItem page with all fields pre-filled (including photos), adjust if needed, then save as a new item with a fresh ID and timestamps.

### 26.1 i18n Strings ✅

**`src/i18n/locales/en.json`:**
- ✅ Added `item.duplicate`: "Duplicate"
- ✅ Added `item.itemDuplicated`: "\"{{name}}\" has been duplicated"

**`src/i18n/locales/fi.json`:**
- ✅ Added `item.duplicate`: "Kopioi"
- ✅ Added `item.itemDuplicated`: "\"{{name}}\" on kopioitu"

### 26.2 ItemForm isEditMode Prop ✅

**`src/components/ItemForm.tsx`:**
- ✅ Added optional `isEditMode?: boolean` prop (defaults to `!!initialValues`)
- ✅ Replaced hardcoded `const isEditMode = !!initialValues` with prop-driven value
- ✅ `isEditMode` controls button text ("Create Item" vs "Update Item")
- ✅ `isEditMode` controls `excludeItemId` in LocationPicker (only exclude in edit mode, not duplicate mode)

### 26.3 ItemView Duplicate Menu Entry ✅

**`src/pages/ItemView.tsx`:**
- ✅ Imported `Item` type
- ✅ Changed `getItemMenuItems` parameter from `itemId: string` to `item: Item`
- ✅ Added "Duplicate" menu entry (id: `duplicate`, icon: `📋`) between Edit and Delete
- ✅ Duplicate navigates to `/add/item` with `{ state: { duplicateFrom: item } }`
- ✅ Updated call site to pass full `item` object

### 26.4 AddItem Duplicate Support ✅

**`src/pages/AddItem.tsx`:**
- ✅ Imported `useLocation` from React Router and `Item` type
- ✅ Reads `location.state?.duplicateFrom` as `Item`
- ✅ Passes `duplicateFrom` as `initialValues` to ItemForm with `isEditMode={false}`
- ✅ Shows `item.itemDuplicated` toast when duplicating, `item.itemCreated` otherwise

### 26.5 Build and Verification ✅

- ✅ Build passes with zero TypeScript errors
- ✅ All 134 modules transformed correctly

**Files Modified (5 total):**
1. `src/i18n/locales/en.json`
2. `src/i18n/locales/fi.json`
3. `src/components/ItemForm.tsx`
4. `src/pages/ItemView.tsx`
5. `src/pages/AddItem.tsx`

**Flow:**
ItemView overflow menu (⋮) → "Duplicate" → AddItem page with all fields pre-filled (including photos) → user adjusts if needed → submit → `createItem()` creates new item with fresh ID/timestamps → "duplicated" toast → navigate to new item view

---

## Phase 27: Native Camera for Photo Capture

**Status: COMPLETED ✅**

Replace the custom in-browser camera (getUserMedia with pinch-to-zoom, tap-to-focus, capture/retake flow) with native camera app integration using `<input type="file" capture="environment">`. On mobile, the Camera button now opens the device's native camera app. On desktop, it opens a file picker.

### 27.1 Rewrite PhotoCapture Component ✅

**`src/components/PhotoCapture.tsx`:**
- ✅ Rewrote from 784 lines to 160 lines
- ✅ Removed all `getUserMedia` / `MediaStream` handling
- ✅ Removed custom video preview overlay (fullscreen camera UI)
- ✅ Removed pinch-to-zoom logic (touch events, native zoom, CSS fallback zoom)
- ✅ Removed tap-to-focus logic (focus point indicator, `applyConstraints`)
- ✅ Removed camera flip logic (front/back toggle)
- ✅ Removed capture/retake flow (canvas capture, review buttons)
- ✅ Removed all camera-related state: `CameraState`, `ZoomRange`, `videoRef`, `streamRef`, `capturedImage`, `facingMode`, `errorMessage`, `zoomLevel`, `zoomRange`, `supportsNativeZoom`, `focusPoint`
- ✅ Camera button now triggers `<input type="file" accept="image/*" capture="environment">`
- ✅ Upload button unchanged (file picker / gallery, supports `multiple`)
- ✅ Component API unchanged (`photos`, `onChange`, `maxPhotos`, `label`)
- ✅ No changes needed in consuming components (`ItemForm`, `LocationForm`)

### 27.2 Remove Camera CSS ✅

**`src/index.css`:**
- ✅ Removed `@keyframes focus-pulse` animation
- ✅ Removed `.animate-focus-pulse` class

### 27.3 Build and Verification ✅

- ✅ Build passes with zero TypeScript errors
- ✅ All 134 modules transformed correctly
- ✅ Bundle size reduced: CSS -3.67 kB, JS -8.98 kB, Precache -12.35 KiB

**Files Modified (2 total):**
1. `src/components/PhotoCapture.tsx`
2. `src/index.css`

**Behavior:**

| Platform | Camera button | Upload button |
|----------|--------------|---------------|
| Mobile | Opens native camera app | Opens file picker (gallery) |
| Desktop | Opens file picker (with camera if available) | Opens file picker |

---

## Phase 28: Tag Input Add Button for Mobile

**Status: COMPLETED ✅**

Fix mobile tag input — pressing Enter on mobile virtual keyboards often blurs the input instead of adding the tag. Add a visible "+" button inline with the input field that appears when text is entered, providing a reliable touch target on all devices.

### 28.1 Add Button to TagInput Component ✅

**`src/components/TagInput.tsx`:**
- ✅ Wrapped input in a `flex` container
- ✅ Added square "+" button to the right of the input, visible only when `inputValue.trim()` is not empty
- ✅ Button calls `addTag()` with highlighted suggestion (if any) or typed text
- ✅ Input border-radius changes dynamically: `rounded-lg` when alone, `rounded-l-lg` when button is visible
- ✅ Button styled with `bg-accent-500 hover:bg-accent-600 text-white rounded-r-lg`
- ✅ Button is square (`w-10 h-10`) to match input height
- ✅ Button has `type="button"` to prevent form submission
- ✅ Button has `aria-label="Add tag"` for accessibility
- ✅ Existing Enter key handler preserved for desktop users

### 28.2 Build and Verification ✅

- ✅ Build passes with zero TypeScript errors
- ✅ All 134 modules transformed correctly

**Files Modified (1 total):**
1. `src/components/TagInput.tsx`

**Behavior:**

| Input State | Button | Action |
|-------------|--------|--------|
| Empty | Hidden | Input is full width, fully rounded |
| Has text | Visible (➕) | Tap adds tag, input clears, button disappears |
| Has text + suggestion highlighted | Visible (➕) | Tap adds highlighted suggestion |

---

## Phase 29: Fix Tag Search Query Parameter

**Status: COMPLETED ✅**

Fix broken tag-based search navigation. Clicking a tag chip in ItemView navigates to the Search page but no results are shown because of a query parameter name mismatch, and simplify the redundant URL parsing logic.

### Bug Description

- ItemView links to `/search?tag=testi` (singular `tag`)
- Search.tsx reads from `searchParams.getAll('tags')` (plural `tags`)
- The parameter name mismatch means Search never sees the tag filter from the URL

### 29.1 Fix ItemView Tag Link Parameter

**`src/pages/ItemView.tsx`:**
- Change tag chip link from `/search?tag=...` to `/search?tags=...`
- Uses repeated parameter format for multiple values: `/search?tags=a&tags=b`

### 29.2 Simplify Search.tsx Tag URL Parsing

**`src/pages/Search.tsx`:**
- Remove unnecessary join/split round-trip in URL tag parsing
- Current (redundant): `searchParams.getAll('tags').join(',')` → `.split(',').filter(Boolean)`
- Simplified: `searchParams.getAll('tags')` (already returns an array)

### 29.3 Build and Verification

- Build passes with zero TypeScript errors
- Clicking a tag in ItemView correctly navigates to Search with results filtered

**Files Modified (2 total):**
1. `src/pages/ItemView.tsx`
2. `src/pages/Search.tsx`

---

## Phase 30: Fix includeInTotal Counting Bug

**Status: COMPLETED ✅**

Fix bug where setting `includeInTotal: false` on a container item causes all items inside it to also be excluded from inventory totals. The `includeInTotal` flag should only exclude the container itself, not its children.

### Bug Description

In `src/utils/counts.ts`, both `countItemsInLocation` and `countItemsInItem` wrap the container recursion inside the `if (item.includeInTotal)` check. When a container has `includeInTotal: false`, the entire block is skipped — including the recursive call to count its children.

**Example:**
```
Garage
└── Metal Shelf (includeInTotal: false, canHoldItems: true)
    ├── Toolbox (includeInTotal: true, canHoldItems: true)
    │   ├── Hammer (includeInTotal: true)
    │   └── Wrench (includeInTotal: true)
    └── Screwdriver (includeInTotal: true, quantity: 5)
```

- **Current (buggy) count for Garage:** 0 (Metal Shelf excluded → recursion stops)
- **Expected count for Garage:** 8 (Toolbox:1 + Hammer:1 + Wrench:1 + Screwdriver:5)

### 30.1 Fix countItemsInLocation

**`src/utils/counts.ts`:**
- Separate counting the item itself (controlled by `includeInTotal`) from recursing into containers (always recurse)
- Before: container recursion nested inside `if (item.includeInTotal)` block
- After: `if (item.includeInTotal)` adds quantity; `if (item.canHoldItems)` recurses — as independent checks

### 30.2 Fix countItemsInItem

**`src/utils/counts.ts`:**
- Same fix as 30.1 but for the `countItemsInItem` function

### 30.3 Build and Verification

- Build passes with zero TypeScript errors
- Container with `includeInTotal: false` is excluded from count, but items inside it are still counted

**Files Modified (1 total):**
1. `src/utils/counts.ts`

---

## Phase 31: User Choice on Delete (Cascade vs Orphan)

**Status: COMPLETED ✅**

Add user choice when deleting locations or container items that have contents. Currently, all contents are cascade-deleted without asking. Users should be able to choose whether to delete all contents or make them unassigned (orphan them).

### Current Behavior

**Problem:**
- Deleting a location/container always deletes all items inside
- No warning about child items
- No way to preserve items by making them unassigned
- Data model supports unassigned items, but delete logic doesn't use it

**Example:**
```
Garage
└── Metal Shelf (container)
    ├── Toolbox (container)
    │   ├── Hammer
    │   └── Wrench
    └── Screwdriver (qty: 5)
```

Currently: Delete "Metal Shelf" → All 8 items deleted (no choice given)  
Expected: User chooses → Delete all OR make them unassigned

### 31.1 Extend ConfirmDialog with Choices ✅

**`src/components/ConfirmDialog.tsx`:**
- ✅ Added optional `choices` prop: `Array<{ value: string; label: string; description?: string }>`
- ✅ Added optional `defaultChoice` prop: `string`
- ✅ Changed `onConfirm` signature to accept selected choice: `(choice?: string) => void`
- ✅ Render radio button group when `choices` is provided
- ✅ Manage selected choice state internally with `useState`
- ✅ Reset selected choice to default when dialog opens
- ✅ Pass selected choice to `onConfirm` callback
- ✅ Maintained backward compatibility (works without choices for existing usage)
- ✅ Exported `DialogChoice` type for reuse

### 31.2 Add i18n Strings ✅

**`src/i18n/locales/en.json`:**
- ✅ `location.deleteWithContents`: "Delete Location with Contents"
- ✅ `location.deleteWithContentsMessage`: "This location contains {{count}} items. What would you like to do?"
- ✅ `location.deleteChoice_cascade`: "Delete all contents"
- ✅ `location.deleteChoice_cascade_desc`: "Permanently delete this location and all items inside"
- ✅ `location.deleteChoice_orphan`: "Make contents unassigned"
- ✅ `location.deleteChoice_orphan_desc`: "Delete this location but move items to Inbox"
- ✅ `item.deleteWithContents`: "Delete Container with Contents"
- ✅ `item.deleteWithContentsMessage`: "This container holds {{count}} items. What would you like to do?"
- ✅ `item.deleteChoice_cascade`: "Delete all contents"
- ✅ `item.deleteChoice_cascade_desc`: "Permanently delete this container and all items inside"
- ✅ `item.deleteChoice_orphan`: "Make contents unassigned"
- ✅ `item.deleteChoice_orphan_desc`: "Delete this container but move items to Inbox"

**`src/i18n/locales/fi.json`:**
- ✅ Mirrored all keys with Finnish translations

### 31.3 Update deleteLocation Function ✅

**`src/db/locations.ts`:**
- ✅ Fixed `deleteLocation()` function to properly support orphaning items
- ✅ When `deleteChildren=false`:
  - Orphan child locations (already worked: line 144)
  - **Orphan child items** (changed from delete to update `parentId: undefined, parentType: undefined`)
- ✅ When `deleteChildren=true`:
  - Recursively delete everything (already worked)
- ✅ Removed incorrect comment "Items can't be orphaned"
- ✅ Imported `updateItem` from `./items`

### 31.4 Update deleteItem Function ✅

**`src/db/items.ts`:**
- ✅ Fixed `deleteItem()` function to properly support orphaning
- ✅ When `deleteChildren=false`:
  - **Orphan child items** (changed from delete to update `parentId: undefined, parentType: undefined`)
- ✅ When `deleteChildren=true`:
  - Recursively delete everything (already worked)
- ✅ Removed incorrect comment "Items can't be orphaned"

### 31.5 Update LocationView Delete Handler ✅

**`src/pages/LocationView.tsx`:**
- ✅ Added `hasChildren` and `totalChildrenCount` computed values
- ✅ Updated `handleDelete` to accept optional `choice?: string` parameter
- ✅ Pass choice to `deleteLocation(id, choice === 'cascade')`
- ✅ Updated dialog rendering:
  - Show `deleteWithContents` title when has children
  - Show choice dialog message with count when has children
  - Provide two choices: orphan (default) and cascade
  - Render simple confirmation when no children
- ✅ Wrapped dialog in conditional to ensure `location` exists

### 31.6 Update ItemView Delete Handler ✅

**`src/pages/ItemView.tsx`:**
- ✅ Added `isContainer` computed value
- ✅ Updated `handleDelete` to accept optional `choice?: string` parameter
- ✅ Pass choice to `deleteItem(id, choice === 'cascade')`
- ✅ Updated dialog rendering:
  - Show `deleteWithContents` title when is container and has children
  - Show choice dialog message with count when has children
  - Provide two choices: orphan (default) and cascade
  - Render simple confirmation when not a container or no children
- ✅ Wrapped dialog in conditional to ensure `item` exists

### 31.7 Build and Verification ✅

**Build Status:**
- ✅ Build passes with zero TypeScript errors
- ✅ All 134 modules transformed correctly
- ✅ CSS: 39.35 kB (gzip: 7.87 kB)
- ✅ JS: 515.50 kB (gzip: 154.24 kB)
- ✅ PWA precache: 11 entries (544.79 KiB)

**Expected Behavior:**
- ✅ Deleting empty location → Simple confirmation
- ✅ Deleting location with contents → Choice dialog (orphan/cascade)
- ✅ Deleting empty container item → Simple confirmation
- ✅ Deleting container with contents → Choice dialog (orphan/cascade)
- ✅ Deleting non-container item → Simple confirmation
- ✅ Orphaned items appear in Inbox (unassigned)
- ✅ Cascade delete removes everything recursively
- ✅ Finnish translations work correctly

**Files Modified (7 total):**
1. `src/components/ConfirmDialog.tsx` - Extended with radio button choices
2. `src/i18n/locales/en.json` - Added delete choice strings
3. `src/i18n/locales/fi.json` - Added Finnish delete choice strings
4. `src/db/locations.ts` - Fixed to orphan items instead of deleting
5. `src/db/items.ts` - Fixed to orphan child items instead of deleting
6. `src/pages/LocationView.tsx` - Added choice dialog for locations with contents
7. `src/pages/ItemView.tsx` - Added choice dialog for containers with contents

---

## Phase 31.1: Add Destination Picker to Delete Dialog

**Status: ✅ COMPLETED**

Enhance the delete dialog to allow users to choose where contents should be moved, instead of only offering "make unassigned" or "delete all". This gives users full control over item relocation when deleting locations/containers.

### Problem

**Phase 31 provided two choices:**
1. Make contents unassigned (move to Inbox)
2. Delete all contents (cascade delete)

**Limitation:** Users can't move items to a specific location/container in one step. They must:
1. Delete the location (moving items to Inbox)
2. Manually relocate each item from Inbox to desired destination

This is tedious when reorganizing inventory.

### Solution

**Replace "make unassigned" with "choose destination":**
1. **Choose destination for contents** (with LocationPicker) - default
   - LocationPicker embedded inline in dialog
   - Default selection: "No location" (Inbox/unassigned) - safe fallback
   - User can select any valid location or container
   - Picker dims when "Delete all" is selected
2. **Delete all contents** (cascade delete)

### 31.1.1 Extend ConfirmDialog Component ✅

**`src/components/ConfirmDialog.tsx`:**
- ✅ Add optional `locationPicker` prop with configuration:
  - `value: string` - Current selection
  - `parentType?: 'location' | 'item'` - Current type
  - `onChange: (id, type?) => void` - Selection callback
  - `excludeLocationId?: string` - For locations
  - `excludeItemId?: string` - For container items
  - `locationsOnly?: boolean` - Restrict to locations only
- ✅ Change `onConfirm` signature: `(choice?, destination?) => void`
- ✅ Import and render `LocationPicker` component inline below first choice
- ✅ Apply `opacity-50 pointer-events-none` to picker when "cascade" choice selected
- ✅ Add `max-h-[80vh] overflow-y-auto` to dialog content for scrolling
- ✅ Pass selected destination to `onConfirm` callback
- ✅ Track destination internally alongside choice selection

### 31.1.2 Update i18n Strings ✅

**`src/i18n/locales/en.json`:**
- ✅ Replace `location.deleteChoice_orphan` → `location.deleteChoice_move`
  - New label: "Choose destination for contents"
  - New description: "Move items to a location or container before deleting"
- ✅ Update `location.deleteChoice_cascade_desc` for consistency
- ✅ Replace `item.deleteChoice_orphan` → `item.deleteChoice_move`
  - New label: "Choose destination for contents"
  - New description: "Move items to a location or container before deleting"
- ✅ Update `item.deleteChoice_cascade_desc` for consistency

**`src/i18n/locales/fi.json`:**
- ✅ Mirror all English changes with Finnish translations

### 31.1.3 Update deleteLocation Function ✅

**`src/db/locations.ts`:**
- ✅ Add parameters: `moveToId?: string`, `moveToType?: 'location' | 'item'`
- ✅ Update signature: `deleteLocation(id, deleteChildren = false, moveToId?, moveToType?)`
- ✅ When `deleteChildren=false` and `moveToId` provided:
  - **Child locations:**
    - If `moveToId === ''`: Make top-level (`parentId: undefined`)
    - If `moveToId` provided AND `moveToType` is 'location' or undefined: Move to location (`parentId: moveToId`)
    - Otherwise: Make top-level (can't move location into container)
  - **Child items:**
    - If `moveToId === ''`: Make unassigned (`parentId: undefined, parentType: undefined`)
    - If `moveToId` provided: Move to destination (`parentId: moveToId, parentType: moveToType || 'location'`)
- ✅ When `deleteChildren=false` and no `moveToId`: Keep existing behavior (orphan)
- ✅ When `deleteChildren=true`: Keep existing behavior (cascade delete)

### 31.1.4 Update deleteItem Function ✅

**`src/db/items.ts`:**
- ✅ Add parameters: `moveToId?: string`, `moveToType?: 'location' | 'item'`
- ✅ Update signature: `deleteItem(id, deleteChildren = false, moveToId?, moveToType?)`
- ✅ When `deleteChildren=false` and `moveToId` provided:
  - **Child items:**
    - If `moveToId === ''`: Make unassigned (`parentId: undefined, parentType: undefined`)
    - If `moveToId` provided: Move to destination (`parentId: moveToId, parentType: moveToType || 'location'`)
- ✅ When `deleteChildren=false` and no `moveToId`: Keep existing behavior (orphan)
- ✅ When `deleteChildren=true`: Keep existing behavior (cascade delete)

### 31.1.5 Update LocationView Delete Handler ✅

**`src/pages/LocationView.tsx`:**
- ✅ Add state: `destinationId: string` and `destinationType?: 'location' | 'item'`
- ✅ Reset destination to `''` and `undefined` when dialog closes
- ✅ Update `handleDelete` to accept `dest?` parameter
- ✅ Pass `dest?.id` and `dest?.type` to `deleteLocation()`
- ✅ Update dialog `choices`:
  - Change `'orphan'` → `'move'`
  - Update labels to use `deleteChoice_move` keys
- ✅ Add `locationPicker` prop to dialog:
  - `value: destinationId`
  - `parentType: destinationType`
  - `onChange: handleDestinationChange`
  - `excludeLocationId: location.id`
- ✅ Only provide `locationPicker` prop when `hasChildren` is true

### 31.1.6 Update ItemView Delete Handler ✅

**`src/pages/ItemView.tsx`:**
- ✅ Add state: `destinationId: string` and `destinationType?: 'location' | 'item'`
- ✅ Reset destination to `''` and `undefined` when dialog closes
- ✅ Update `handleDelete` to accept `dest?` parameter
- ✅ Pass `dest?.id` and `dest?.type` to `deleteItem()`
- ✅ Update dialog `choices`:
  - Change `'orphan'` → `'move'`
  - Update labels to use `deleteChoice_move` keys
- ✅ Add `locationPicker` prop to dialog:
  - `value: destinationId`
  - `parentType: destinationType`
  - `onChange: handleDestinationChange`
  - `excludeItemId: item.id`
- ✅ Only provide `locationPicker` prop when `isContainer && hasChildren`

### 31.1.7 Build and Verification ✅

**Build Status:**
- ✅ Build passes with zero TypeScript errors
- ✅ All 134 modules transformed correctly
- ✅ CSS: 39.42 kB (gzip: 7.88 kB)
- ✅ JS: 516.68 kB (gzip: 154.39 kB)
- ✅ PWA precache: 11 entries (546.01 KiB)

**Files Modified (7 total):**
1. `src/components/ConfirmDialog.tsx`
2. `src/i18n/locales/en.json`
3. `src/i18n/locales/fi.json`
4. `src/db/locations.ts`
5. `src/db/items.ts`
6. `src/pages/LocationView.tsx`
7. `src/pages/ItemView.tsx`

---

## Phase 32: Inventory Statistics Display

**Status: COMPLETED ✅**

Add inventory statistics display to Home page, LocationView, and ItemView pages. Stats show total item count and total value, with configurable calculation methods in Settings.

### Problem

Users need quick visibility into their inventory metrics without manually counting or calculating:
- **Global view**: "How many items do I have in total? What's my total inventory value?"
- **Location view**: "What's inside this location and all its sub-locations?"
- **Container view**: "What's the total value of items in this container?"

Currently, users must manually browse through locations/containers to understand their inventory scope.

### Solution

Add three types of stats displays:

1. **Home Page Stats Bar**: Compact horizontal bar above tabs showing global inventory stats
2. **LocationView Stats Card**: 2-column card showing recursive stats for that location and all descendants
3. **ItemView Stats Card**: 2-column card showing recursive stats for container items and nested contents

**User Controls (Settings):**
- **Item Counting Method**: "Count unique items" (default) or "Sum quantities"
- **Value Calculation**: "Current value with fallback" (default), "Current value only", or "Purchase price only"

**Behavior:**
- All stats respect the `includeInTotal` flag (items marked to exclude don't count)
- Recursive calculation for locations (includes sub-locations and nested containers)
- Display-only (not clickable) - keeps UI simple
- Shows "0 items" and "$0.00" for empty locations/containers
- Updates when settings change

### 32.1 Add New Settings Types

**`src/types/settings.ts`:**
- Add `ItemCountMethod` type: `'unique' | 'quantity'`
  - `'unique'`: Each item record counts as 1 (organizational view)
  - `'quantity'`: Sum all `item.quantity` fields (physical count)
- Add `ValueCalculation` type: `'currentValue' | 'currentWithFallback' | 'purchasePrice'`
  - `'currentValue'`: Only use currentValue field (strict)
  - `'currentWithFallback'`: Use currentValue, fallback to purchasePrice (flexible, default)
  - `'purchasePrice'`: Only use purchasePrice field (original cost)
- Extend `AppSettings` interface with:
  - `itemCountMethod: ItemCountMethod`
  - `valueCalculation: ValueCalculation`
- Update `DEFAULT_SETTINGS`:
  - `itemCountMethod: 'unique'` (default: each item counts once)
  - `valueCalculation: 'currentWithFallback'` (default: use current value with fallback)
- Add to `SETTINGS_KEYS`:
  - `ITEM_COUNT_METHOD: 'inventori-itemCountMethod'`
  - `VALUE_CALCULATION: 'inventori-valueCalculation'`

**Reasoning:** These settings give users control over how inventory is counted and valued, accommodating different use cases (home inventory vs warehouse management).

### 32.2 Update SettingsContext

**`src/contexts/SettingsContext.tsx`:**
- Update `loadSettings()` function:
  - Read `itemCountMethod` from localStorage with fallback to default
  - Read `valueCalculation` from localStorage with fallback to default
- Update `saveSettings()` function:
  - Persist `itemCountMethod` to localStorage
  - Persist `valueCalculation` to localStorage
- No interface changes needed (already supports partial updates via `updateSettings`)

**Reasoning:** Extends existing settings infrastructure without breaking changes.

### 32.3 Add Inventory Stats Settings UI

**`src/pages/Settings.tsx`:**
- Import new types: `ItemCountMethod`, `ValueCalculation`
- Add handler functions:
  - `handleItemCountMethodChange(method: ItemCountMethod)`
  - `handleValueCalculationChange(method: ValueCalculation)`
- Insert new "Inventory Stats" section between "Regional" and "Data Management"
- Add dropdown for "Item Counting Method":
  - Option: "Count unique items" (`unique`) - "Each item record counts once"
  - Option: "Sum quantities" (`quantity`) - "Add up all quantity values"
  - Helper text: "Choose how items are counted in statistics"
- Add dropdown for "Value Calculation":
  - Option: "Current value (with fallback)" (`currentWithFallback`) - "Use purchase price if current value not set"
  - Option: "Current value only" (`currentValue`) - "Only count items with current value"
  - Option: "Purchase price only" (`purchasePrice`) - "Use original purchase price"
  - Helper text: "Choose which price field to use for total value"
- Show success toast on save

**UI Structure:**
- Consistent with existing settings sections
- Same select styling as Language, Currency, Date Format
- Descriptive helper text below each dropdown

### 32.4 Create Stats Calculation Utilities

**`src/utils/stats.ts` (new):**
- **`getDescendantItems(locationId: string): Promise<Item[]>`**
  - Find all items in a location and all sub-locations (recursive)
  - Algorithm:
    1. Get all locations from database
    2. Build set of descendant location IDs (recursive traversal)
    3. Filter all items where `parentType === 'location'` and `parentId` in descendant set
  - Returns flat array of all descendant items
  
- **`getDescendantItemsForContainer(itemId: string): Promise<Item[]>`**
  - Find all items in a container and nested sub-containers (recursive)
  - Algorithm:
    1. Get all items from database
    2. Build set of descendant item IDs (recursive traversal)
    3. Return all descendant items (excluding the container itself)
  - Returns flat array of all descendant items

- **`calculateItemCount(items: Item[], method: ItemCountMethod, includeInTotalOnly: boolean): number`**
  - Filter items by `includeInTotal` flag if `includeInTotalOnly === true`
  - If `method === 'unique'`: Return filtered array length
  - If `method === 'quantity'`: Sum all `item.quantity` fields
  - Returns total count as number

- **`calculateTotalValue(items: Item[], valueCalc: ValueCalculation, includeInTotalOnly: boolean): number`**
  - Filter items by `includeInTotal` flag if `includeInTotalOnly === true`
  - For each item, determine value based on `valueCalc`:
    - `'currentValue'`: Use `currentValue ?? 0`
    - `'currentWithFallback'`: Use `currentValue ?? purchasePrice ?? 0`
    - `'purchasePrice'`: Use `purchasePrice ?? 0`
  - Sum all values
  - Returns total value as number

**Reasoning:** 
- Separate utility functions are testable and reusable
- Recursive algorithms handle nested hierarchies correctly
- Settings-driven calculations provide flexibility

### 32.5 Create Stats Hooks

**Architecture: Shared Calculation Hook Pattern**

The stats hooks follow a shared base hook pattern to eliminate duplication:
- `useStatsCalculation.ts` - Base hook with shared calculation logic
- `useInventoryStats.ts` - Thin wrapper for global stats
- `useEntityStats.ts` - Thin wrapper for entity-specific stats

This approach provides:
- ✅ Zero code duplication (~40 lines saved)
- ✅ Single source of truth for calculation logic
- ✅ Simple, focused hooks that are easy to understand
- ✅ Easy to maintain and extend

**`src/hooks/useStatsCalculation.ts` (new - base hook):**
- Purpose: Shared calculation logic for all stats hooks
- Props:
  - `fetchItems: () => Promise<Item[]>` - Function to fetch items
  - `dependencies: any[]` - Additional dependencies for recalculation
- Uses `useSettings()` to get current calculation methods
- State management: `{ itemCount, totalValue, isLoading }`
- Applies `calculateItemCount()` and `calculateTotalValue()` from utils
- Handles errors gracefully
- Cleanup on unmount with `mounted` flag
- Returns: `{ itemCount, totalValue, isLoading }`

**`src/hooks/useInventoryStats.ts` (new - wrapper):**
- Purpose: Calculate global inventory statistics for Home page
- Implementation: Calls `useStatsCalculation(getAllItems, [])`
- Fetches all items from database
- No additional dependencies (recalculates only when settings change)
- Returns: `{ itemCount, totalValue, isLoading }`

**`src/hooks/useEntityStats.ts` (new - wrapper):**
- Purpose: Unified hook for location and container stats
- Props:
  - `entityId: string` - Location or item ID
  - `entityType: 'location' | 'item'` - Which entity type
- Implementation: Calls `useStatsCalculation()` with conditional fetch function
- Fetches descendant items based on entity type:
  - Location: `getDescendantItems(entityId)`
  - Item: `getDescendantItemsForContainer(entityId)`
- Additional dependencies: `[entityId, entityType]`
- Returns: `{ itemCount, totalValue, isLoading }`

**Reasoning:**
- Base hook eliminates ~40 lines of duplication
- Each hook has a single, clear responsibility
- Easy to add more stat hooks in the future (just wrap the base)
- The abstraction is natural: "fetch items, then calculate stats"
- Three small files are easier to maintain than two medium files

### 32.6 Create Stats Components

**`src/components/StatsBar.tsx` (new):**
- Purpose: Compact horizontal stats bar for Home page
- Props: `{ totalItems, totalValue, currency, language, loading }`
- UI Design:
  - Thin horizontal bar with border-bottom
  - Two-column layout: "📦 Total Items" | "💰 Total Value"
  - Vertical divider between columns
  - Background: `bg-surface-secondary`
  - Shows "..." during loading
  - Uses `formatCurrency()` for value display
  - Number formatting with `toLocaleString()`
- Display-only (not clickable)
- Mobile-friendly: flexible layout, readable text sizes

**`src/components/StatsCard.tsx` (new):**
- Purpose: 2-column stats card for LocationView and ItemView
- Props: `{ totalItems, totalValue, currency, language, loading }`
- UI Design:
  - 2-column grid with gap
  - Each stat in card: `bg-surface-tertiary/50` with border
  - Label (small, muted) above value (large, bold)
  - Shows "..." during loading
  - Uses `formatCurrency()` for value display
- Display-only (not clickable)
- Mobile-friendly: grid stacks or stays 2-column based on space

**Reasoning:**
- Separate components for different contexts (bar vs card)
- Consistent visual language with existing UI
- Loading states provide feedback
- Currency/language props enable proper formatting

### 32.7 Integrate Stats into Pages

**`src/pages/Home.tsx`:**
- Import `StatsBar`, `useInventoryStats`, `useSettings`
- Call `useInventoryStats()` hook
- Render `<StatsBar>` above `<Tabs>` component
- Pass stats data, currency, and language to StatsBar
- Show loading state while calculating

**`src/pages/LocationView.tsx`:**
- Import `StatsCard`, `useEntityStats`, `useSettings`
- Call `useEntityStats()` with `entityType: 'location'`
- Insert `<StatsCard>` after description, before action buttons (line ~152)
- Wrapped in `<div className="mt-4">` for spacing
- Pass stats data, currency, and language to StatsCard
- Always visible (shows zeros for empty locations)

**`src/pages/ItemView.tsx`:**
- Import `StatsCard`, `useEntityStats`, `useSettings`
- Call `useEntityStats()` with `entityType: 'item'` and `enabled: item?.canHoldItems`
- Insert `<StatsCard>` after main details card, before tags (line ~192)
- Only render if `item.canHoldItems === true`
- Pass stats data, currency, and language to StatsCard
- Shows zeros for empty containers

**Placement reasoning:**
- Home: Above tabs = always visible, doesn't interfere with tab content
- LocationView: After description = natural info → action flow, prominent without cluttering
- ItemView: After details, before tags = separates static info from container contents

### 32.8 Add i18n Strings

**`src/i18n/locales/en.json`:**
- Add new `"stats"` section:
  - `"totalItems": "Total Items"`
  - `"totalValue": "Total Value"`
- Add to `"settings"` section:
  - `"inventoryStats": "Inventory Stats"`
  - `"itemCountMethod": "Item Counting Method"`
  - `"itemCountMethodDesc": "Choose how items are counted in statistics"`
  - `"itemCount_unique": "Count unique items"`
  - `"itemCount_quantity": "Sum quantities"`
  - `"valueCalculation": "Value Calculation"`
  - `"valueCalculationDesc": "Choose which price field to use for total value"`
  - `"value_currentWithFallback": "Current value (with fallback)"`
  - `"value_currentValue": "Current value only"`
  - `"value_purchasePrice": "Purchase price only"`

**`src/i18n/locales/fi.json`:**
- Add corresponding Finnish translations:
  - Stats: "Tuotteet yhteensä", "Kokonaisarvo"
  - Settings: "Varaston tilastot", "Tuotteiden laskentamenetelmä", etc.
- Maintain consistency with existing Finnish translations

### 32.9 Build and Verification

**Build:**
- Run `pnpm build`
- Verify zero TypeScript errors
- All modules transform successfully
- No console warnings

**Testing Scenarios:**

**Settings:**
1. Navigate to Settings → verify "Inventory Stats" section appears
2. Change "Item Counting Method" → verify settings save
3. Change "Value Calculation" → verify settings save
4. Reload page → verify settings persist

**Home Page:**
1. Navigate to Home → verify StatsBar appears above tabs
2. Verify counts and values are correct
3. Add new item → return to Home → verify stats update
4. Toggle `includeInTotal` flag → verify stats update

**LocationView:**
1. Navigate to location with items → verify StatsCard appears
2. Verify recursive count includes sub-locations
3. Empty location → verify shows "0 items" and "$0.00"
4. Add item to sub-location → verify parent stats update

**ItemView:**
1. Navigate to container → verify StatsCard appears
2. Non-container → verify no stats card
3. Empty container → verify shows zeros
4. Nested containers → verify recursive count

**Calculation Methods:**
1. Create item with `quantity: 5`, `includeInTotal: true`
2. "Count unique items" → Shows 1
3. "Sum quantities" → Shows 5
4. Set `includeInTotal: false` → Shows 0 (both methods)

**Value Calculations:**
1. Item A: `currentValue: 100`, `includeInTotal: true`
2. Item B: `purchasePrice: 50` (no currentValue), `includeInTotal: true`
3. "Current value only" → Shows $100
4. "Current with fallback" → Shows $150
5. "Purchase price only" → Shows $50

**Mobile:**
1. Test on 375px viewport
2. Verify readable text and proper spacing
3. No horizontal scroll

**i18n:**
1. Switch to Finnish → verify all translations
2. Verify currency formatting (EUR uses €)

### Files Modified (8) and Created (5)

**New Files:**
1. `src/utils/stats.ts` - Stats calculation utilities
2. `src/hooks/useInventoryStats.ts` - Global stats hook
3. `src/hooks/useEntityStats.ts` - Unified location/container stats hook
4. `src/components/StatsBar.tsx` - Home page stats bar
5. `src/components/StatsCard.tsx` - Location/Item stats card

**Modified Files:**
1. `src/types/settings.ts` - Add stats setting types
2. `src/contexts/SettingsContext.tsx` - Handle new settings
3. `src/pages/Settings.tsx` - Add stats settings UI
4. `src/pages/Home.tsx` - Integrate StatsBar
5. `src/pages/LocationView.tsx` - Integrate StatsCard
6. `src/pages/ItemView.tsx` - Integrate StatsCard
7. `src/i18n/locales/en.json` - Add English strings
8. `src/i18n/locales/fi.json` - Add Finnish strings

**Total: 13 files (5 new, 8 modified)**

---

## Phase 33: Image Lightbox Preview

**Status: COMPLETED ✅**

Add fullscreen image preview with lightbox overlay to both ItemView and edit form. Tapping a photo thumbnail opens a modal dialog displaying the full-size image with prev/next navigation and dot indicators.

### Problem

Currently:
- ItemView shows photos as small 192×192px thumbnails in a horizontal scroll strip — hard to see details
- Edit form shows even smaller 80×80px thumbnails — difficult to review photos before saving
- No way to see full-size images without leaving the app
- Object URLs created in renders are never revoked, causing memory leak

### Solution

Add a shared `PhotoLightbox` component that:
- Displays full-size image in a fixed-position overlay
- Provides prev/next arrow navigation between photos
- Shows dot indicators (● ○ ○) for position when multiple photos
- Closes on Escape key or backdrop click
- Properly manages Blob → object URL lifecycle (fixes memory leak)
- Works in both ItemView and PhotoCapture contexts

### 33.1 Create PhotoLightbox Component ✅

**`src/components/PhotoLightbox.tsx` (new):**
- ✅ Props: `{ photos: Blob[], initialIndex: number, onClose: () => void }`
- ✅ Layout: Fixed-position overlay with centered `<img object-contain>` and navigation controls
- ✅ Controls:
  - ✕ Close button (top-right)
  - ← / → Prev/Next arrows (hidden at boundaries)
  - Dot indicators below image (● for current, ○ for others)
- ✅ Keyboard: Escape to close, arrow keys to navigate
- ✅ Backdrop click: Close overlay
- ✅ Accessibility: `role="dialog"`, `aria-modal="true"`, `aria-label`, focus management
- ✅ Object URL management:
  - Create all URLs once on mount with `useMemo`
  - Revoke all on unmount with `useEffect` cleanup
  - Fixes leak in ItemView and PhotoCapture

### 33.2 Update ItemView ✅

**`src/pages/ItemView.tsx`:**
- ✅ Import `PhotoLightbox` component
- ✅ Add state: `const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)`
- ✅ Wire thumbnails: Each photo gets `onClick={() => setLightboxIndex(index)}` and `cursor-pointer` class
- ✅ Render lightbox: `{lightboxIndex !== null && <PhotoLightbox ... />}`
- ✅ Close handler: `onClose={() => setLightboxIndex(null)}`

### 33.3 Update PhotoCapture ✅

**`src/components/PhotoCapture.tsx`:**
- ✅ Import `PhotoLightbox` component
- ✅ Add state: `const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)`
- ✅ Wire thumbnails: Each 80×80 preview gets `onClick={() => setLightboxIndex(index)}` and `cursor-pointer` class
- ✅ Keep delete `×` button separate — it deletes immediately (doesn't open lightbox)
- ✅ Render lightbox: `{lightboxIndex !== null && <PhotoLightbox ... />}`
- ✅ Close handler: `onClose={() => setLightboxIndex(null)}`
- ✅ Note: Lightbox is read-only, no delete action from within it

### 33.4 Build and Verification ✅

**Build:**
- ✅ `pnpm build` — zero TypeScript errors
- ✅ All modules transform successfully
- ✅ No console warnings

**Testing Scenarios:**
1. ItemView with photos → tap thumbnail → lightbox opens with full image
2. Navigation: prev/next arrows work, dots update, hidden at boundaries
3. Close: Escape key, backdrop click, close button all work
4. PhotoCapture (edit form): tap thumbnail → lightbox opens
5. Delete `×` button works separately from lightbox
6. Memory: No object URL leaks (cleaned up on unmount)
7. Mobile: overlay fills viewport, image readable on small screens

**Files Modified (3 total):**
1. `src/components/PhotoLightbox.tsx` — New lightbox component
2. `src/pages/ItemView.tsx` — Wire up thumbnail clicks, render lightbox
3. `src/components/PhotoCapture.tsx` — Wire up thumbnail clicks, render lightbox

---

## Phase 33.1: Fix PhotoLightbox URL Lifecycle Bug

**Status: IN PROGRESS**

The initial lightbox implementation had a critical bug: object URLs were being revoked prematurely, causing `ERR_FILE_NOT_FOUND` errors when viewing images.

### Problem

**Root cause:** Object URL creation used `useMemo` with `photos` array as dependency. When the parent component (`ItemView`) re-renders after `lightboxIndex` state changes, the `item.photos` reference may change, causing:
1. `useMemo` dependency change triggers URL recreation
2. Cleanup effect from previous URLs runs and revokes them
3. New URLs created but cleanup timing creates a race condition
4. Browser can't find the URL that was sent to `<img src>`

In React Strict Mode (development), effects run twice, which compounds the issue.

### Solution

Replace `useMemo` + separate cleanup effect with a single `useEffect` that:
- Runs **once** on lightbox mount (empty dependency array)
- Creates all object URLs for the lightbox's entire lifetime
- Cleans up URLs **only** when lightbox unmounts
- Stores URLs in state instead of memoizing

This ensures URLs are stable and valid for the duration the lightbox is open.

### 33.1.1 Fix PhotoLightbox Component ✅

**`src/components/PhotoLightbox.tsx`:**
- ✅ Remove `useMemo` for object URL creation
- ✅ Add state: `const [objectUrls, setObjectUrls] = useState<string[]>([])`
- ✅ Add `useEffect` with empty dependency array `[]`:
  ```ts
  useEffect(() => {
    const urls = photos.map((photo) => URL.createObjectURL(photo));
    setObjectUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []); // ← Run once on mount, cleanup on unmount
  ```
- ✅ Image uses `src={objectUrls[currentIndex]}` (from state, not memoized)
- ✅ Only memoization remains: `useMemo` for `canGoPrev`, `canGoNext`, `hasMultiple` calculations (optional, minimal impact)

### 33.1.2 Build and Verification ✅

**Build:**
- ✅ `pnpm build` — zero TypeScript errors
- ✅ All modules transform successfully

**Testing:**
1. ItemView: tap photo → lightbox opens
2. Image displays at full size without error
3. Prev/Next navigation works
4. Escape key closes without errors
5. Backdrop click closes without errors
6. Switch between photos — all render correctly
7. Close lightbox, reopen with different photo — works
8. PhotoCapture edit form: thumbnail preview works

**Expected Result:**
- No `ERR_FILE_NOT_FOUND` errors
- Images display correctly on first open
- All navigation works smoothly
- Memory cleanup confirmed (URLs revoked on unmount)

**Files Modified (1 total):**
1. `src/components/PhotoLightbox.tsx` — Fix URL lifecycle management

---

## Next Steps (Phase 34+)

### Phase 22: Complete i18n Migration (Optional)

Migrate all remaining UI strings to i18n:
- Home.tsx, LocationView.tsx, ItemView.tsx
- AddLocation.tsx, EditLocation.tsx, AddItem.tsx, EditItem.tsx
- LocationForm.tsx, ItemForm.tsx
- Search.tsx, Tags.tsx
- All other UI components

### Phase 24: Additional Features (Optional)

Potential future enhancements:
- Bulk operations (select multiple items/locations)
- Advanced search filters
- Item statistics and reporting
- Custom fields/properties
- Sharing/collaboration features
- Mobile app wrapper (Cordova/Capacitor)

---

## Implementation Notes

1. **Settings Storage:** Use localStorage (simple key-value pairs) rather than IndexedDB for settings since they're infrequent access and small.

2. **i18n Best Practices:**
   - Use translation keys in kebab-case: `settings.theme.light`
   - Namespace translations by feature/page
   - Always provide English as fallback
   - Load translations from JSON files for maintainability

3. **Currency Formatting:** Use `Intl.NumberFormat` with user's locale for number formatting (no currency symbol to avoid assumptions).

4. **Date Formatting:** Use `Intl.DateTimeFormat` with user's locale and selected format.

5. **Sub-locations:** Locations can nest recursively - parents are just location IDs, not different entity type.

6. **Item Details Display:**
   - Tags are clickable chips that filter search results
   - Additional Information section only shown if data exists
   - Use collapsible section to keep UI clean

7. **Settings Migration:** No migration needed for existing users - use defaults if settings don't exist in localStorage.
