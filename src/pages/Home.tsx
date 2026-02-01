import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { EntityCard } from '../components/EntityCard';
import { CardListSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useLocations } from '../hooks/useLocations';

/**
 * Home page - List all locations
 */
export function Home() {
  const { locations, loading, error, refetch } = useLocations();

  return (
    <Layout title="Inventori">
      {/* Loading state */}
      {loading && <CardListSkeleton count={4} />}

      {/* Error state */}
      {error && (
        <ErrorState
          message={error.message || 'Failed to load locations'}
          onRetry={refetch}
        />
      )}

      {/* Empty state */}
      {!loading && !error && locations.length === 0 && (
        <EmptyState
          icon="📍"
          title="No locations yet"
          description="Start by adding your first location, like &quot;Garage&quot; or &quot;Living Room&quot;"
          action={{ label: 'Add Location', to: '/add/location' }}
        />
      )}

      {/* Location list */}
      {!loading && !error && locations.length > 0 && (
        <div className="space-y-3">
          {locations.map((location) => (
            <EntityCard key={location.id} entity={location} />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {!loading && locations.length > 0 && (
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
      )}
    </Layout>
  );
}
