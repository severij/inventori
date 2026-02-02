import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EntityCard } from '../components/EntityCard';
import { IdDisplay } from '../components/IdDisplay';
import { DetailSkeleton, CardListSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useLocation } from '../hooks/useLocations';
import { useChildren } from '../hooks/useChildren';
import { useAncestors } from '../hooks/useAncestors';
import { deleteLocation } from '../db/locations';
import { useToast } from '../contexts/ToastContext';

/**
 * Location view - View location contents
 */
export function LocationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { location, loading: locationLoading, error: locationError, refetch } = useLocation(id);
  const { children, loading: childrenLoading } = useChildren(id, 'location');
  const { ancestors } = useAncestors(id, 'location');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loading = locationLoading || childrenLoading;
  const hasChildren = children.length > 0;

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

  // Get first photo for display
  const photoUrl = location?.photos?.[0] ? URL.createObjectURL(location.photos[0]) : null;

  return (
    <Layout title={location?.name ?? 'Location'}>
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
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-semibold text-content">{location.name}</h2>
              <IdDisplay id={location.id} size="sm" />
            </div>
            {location.description && (
              <p className="text-content-secondary mt-2">{location.description}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link
                to={`/edit/location/${location.id}`}
                className="flex-1 text-center px-4 py-2 bg-surface-tertiary text-content-secondary rounded-lg hover:bg-surface-secondary transition-colors min-h-[44px] flex items-center justify-center"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors min-h-[44px]"
              >
                Delete
              </button>
            </div>
          </div>

           {/* Add button */}
           <div className="flex gap-2 mb-4">
             <Link
               to={`/add/item?parentId=${location.id}&parentType=location`}
               className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium min-h-[44px] flex items-center justify-center"
             >
               + Add Item
             </Link>
           </div>

           {/* Contents */}
           {childrenLoading ? (
             <CardListSkeleton count={2} />
           ) : hasChildren ? (
             <div className="space-y-3">
               <h3 className="text-sm font-medium text-content-tertiary uppercase tracking-wide">
                 Contents ({children.length})
               </h3>
               {children.map((child) => (
                 <EntityCard key={child.id} entity={child} entityType="item" />
               ))}
             </div>
           ) : (
             <div className="text-center py-8 text-content-tertiary bg-surface-tertiary/50 rounded-lg">
               <p className="font-medium">This location is empty</p>
               <p className="text-sm mt-1">Add an item to get started</p>
             </div>
           )}
        </>
      )}

       {/* Delete confirmation dialog */}
       <ConfirmDialog
         isOpen={showDeleteDialog}
         title="Delete Location"
         message={
           hasChildren
             ? `Are you sure you want to delete "${location?.name}" and all its contents (${children.length} items)? This action cannot be undone.`
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
