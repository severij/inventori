import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { EntityCard } from '../components/EntityCard';
import { CardListSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useTags } from '../hooks/useTags';
import { useLocations } from '../hooks/useLocations';
import { useItems } from '../hooks/useItems';
import { looksLikeShortId, normalizeShortId } from '../utils/shortId';
import { getLocation } from '../db/locations';
import { getItem } from '../db/items';
import type { Location, Item } from '../types';

/**
 * Search page - Global search across locations and items with tag filtering
 */
export function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [idMatch, setIdMatch] = useState<Location | Item | null>(null);
  const [idSearching, setIdSearching] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');

  // Get tags from URL query params - memoize to prevent infinite renders
  const urlTagsString = searchParams.getAll('tags').join(',');
  const urlTags = useMemo(() => 
    urlTagsString.split(',').filter(Boolean), 
    [urlTagsString]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(urlTags);

  const { tags: availableTags } = useTags();
  const { locations, loading: locationsLoading } = useLocations();
  const { items, loading: itemsLoading } = useItems();

  const loading = locationsLoading || itemsLoading;

  // Sync URL tags to state
  useEffect(() => {
    setSelectedTags(urlTags);
  }, [urlTags]);

  // Check for ID exact match when search term looks like an ID
  useEffect(() => {
    const searchById = async () => {
      if (!looksLikeShortId(searchTerm)) {
        setIdMatch(null);
        return;
      }

      const normalized = normalizeShortId(searchTerm);
      if (!normalized) {
        setIdMatch(null);
        return;
      }

      setIdSearching(true);
      try {
        // Check locations first
        const location = await getLocation(normalized);
        if (location) {
          setIdMatch(location);
          setIdSearching(false);
          return;
        }

        // Then check items
        const item = await getItem(normalized);
        if (item) {
          setIdMatch(item);
          setIdSearching(false);
          return;
        }

        setIdMatch(null);
      } catch (err) {
        console.error('ID search error:', err);
        setIdMatch(null);
      } finally {
        setIdSearching(false);
      }
    };

    searchById();
  }, [searchTerm]);

  // Filter entities based on search term and tags
  const filterEntities = useCallback(
    (term: string): (Location | Item)[] => {
      const lowerTerm = term.toLowerCase();

      // Filter by search term (name/description)
      const matchingLocations = locations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(lowerTerm) ||
          loc.description?.toLowerCase().includes(lowerTerm)
      );

      const matchingItems = items.filter(
        (item) =>
          (item.name ?? '').toLowerCase().includes(lowerTerm) ||
          item.description?.toLowerCase().includes(lowerTerm)
      );

      let results = [...matchingLocations, ...matchingItems] as (Location | Item)[];

      // Filter by selected tags (items only - locations don't have tags)
      if (selectedTags.length > 0) {
        results = results.filter((entity) => {
          // Locations don't have tags, so filter them out if tags are selected
          if (!('canHoldItems' in entity)) {
            return false;
          }
          // For items, check if they have any of the selected tags
          const item = entity as Item;
          return selectedTags.some((tag) => item.tags.includes(tag));
        });
      }

      return results;
    },
    [locations, items, selectedTags]
  );

  const results = filterEntities(searchTerm);
  const hasSearchTerm = searchTerm.trim().length > 0;
  const hasTagFilters = selectedTags.length > 0;

  // Show results if there's a search term OR tag filters
  const shouldShowResults = hasSearchTerm || hasTagFilters;
  const groupedResults = {
    locations: results.filter((e) => 'parentId' in e && e.parentId === undefined && !('canHoldItems' in e)),
    items: results.filter((e) => 'canHoldItems' in e),
  };

  return (
    <Layout title="Search">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search locations and items..."
          autoFocus
        />
      </div>

      {/* Tag filters */}
      <div className="mb-6 space-y-3">
        {/* Selected tags chips */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center gap-2 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <span>{tag}</span>
                <button
                  onClick={() => {
                    const newTags = selectedTags.filter((t) => t !== tag);
                    setSelectedTags(newTags);
                    if (newTags.length === 0) {
                      navigate('/search');
                    } else {
                      navigate(`/search?${newTags.map((t) => `tags=${encodeURIComponent(t)}`).join('&')}`);
                    }
                  }}
                  className="hover:opacity-70 transition-opacity ml-1"
                  aria-label={`Remove ${tag} filter`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add tag button / tag input */}
        <div className="flex gap-2">
          {!showTagInput ? (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-sm px-3 py-1.5 rounded-lg border border-accent-600 text-accent-600 dark:text-accent-400 dark:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors"
            >
              + Add Tag Filter
            </button>
          ) : (
             <div className="flex gap-2 flex-1">
               <input
                 type="text"
                 value={tagInputValue}
                 onChange={(e) => setTagInputValue(e.target.value.toLowerCase())}
                 placeholder="Type tag name..."
                 className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-600"
                 autoFocus
               />
               <button
                 onClick={() => {
                   if (tagInputValue.trim() && !selectedTags.includes(tagInputValue)) {
                     const newTags = [...selectedTags, tagInputValue];
                     setSelectedTags(newTags);
                     navigate(`/search?${newTags.map((t) => `tags=${encodeURIComponent(t)}`).join('&')}`);
                     setTagInputValue('');
                     setShowTagInput(false);
                   }
                 }}
                 className="px-3 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors min-h-[44px]"
               >
                 Add
               </button>
               <button
                 onClick={() => {
                   setShowTagInput(false);
                   setTagInputValue('');
                 }}
                 className="px-3 py-2 border border-border rounded-lg hover:bg-surface-tertiary transition-colors min-h-[44px]"
               >
                 Cancel
               </button>
             </div>
          )}

           {/* Autocomplete suggestions */}
           {showTagInput && tagInputValue.trim() && (
             <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-lg border border-border shadow-lg z-10 max-w-xs">
               <div className="py-1">
                {availableTags
                  .filter(
                    (t) =>
                      t.tag.toLowerCase().includes(tagInputValue) &&
                      !selectedTags.includes(t.tag)
                  )
                  .slice(0, 5)
                  .map((suggestion) => (
                    <button
                      key={suggestion.tag}
                      onClick={() => {
                        const newTags = [...selectedTags, suggestion.tag];
                        setSelectedTags(newTags);
                        navigate(`/search?${newTags.map((t) => `tags=${encodeURIComponent(t)}`).join('&')}`);
                        setTagInputValue('');
                        setShowTagInput(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-surface-tertiary transition-colors text-sm"
                    >
                      <span className="font-medium">{suggestion.tag}</span>
                      <span className="text-content-secondary ml-2">({suggestion.count})</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && <CardListSkeleton count={3} />}

      {/* Initial state - no search term and no tag filters */}
      {!loading && !hasSearchTerm && !hasTagFilters && (
        <EmptyState
          icon="🔍"
          title="Search your inventory"
          description="Search by name, description, or scan a Label ID"
        />
      )}

      {/* No results */}
      {!loading && !idSearching && shouldShowResults && results.length === 0 && !idMatch && (
        <EmptyState
          icon="😕"
          title={`No results${hasSearchTerm ? ` for "${searchTerm}"` : ' for selected filters'}`}
          description="Try a different search term or check for typos"
        />
      )}

      {/* ID exact match - shown prominently at top */}
      {!loading && idMatch && (
        <div className="mb-6">
          <section className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 border border-green-300 dark:border-green-700">
            <h2 className="text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-3">
              Label ID Match
            </h2>
            <EntityCard 
              entity={idMatch} 
              entityType={'parentId' in idMatch && !('canHoldItems' in idMatch) ? 'location' : 'item'}
            />
          </section>
        </div>
      )}

      {/* Results grouped by type */}
      {!loading && shouldShowResults && results.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <p className="text-sm text-content-tertiary">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
            {hasSearchTerm && ` for "${searchTerm}"`}
            {hasTagFilters && ` matching ${selectedTags.map((t) => `"${t}"`).join(', ')}`}
          </p>

          {/* Locations */}
          {groupedResults.locations.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-content-tertiary uppercase tracking-wide mb-3">
                Locations ({groupedResults.locations.length})
              </h2>
              <div className="space-y-2">
                {groupedResults.locations.map((entity) => (
                  <EntityCard key={entity.id} entity={entity} entityType="location" />
                ))}
              </div>
            </section>
          )}

          {/* Items */}
          {groupedResults.items.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-content-tertiary uppercase tracking-wide mb-3">
                Items ({groupedResults.items.length})
              </h2>
              <div className="space-y-2">
                {groupedResults.items.map((entity) => (
                  <EntityCard key={entity.id} entity={entity} entityType="item" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Layout>
  );
}
