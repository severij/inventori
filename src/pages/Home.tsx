import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
 * Home page - Two-tab layout for Inbox and Locations
 */
export function Home() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('inbox');

  // Fetch both tabs in parallel
  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useTopLevelLocations();

  const {
    items: inboxItems,
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
          message={locationsError.message || t('errors.failedToLoad')}
          onRetry={refetchLocations}
        />
      );
    }

    if (locations.length === 0) {
      return (
        <EmptyState
          icon="📍"
          title={t('home.locationsEmpty')}
          description={t('home.locationsEmptyDesc')}
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

  // Render function for Inbox tab
  const renderInboxTab = () => {
    if (itemsLoading) {
      return <CardListSkeleton count={4} />;
    }

    if (itemsError) {
      return (
        <ErrorState
          message={itemsError.message || t('errors.failedToLoad')}
          onRetry={refetchItems}
        />
      );
    }

    if (inboxItems.length === 0) {
      return (
        <EmptyState
          icon="📥"
          title={t('home.inboxEmpty')}
          description={t('home.inboxEmptyDesc')}
        />
      );
    }

    return (
      <div className="space-y-3 pb-20">
        {inboxItems.map((item) => (
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
            id: 'inbox',
            label: t('home.inbox'),
            badge: inboxItems.length,
            render: renderInboxTab,
          },
          {
            id: 'locations',
            label: t('home.locations'),
            badge: locations.length,
            render: renderLocationsTab,
          },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Context-sensitive FAB */}
      {activeTab === 'inbox' && !itemsError && (
        <FAB
          label={t('common.add')}
          to="/add/item"
          iconPath="M12 4.5v15m7.5-7.5h-15"
        />
      )}

      {activeTab === 'locations' && !locationsError && (
        <FAB
          label={t('common.add')}
          to="/add/location"
          iconPath="M12 4.5v15m7.5-7.5h-15"
        />
      )}
    </Layout>
  );
}
