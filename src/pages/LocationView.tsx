import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EntityCard } from '../components/EntityCard';
import { ShortIdDisplay } from '../components/ShortIdDisplay';
import { useLocation } from '../hooks/useLocations';
import { useChildren } from '../hooks/useChildren';
import { useAncestors } from '../hooks/useAncestors';
import { deleteLocation } from '../db/locations';

/**
 * Location view - View location contents
 */
export function LocationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { location, loading: locationLoading, error: locationError } = useLocation(id);
  const { containers, items, loading: childrenLoading } = useChildren(id);
  const { ancestors } = useAncestors(id, 'location');

  const loading = locationLoading || childrenLoading;
  const hasChildren = containers.length > 0 || items.length > 0;

  const handleDelete = async () => {
    if (!location) return;

    const confirmMsg = hasChildren
      ? `Delete "${location.name}" and all its contents? This cannot be undone.`
      : `Delete "${location.name}"? This cannot be undone.`;

    if (window.confirm(confirmMsg)) {
      await deleteLocation(location.id);
      navigate('/');
    }
  };

  // Get first photo for display
  const photoUrl = location?.photos?.[0] ? URL.createObjectURL(location.photos[0]) : null;

  return (
    <Layout title={location?.name ?? 'Location'}>
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-content-tertiary">Loading...</div>
        </div>
      )}

      {/* Error state */}
      {locationError && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
          <p>Error: {locationError.message}</p>
        </div>
      )}

      {/* Not found state */}
      {!loading && !locationError && !location && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-content mb-2">Location not found</h2>
          <Link to="/" className="text-accent-600 hover:underline">
            Go back home
          </Link>
        </div>
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
            <h2 className="text-xl font-semibold text-content">{location.name}</h2>
            {location.description && (
              <p className="text-content-secondary mt-1">{location.description}</p>
            )}

            {/* Label ID */}
            {location.shortId && (
              <div className="mt-4 pt-4 border-t border-border">
                <ShortIdDisplay shortId={location.shortId} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link
                to={`/edit/location/${location.id}`}
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
              to={`/add/container?parentId=${location.id}&parentType=location`}
              className="flex-1 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium"
            >
              + Add Container
            </Link>
            <Link
              to={`/add/item?parentId=${location.id}&parentType=location`}
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
              {containers.map((container) => (
                <EntityCard key={container.id} entity={container} />
              ))}
              {items.map((item) => (
                <EntityCard key={item.id} entity={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-content-tertiary">
              <p>This location is empty</p>
              <p className="text-sm">Add a container or item to get started</p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
