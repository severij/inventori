import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { EntityCard } from '../components/EntityCard';
import { useLocations } from '../hooks/useLocations';

/**
 * Home page - List all locations
 */
export function Home() {
  const { locations, loading, error } = useLocations();

  return (
    <Layout title="Inventori">
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading locations...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>Error loading locations: {error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && locations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No locations yet</h2>
          <p className="text-gray-600 mb-6">
            Start by adding your first location, like "Garage" or "Living Room"
          </p>
          <Link
            to="/add/location"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Location
          </Link>
        </div>
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
          className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          aria-label="Add location"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
      )}
    </Layout>
  );
}
