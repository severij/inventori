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

---

## Next Steps (Phase 20+)

### Phase 20: Complete i18n Migration (Optional)

Migrate all remaining UI strings to i18n:
- Home.tsx, LocationView.tsx, ItemView.tsx
- AddLocation.tsx, EditLocation.tsx, AddItem.tsx, EditItem.tsx
- LocationForm.tsx, ItemForm.tsx
- Search.tsx, Tags.tsx
- All other UI components

### Phase 21: Finnish Translation Completion (Optional)

Complete and review Finnish translations for all UI strings.

### Phase 22: Additional Features (Optional)

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
