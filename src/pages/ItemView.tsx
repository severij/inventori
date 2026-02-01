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
import { useItem } from '../hooks/useItems';
import { useChildren } from '../hooks/useChildren';
import { useAncestors } from '../hooks/useAncestors';
import { deleteItem } from '../db/items';
import { useToast } from '../contexts/ToastContext';

/**
 * Item view - View item details
 * If item isContainer, also shows children and add buttons
 */
export function ItemView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { item, loading: itemLoading, error, refetch } = useItem(id);
  const { containers, items: childItems, loading: childrenLoading } = useChildren(id);
  const { ancestors } = useAncestors(id, 'item');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loading = itemLoading || (item?.isContainer && childrenLoading);
  const hasChildren = containers.length > 0 || childItems.length > 0;

  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);
    try {
      await deleteItem(item.id);
      showToast('success', `"${item.name}" has been deleted`);
      // Navigate to parent or home
      if (item.parentId && item.parentType) {
        navigate(`/${item.parentType}/${item.parentId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      showToast('error', 'Failed to delete item. Please try again.');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Layout title={item?.name ?? 'Item'}>
      {/* Loading state */}
      {loading && <DetailSkeleton />}

      {/* Error state */}
      {error && (
        <ErrorState
          message={error.message || 'Failed to load item'}
          onRetry={refetch}
        />
      )}

      {/* Not found state */}
      {!loading && !error && !item && (
        <EmptyState
          icon="🔍"
          title="Item not found"
          description="This item may have been deleted or the link is invalid."
          action={{ label: 'Go Home', to: '/' }}
        />
      )}

      {/* Item content */}
      {!loading && item && (
        <>
          {/* Breadcrumbs */}
          <Breadcrumbs ancestors={ancestors} />

          {/* Photo gallery */}
          {item.photos.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {item.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(photo)}
                    alt={`${item.name} photo ${index + 1}`}
                    className="w-48 h-48 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Item details */}
          <div className="bg-surface rounded-lg shadow-sm border border-border p-4 mb-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-content">{item.name}</h2>
                {item.quantity > 1 && (
                  <span className="bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium px-2 py-1 rounded">
                    x{item.quantity}
                  </span>
                )}
              </div>
              <IdDisplay id={item.id} size="sm" />
            </div>

            {item.description && (
              <p className="text-content-secondary mt-2">{item.description}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link
                to={`/edit/item/${item.id}`}
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

          {/* Container Contents - only shown for items with isContainer */}
          {item.isContainer && (
            <>
              {/* Add buttons */}
              <div className="flex gap-2 mb-4">
                <Link
                  to={`/add/container?parentId=${item.id}&parentType=item`}
                  className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium min-h-[44px] flex items-center justify-center"
                >
                  + Add Container
                </Link>
                <Link
                  to={`/add/item?parentId=${item.id}&parentType=item`}
                  className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium min-h-[44px] flex items-center justify-center"
                >
                  + Add Item
                </Link>
              </div>

              {/* Contents list */}
              {childrenLoading ? (
                <CardListSkeleton count={2} />
              ) : hasChildren ? (
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-medium text-content-tertiary uppercase tracking-wide">
                    Contents ({containers.length + childItems.length})
                  </h3>
                  {containers.map((container) => (
                    <EntityCard key={container.id} entity={container} />
                  ))}
                  {childItems.map((childItem) => (
                    <EntityCard key={childItem.id} entity={childItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-content-tertiary mb-6 bg-surface-tertiary/50 rounded-lg">
                  <p className="font-medium">This container is empty</p>
                  <p className="text-sm mt-1">Add a container or item to get started</p>
                </div>
              )}
            </>
          )}

          {/* Metadata */}
          <div className="text-xs text-content-muted space-y-1">
            <p>Created: {formatDate(item.createdAt)}</p>
            <p>Updated: {formatDate(item.updatedAt)}</p>
          </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Item"
        message={
          item?.isContainer && hasChildren
            ? `Are you sure you want to delete "${item?.name}" and all its contents (${containers.length + childItems.length} items)? This action cannot be undone.`
            : `Are you sure you want to delete "${item?.name}"? This action cannot be undone.`
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
