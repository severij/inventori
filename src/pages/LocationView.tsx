import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EntityCard } from '../components/EntityCard';
import { IdDisplay } from '../components/IdDisplay';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { OverflowMenu, type MenuItem } from '../components/OverflowMenu';
import { DetailSkeleton, CardListSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useLocation } from '../hooks/useLocations';
import { useChildren } from '../hooks/useChildren';
import { useChildLocations } from '../hooks/useChildLocations';
import { useAncestors } from '../hooks/useAncestors';
import { deleteLocation } from '../db/locations';
import { useToast } from '../contexts/ToastContext';

/**
 * Get menu items for location overflow menu
 */
function getLocationMenuItems(
  locationId: string,
  navigate: ReturnType<typeof useNavigate>,
  setShowDeleteDialog: (show: boolean) => void
): MenuItem[] {
  return [
    {
      id: 'edit',
      label: 'Edit',
      icon: '✏️',
      onClick: () => navigate(`/edit/location/${locationId}`),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      onClick: () => setShowDeleteDialog(true),
      destructive: true,
    },
  ];
}

/**
 * Location view - View location contents
 */
export function LocationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { location, loading: locationLoading, error: locationError, refetch } = useLocation(id);
  const { locations: childLocations, loading: childLocationsLoading } = useChildLocations(id);
  const { children: childItems, loading: childItemsLoading } = useChildren(id, 'location');
  const { ancestors } = useAncestors(id, 'location');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loading = locationLoading || childLocationsLoading || childItemsLoading;
  const hasChildLocations = childLocations.length > 0;
  const hasChildItems = childItems.length > 0;
  const isEmpty = !hasChildLocations && !hasChildItems;

  const handleDelete = async () => {
    if (!location) return;

    setIsDeleting(true);
    try {
      await deleteLocation(location.id);
      showToast('success', `"${location.name}" has been deleted`);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete location:', err);
      showToast('error', 'Failed to delete location. Please try again.');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  /**
   * Navigate to parent in hierarchy:
   * - If has parent location → Go to parent location
   * - If top-level → Go to Home
   */
  const handleBack = () => {
    if (location?.parentId) {
      navigate(`/location/${location.parentId}`);
    } else {
      navigate('/');
    }
  };

  // Get first photo for display
  const photoUrl = location?.photos?.[0] ? URL.createObjectURL(location.photos[0]) : null;

  return (
    <Layout title={location?.name ?? 'Location'} onBack={handleBack}>
      {/* Loading state */}
      {loading && <DetailSkeleton />}

      {/* Error state */}
      {locationError && (
        <ErrorState
          message={locationError.message || 'Failed to load location'}
          onRetry={refetch}
        />
      )}

      {/* Not found state */}
      {!loading && !locationError && !location && (
        <EmptyState
          icon="🔍"
          title="Location not found"
          description="This location may have been deleted or the link is invalid."
          action={{ label: 'Go Home', to: '/' }}
        />
      )}

      {/* Location content */}
      {!loading && location && (
        <>
          {/* Breadcrumbs */}
          <Breadcrumbs ancestors={ancestors} />

           {/* Location details */}
           <div className="bg-surface rounded-lg shadow-sm border border-border p-4 mb-6">
             {photoUrl && (
               <img
                 src={photoUrl}
                 alt={location.name}
                 className="w-full h-48 object-cover rounded-lg mb-4"
               />
             )}
             <div className="flex items-start justify-between gap-2 mb-2">
               <h2 className="text-xl font-semibold text-content flex-1">{location.name}</h2>
               <OverflowMenu
                 items={getLocationMenuItems(location.id, navigate, setShowDeleteDialog)}
               />
             </div>
             <IdDisplay id={location.id} size="sm" />
              {location.description && (
                <p className="text-content-secondary mt-2">{location.description}</p>
              )}

              {/* Add buttons */}
              <div className="flex gap-3 mt-4">
                <Link
                  to={`/add/location?parentId=${location.id}`}
                  className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium min-h-[44px] flex items-center justify-center"
                >
                  + Add Location
                </Link>
                <Link
                  to={`/add/item?parentId=${location.id}&parentType=location`}
                  className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium min-h-[44px] flex items-center justify-center"
                >
                  + Add Item
                </Link>
              </div>
            </div>

             {/* Child Locations */}
             {childLocationsLoading ? (
               <CardListSkeleton count={1} />
             ) : hasChildLocations ? (
               <CollapsibleSection title="Locations" defaultOpen={true}>
                 <div className="space-y-3">
                   {childLocations.map((childLocation) => (
                     <EntityCard key={childLocation.id} entity={childLocation} entityType="location" />
                   ))}
                 </div>
               </CollapsibleSection>
             ) : null}

             {/* Child Items */}
             {childItemsLoading ? (
               <CardListSkeleton count={2} />
             ) : hasChildItems ? (
               <CollapsibleSection title="Contents" defaultOpen={true}>
                 <div className="space-y-3">
                   {childItems.map((item) => (
                     <EntityCard key={item.id} entity={item} entityType="item" />
                   ))}
                 </div>
               </CollapsibleSection>
             ) : null}

             {/* Empty state */}
             {!childLocationsLoading && !childItemsLoading && isEmpty && (
               <div className="text-center py-8 text-content-tertiary bg-surface-tertiary/50 rounded-lg">
                 <p className="font-medium">This location is empty</p>
                 <p className="text-sm mt-1">Add a location or item to get started</p>
               </div>
             )}
        </>
      )}

        {/* Delete confirmation dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Location"
          message={
            hasChildLocations || hasChildItems
              ? `Are you sure you want to delete "${location?.name}" and all its contents (${childLocations.length} locations, ${childItems.length} items)? This action cannot be undone.`
              : `Are you sure you want to delete "${location?.name}"? This action cannot be undone.`
          }
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDestructive
          confirmDisabled={isDeleting}
        />
    </Layout>
  );
}
