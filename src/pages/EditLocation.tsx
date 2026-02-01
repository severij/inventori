import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LocationForm } from '../components/LocationForm';
import { DetailSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useLocation } from '../hooks/useLocations';
import { updateLocation } from '../db/locations';
import { useToast } from '../contexts/ToastContext';
import type { CreateLocationInput } from '../types';

/**
 * Edit Location page
 */
export function EditLocation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { location, loading, error, refetch } = useLocation(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateLocationInput) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateLocation(id, data);
      showToast('success', 'Location updated successfully');
      navigate(`/location/${id}`);
    } catch (err) {
      console.error('Failed to update location:', err);
      showToast('error', 'Failed to update location. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/location/${id}`);
  };

  return (
    <Layout title="Edit Location">
      {/* Loading state */}
      {loading && <DetailSkeleton />}

      {/* Error state */}
      {error && (
        <ErrorState
          message={error.message || 'Failed to load location'}
          onRetry={refetch}
        />
      )}

      {/* Not found state */}
      {!loading && !error && !location && (
        <EmptyState
          icon="🔍"
          title="Location not found"
          description="This location may have been deleted or the link is invalid."
          action={{ label: 'Go Home', to: '/' }}
        />
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
