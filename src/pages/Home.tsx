import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Tabs } from '../components/Tabs';
import { EntityCard } from '../components/EntityCard';
import { CardListSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useTopLevelLocations } from '../hooks/useLocations';
import { useUnassignedItems } from '../hooks/useItems';

/**
 * Home page - Two-tab layout for Locations and Unassigned items
 */
export function Home() {
  const [activeTab, setActiveTab] = useState('locations');

  // Fetch both tabs in parallel
  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useTopLevelLocations();

  const {
    items: unassignedItems,
    loading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useUnassignedItems();

  const loading = locationsLoading || itemsLoading;
  const error = locationsError || itemsError;

  // Render function for Locations tab
  const renderLocationsTab = () => {
    if (locationsLoading) {
      return <CardListSkeleton count={4} />;
    }

    if (locationsError) {
      return (
        <ErrorState
          message={locationsError.message || 'Failed to load locations'}
          onRetry={refetchLocations}
        />
      );
    }

    if (locations.length === 0) {
      return (
        <EmptyState
          icon="📍"
          title="No locations yet"
          description="Start by adding your first location, like &quot;Garage&quot; or &quot;Living Room&quot;"
          action={{ label: '+ Add Location', to: '/add/location' }}
        />
      );
    }

    return (
      <div className="space-y-3 pb-20">
        {locations.map((location) => (
          <EntityCard
            key={location.id}
            entity={location}
            entityType="location"
          />
        ))}
      </div>
    );
  };

  // Render function for Unassigned tab
  const renderUnassignedTab = () => {
    if (itemsLoading) {
      return <CardListSkeleton count={4} />;
    }

    if (itemsError) {
      return (
        <ErrorState
          message={itemsError.message || 'Failed to load items'}
          onRetry={refetchItems}
        />
      );
    }

    if (unassignedItems.length === 0) {
      return (
        <EmptyState
          icon="✓"
          title="No unassigned items"
          description="All items are organized in locations. Nice work!"
        />
      );
    }

    return (
      <div className="space-y-3 pb-20">
        {unassignedItems.map((item) => (
          <EntityCard key={item.id} entity={item} entityType="item" />
        ))}
      </div>
    );
  };

  return (
    <Layout title="Inventori">
      {/* Two-tab layout */}
      <Tabs
        tabs={[
          {
            id: 'locations',
            label: 'Locations',
            badge: locations.length,
            render: renderLocationsTab,
          },
          {
            id: 'unassigned',
            label: 'Unassigned',
            badge: unassignedItems.length,
            render: renderUnassignedTab,
          },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Context-sensitive FAB - will be enhanced in Phase 12.5 */}
      {!loading && !error && (
        <>
          {activeTab === 'locations' && locations.length > 0 && (
            <Link
              to="/add/location"
              className="fixed bottom-6 right-6 bg-accent-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-accent-700 transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Add location"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Link>
          )}

          {activeTab === 'unassigned' && unassignedItems.length > 0 && (
            <Link
              to="/add/item"
              className="fixed bottom-6 right-6 bg-accent-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-accent-700 transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Add item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Link>
          )}
        </>
      )}
    </Layout>
  );
}
