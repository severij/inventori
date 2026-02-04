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

**Status: IN PROGRESS**

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

### 18.6 Settings Infrastructure (NEXT STEP)

**Files to create:**
- `src/types/settings.ts` - Settings type definitions
- `src/contexts/SettingsContext.tsx` - Settings state management (localStorage)
- `src/utils/format.ts` - Currency and date formatting utilities

**Changes:**
- Settings stored in localStorage with keys: `inventori-theme`, `inventori-language`, `inventori-currency`, `inventori-dateFormat`
- Default settings: theme='system', language='en', currency='USD', dateFormat='system'

### 18.7 i18n Setup (NEXT STEP)

**Install dependencies:**
```bash
pnpm add i18next react-i18next i18next-browser-languagedetector
```

**Files to create:**
- `src/i18n/index.ts` - i18n configuration
- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/fi.json` - Finnish translations

**Key sections in translation files:**
- `common` - Global UI strings
- `nav` - Navigation items
- `home` - Home page strings
- `settings` - Settings page strings
- `item` - Item-related strings
- `location` - Location-related strings
- `form` - Form labels and messages

### 18.8 Create Settings Page (NEXT STEP)

**`src/pages/Settings.tsx` (NEW):**
- Appearance section: Theme selector (Light/Dark/System)
- Regional section:
  - Language dropdown (English / Suomi)
  - Currency dropdown (USD / EUR)
  - Date Format dropdown (System / DD/MM/YYYY / MM/DD/YYYY / YYYY-MM-DD)
- Data Management section:
  - Export Data button
  - Import Data button

### 18.9 Update App with Settings Route (NEXT STEP)

**`src/App.tsx`:**
- Add `/settings` route
- Wrap app with `<SettingsProvider>`

### 18.10 Update HamburgerMenu (NEXT STEP)

**`src/components/HamburgerMenu.tsx`:**
- Replace "Appearance" option with "Settings" link
- Remove "Export Data" and "Import Data" (moved to Settings page)
- Keep "Manage Tags" link

### 18.11 Update ItemView with Item Details (NEXT STEP)

**`src/pages/ItemView.tsx`:**
- Add tags display (as clickable chips linking to search)
- Add "Additional Information" collapsible section showing:
  - Purchase Price (formatted with currency, only if defined)
  - Current Value (formatted with currency, only if defined)
  - Date Acquired (formatted with date format, only if defined)
  - Include in Totals (shown only when false)

### 18.12 Migrate All UI Strings to i18n (NEXT STEP)

Update components to use `useTranslation()` hook:
- Layout.tsx
- HamburgerMenu.tsx
- Home.tsx
- LocationView.tsx
- ItemView.tsx
- AddLocation.tsx / EditLocation.tsx
- AddItem.tsx / EditItem.tsx
- LocationForm.tsx
- ItemForm.tsx
- Search.tsx
- Tags.tsx
- And all other UI components

### 18.13 Wrap App with Providers (NEXT STEP)

**`src/main.tsx`:**
- Initialize i18n
- Wrap app with SettingsProvider and i18nProvider

**Deliverables:**
- [ ] Settings types defined
- [ ] Settings context created (localStorage)
- [ ] i18n configured with English and Finnish
- [ ] Settings page implemented
- [ ] ItemView displays all item details (tags, additional info)
- [ ] All UI strings migrated to i18n
- [ ] App builds successfully
- [ ] Theme can be changed in Settings
- [ ] Language can be switched between English and Finnish
- [ ] Currency formats correctly in ItemView
- [ ] Dates format according to selected format

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
- [ ] **Phase 18:** Sub-locations and item details (IN PROGRESS)

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
