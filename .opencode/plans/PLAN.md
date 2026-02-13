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
- [ ] **Phase 29+:** Additional features (optional)

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

## Next Steps (Phase 29+)

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
