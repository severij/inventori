import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EntityCard } from '../components/EntityCard';
import { ShortIdDisplay } from '../components/ShortIdDisplay';
import { useItem } from '../hooks/useItems';
import { useChildren } from '../hooks/useChildren';
import { useAncestors } from '../hooks/useAncestors';
import { deleteItem } from '../db/items';

/**
 * Item view - View item details
 * If item isContainer, also shows children and add buttons
 */
export function ItemView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { item, loading: itemLoading, error } = useItem(id);
  const { containers, items: childItems, loading: childrenLoading } = useChildren(id);
  const { ancestors } = useAncestors(id, 'item');

  const loading = itemLoading || (item?.isContainer && childrenLoading);
  const hasChildren = containers.length > 0 || childItems.length > 0;

  const handleDelete = async () => {
    if (!item) return;

    const confirmMsg = item.isContainer && hasChildren
      ? `Delete "${item.name}" and all its contents? This cannot be undone.`
      : `Delete "${item.name}"? This cannot be undone.`;

    if (window.confirm(confirmMsg)) {
      await deleteItem(item.id);
      // Navigate to parent or home
      if (item.parentId && item.parentType) {
        navigate(`/${item.parentType}/${item.parentId}`);
      } else {
        navigate('/');
      }
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
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-content-tertiary">Loading...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
          <p>Error: {error.message}</p>
        </div>
      )}

      {/* Not found state */}
      {!loading && !error && !item && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-content mb-2">Item not found</h2>
          <Link to="/" className="text-accent-600 hover:underline">
            Go back home
          </Link>
        </div>
      )}

      {/* Item content */}
      {!loading && item && (
        <>
          {/* Breadcrumbs */}
          <Breadcrumbs ancestors={ancestors} />

          {/* Photo gallery */}
          {item.photos.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
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
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-content">{item.name}</h2>
              {item.quantity > 1 && (
                <span className="bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium px-2 py-1 rounded">
                  x{item.quantity}
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-content-secondary mt-3">{item.description}</p>
            )}

            {/* Label ID */}
            {item.shortId && (
              <div className="mt-4 pt-4 border-t border-border">
                <ShortIdDisplay shortId={item.shortId} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link
                to={`/edit/item/${item.id}`}
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

          {/* Container Contents - only shown for items with isContainer */}
          {item.isContainer && (
            <>
              {/* Add buttons */}
              <div className="flex gap-2 mb-4">
                <Link
                  to={`/add/container?parentId=${item.id}&parentType=item`}
                  className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium"
                >
                  + Add Container
                </Link>
                <Link
                  to={`/add/item?parentId=${item.id}&parentType=item`}
                  className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium"
                >
                  + Add Item
                </Link>
              </div>

              {/* Contents list */}
              {hasChildren ? (
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
                <div className="text-center py-6 text-content-tertiary mb-6 bg-surface-tertiary rounded-lg">
                  <p>This container is empty</p>
                  <p className="text-sm">Add a container or item to get started</p>
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
    </Layout>
  );
}
