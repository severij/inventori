import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LocationForm } from '../components/LocationForm';
import { useLocation } from '../hooks/useLocations';
import { updateLocation } from '../db/locations';
import type { CreateLocationInput } from '../types';

/**
 * Edit Location page
 */
export function EditLocation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location, loading, error } = useLocation(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateLocationInput) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateLocation(id, data);
      navigate(`/location/${id}`);
    } catch (err) {
      console.error('Failed to update location:', err);
      alert('Failed to update location. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/location/${id}`);
  };

  return (
    <Layout title="Edit Location">
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
      {!loading && !error && !location && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-content mb-2">Location not found</h2>
          <Link to="/" className="text-accent-600 hover:underline">
            Go back home
          </Link>
        </div>
      )}

      {/* Form */}
      {!loading && location && (
        <LocationForm
          initialValues={location}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </Layout>
  );
}
