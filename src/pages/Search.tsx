import { useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { EntityCard } from '../components/EntityCard';
import { useLocations } from '../hooks/useLocations';
import { useContainers } from '../hooks/useContainers';
import { useItems } from '../hooks/useItems';
import type { Entity } from '../types';

/**
 * Search page - Global search across all entities
 */
export function Search() {
  const [searchTerm, setSearchTerm] = useState('');

  const { locations, loading: locationsLoading } = useLocations();
  const { containers, loading: containersLoading } = useContainers();
  const { items, loading: itemsLoading } = useItems();

  const loading = locationsLoading || containersLoading || itemsLoading;

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
          item.description?.toLowerCase().includes(lowerTerm) ||
          item.category?.toLowerCase().includes(lowerTerm) ||
          item.brand?.toLowerCase().includes(lowerTerm)
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
          <div className="text-gray-500">Loading...</div>
        </div>
      )}

      {/* Initial state - no search term */}
      {!loading && !hasSearchTerm && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">🔍</div>
          <p>Search across all your inventory</p>
          <p className="text-sm mt-1">
            Search by name, description, category, or brand
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && hasSearchTerm && results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">😕</div>
          <p>No results found for "{searchTerm}"</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {/* Results grouped by type */}
      {!loading && hasSearchTerm && results.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <p className="text-sm text-gray-500">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchTerm}"
          </p>

          {/* Locations */}
          {groupedResults.locations.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
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
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
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
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
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
