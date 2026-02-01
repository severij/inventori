import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EntityCard } from '../components/EntityCard';
import { ShortIdDisplay } from '../components/ShortIdDisplay';
import { useContainer } from '../hooks/useContainers';
import { useChildren } from '../hooks/useChildren';
import { useAncestors } from '../hooks/useAncestors';
import { deleteContainer } from '../db/containers';

/**
 * Container view - View container contents
 */
export function ContainerView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { container, loading: containerLoading, error: containerError } = useContainer(id);
  const { containers, items, loading: childrenLoading } = useChildren(id);
  const { ancestors } = useAncestors(id, 'container');

  const loading = containerLoading || childrenLoading;
  const hasChildren = containers.length > 0 || items.length > 0;

  const handleDelete = async () => {
    if (!container) return;

    const confirmMsg = hasChildren
      ? `Delete "${container.name}" and all its contents? This cannot be undone.`
      : `Delete "${container.name}"? This cannot be undone.`;

    if (window.confirm(confirmMsg)) {
      await deleteContainer(container.id);
      // Navigate to parent
      navigate(`/${container.parentType}/${container.parentId}`);
    }
  };

  // Get first photo for display
  const photoUrl = container?.photos?.[0] ? URL.createObjectURL(container.photos[0]) : null;

  return (
    <Layout title={container?.name ?? 'Container'}>
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-content-tertiary">Loading...</div>
        </div>
      )}

      {/* Error state */}
      {containerError && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
          <p>Error: {containerError.message}</p>
        </div>
      )}

      {/* Not found state */}
      {!loading && !containerError && !container && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-content mb-2">Container not found</h2>
          <Link to="/" className="text-accent-600 hover:underline">
            Go back home
          </Link>
        </div>
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
            <h2 className="text-xl font-semibold text-content">{container.name}</h2>
            {container.description && (
              <p className="text-content-secondary mt-1">{container.description}</p>
            )}

            {/* Label ID */}
            {container.shortId && (
              <div className="mt-4 pt-4 border-t border-border">
                <ShortIdDisplay shortId={container.shortId} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link
                to={`/edit/container/${container.id}`}
                className="flex-1 text-center px-4 py-2 bg-surface-tertiary text-content-secondary rounded-lg hover:bg-surface-secondary transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Add buttons */}
          <div className="flex gap-2 mb-4">
            <Link
              to={`/add/container?parentId=${container.id}&parentType=container`}
              className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium"
            >
              + Add Container
            </Link>
            <Link
              to={`/add/item?parentId=${container.id}&parentType=container`}
              className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium"
            >
              + Add Item
            </Link>
          </div>

          {/* Contents */}
          {hasChildren ? (
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
            <div className="text-center py-8 text-content-tertiary">
              <p>This container is empty</p>
              <p className="text-sm">Add a container or item to get started</p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
