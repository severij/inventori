import { useState, useCallback, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { EntityCard } from '../components/EntityCard';
import { useLocations } from '../hooks/useLocations';
import { useContainers } from '../hooks/useContainers';
import { useItems } from '../hooks/useItems';
import { looksLikeShortId, normalizeShortId } from '../utils/shortId';
import { getLocationByShortId } from '../db/locations';
import { getContainerByShortId } from '../db/containers';
import { getItemByShortId } from '../db/items';
import type { Entity } from '../types';

/**
 * Search page - Global search across all entities
 */
export function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [shortIdMatch, setShortIdMatch] = useState<Entity | null>(null);
  const [shortIdSearching, setShortIdSearching] = useState(false);

  const { locations, loading: locationsLoading } = useLocations();
  const { containers, loading: containersLoading } = useContainers();
  const { items, loading: itemsLoading } = useItems();

  const loading = locationsLoading || containersLoading || itemsLoading;

  // Check for shortId exact match when search term looks like a shortId
  useEffect(() => {
    const searchShortId = async () => {
      if (!looksLikeShortId(searchTerm)) {
        setShortIdMatch(null);
        return;
      }

      const normalized = normalizeShortId(searchTerm);
      if (!normalized) {
        setShortIdMatch(null);
        return;
      }

      setShortIdSearching(true);
      try {
        // Check all three stores for a match
        const location = await getLocationByShortId(normalized);
        if (location) {
          setShortIdMatch(location);
          setShortIdSearching(false);
          return;
        }

        const container = await getContainerByShortId(normalized);
        if (container) {
          setShortIdMatch(container);
          setShortIdSearching(false);
          return;
        }

        const item = await getItemByShortId(normalized);
        if (item) {
          setShortIdMatch(item);
          setShortIdSearching(false);
          return;
        }

        setShortIdMatch(null);
      } catch (err) {
        console.error('Short ID search error:', err);
        setShortIdMatch(null);
      } finally {
        setShortIdSearching(false);
      }
    };

    searchShortId();
  }, [searchTerm]);

  // Filter entities based on search term
  const filterEntities = useCallback(
    (term: string): Entity[] => {
      if (!term.trim()) {
        return [];
      }

      const lowerTerm = term.toLowerCase();

      const matchingLocations = locations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(lowerTerm) ||
          loc.description?.toLowerCase().includes(lowerTerm)
      );

      const matchingContainers = containers.filter(
        (container) =>
          container.name.toLowerCase().includes(lowerTerm) ||
          container.description?.toLowerCase().includes(lowerTerm)
      );

      const matchingItems = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerTerm) ||
          item.description?.toLowerCase().includes(lowerTerm)
      );

      return [...matchingLocations, ...matchingContainers, ...matchingItems];
    },
    [locations, containers, items]
  );

  const results = filterEntities(searchTerm);
  const hasSearchTerm = searchTerm.trim().length > 0;

  // Group results by type
  const groupedResults = {
    locations: results.filter((e) => e.type === 'location'),
    containers: results.filter((e) => e.type === 'container'),
    items: results.filter((e) => e.type === 'item'),
  };

  return (
    <Layout title="Search">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search locations, containers, items..."
          autoFocus
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-content-tertiary">Loading...</div>
        </div>
      )}

      {/* Initial state - no search term */}
      {!loading && !hasSearchTerm && (
        <div className="text-center py-12 text-content-tertiary">
          <div className="text-5xl mb-4">🔍</div>
          <p>Search across all your inventory</p>
          <p className="text-sm mt-1">
            Search by name, description, or Label ID
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && !shortIdSearching && hasSearchTerm && results.length === 0 && !shortIdMatch && (
        <div className="text-center py-12 text-content-tertiary">
          <div className="text-5xl mb-4">😕</div>
          <p>No results found for "{searchTerm}"</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {/* Short ID exact match - shown prominently at top */}
      {!loading && shortIdMatch && (
        <div className="mb-6">
          <section className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 border border-green-300 dark:border-green-700">
            <h2 className="text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-3">
              Label ID Match
            </h2>
            <EntityCard entity={shortIdMatch} />
          </section>
        </div>
      )}

      {/* Results grouped by type */}
      {!loading && hasSearchTerm && results.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <p className="text-sm text-content-tertiary">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchTerm}"
          </p>

          {/* Locations */}
          {groupedResults.locations.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-content-tertiary uppercase tracking-wide mb-3">
                Locations ({groupedResults.locations.length})
              </h2>
              <div className="space-y-2">
                {groupedResults.locations.map((entity) => (
                  <EntityCard key={entity.id} entity={entity} />
                ))}
              </div>
            </section>
          )}

          {/* Containers */}
          {groupedResults.containers.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-content-tertiary uppercase tracking-wide mb-3">
                Containers ({groupedResults.containers.length})
              </h2>
              <div className="space-y-2">
                {groupedResults.containers.map((entity) => (
                  <EntityCard key={entity.id} entity={entity} />
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
                  <EntityCard key={entity.id} entity={entity} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Layout>
  );
}
