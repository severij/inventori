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
import { useContainer } from '../hooks/useContainers';
import { useChildren } from '../hooks/useChildren';
import { useAncestors } from '../hooks/useAncestors';
import { deleteContainer } from '../db/containers';
import { useToast } from '../contexts/ToastContext';

/**
 * Container view - View container contents
 */
export function ContainerView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { container, loading: containerLoading, error: containerError, refetch } = useContainer(id);
  const { containers, items, loading: childrenLoading } = useChildren(id);
  const { ancestors } = useAncestors(id, 'container');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loading = containerLoading || childrenLoading;
  const hasChildren = containers.length > 0 || items.length > 0;

  const handleDelete = async () => {
    if (!container) return;

    setIsDeleting(true);
    try {
      await deleteContainer(container.id);
      showToast('success', `"${container.name}" has been deleted`);
      // Navigate to parent
      navigate(`/${container.parentType}/${container.parentId}`);
    } catch (err) {
      console.error('Failed to delete container:', err);
      showToast('error', 'Failed to delete container. Please try again.');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Get first photo for display
  const photoUrl = container?.photos?.[0] ? URL.createObjectURL(container.photos[0]) : null;

  return (
    <Layout title={container?.name ?? 'Container'}>
      {/* Loading state */}
      {loading && <DetailSkeleton />}

      {/* Error state */}
      {containerError && (
        <ErrorState
          message={containerError.message || 'Failed to load container'}
          onRetry={refetch}
        />
      )}

      {/* Not found state */}
      {!loading && !containerError && !container && (
        <EmptyState
          icon="🔍"
          title="Container not found"
          description="This container may have been deleted or the link is invalid."
          action={{ label: 'Go Home', to: '/' }}
        />
      )}

      {/* Container content */}
      {!loading && container && (
        <>
          {/* Breadcrumbs */}
          <Breadcrumbs ancestors={ancestors} />

          {/* Container details */}
          <div className="bg-surface rounded-lg shadow-sm border border-border p-4 mb-6">
            {photoUrl && (
              <img
                src={photoUrl}
                alt={container.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-semibold text-content">{container.name}</h2>
              <IdDisplay id={container.id} size="sm" />
            </div>
            {container.description && (
              <p className="text-content-secondary mt-2">{container.description}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link
                to={`/edit/container/${container.id}`}
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

          {/* Add buttons */}
          <div className="flex gap-2 mb-4">
            <Link
              to={`/add/container?parentId=${container.id}&parentType=container`}
              className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium min-h-[44px] flex items-center justify-center"
            >
              + Add Container
            </Link>
            <Link
              to={`/add/item?parentId=${container.id}&parentType=container`}
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
                Contents ({containers.length + items.length})
              </h3>
              {containers.map((childContainer) => (
                <EntityCard key={childContainer.id} entity={childContainer} />
              ))}
              {items.map((item) => (
                <EntityCard key={item.id} entity={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-content-tertiary bg-surface-tertiary/50 rounded-lg">
              <p className="font-medium">This container is empty</p>
              <p className="text-sm mt-1">Add a container or item to get started</p>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Container"
        message={
          hasChildren
            ? `Are you sure you want to delete "${container?.name}" and all its contents (${containers.length + items.length} items)? This action cannot be undone.`
            : `Are you sure you want to delete "${container?.name}"? This action cannot be undone.`
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
