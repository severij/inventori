import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Tabs } from '../components/Tabs';
import { FAB } from '../components/FAB';
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

      {/* Context-sensitive FAB */}
      {activeTab === 'locations' && !locationsError && (
        <FAB
          label="Location"
          to="/add/location"
          iconPath="M12 4.5v15m7.5-7.5h-15"
        />
      )}

      {activeTab === 'unassigned' && !itemsError && (
        <FAB
          label="Item"
          to="/add/item"
          iconPath="M12 4.5v15m7.5-7.5h-15"
        />
      )}
    </Layout>
  );
}
