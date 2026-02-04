import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { location, loading, error, refetch } = useLocation(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (data: CreateLocationInput) => {
     if (!id) return;

     setIsSubmitting(true);
     try {
       await updateLocation(id, data);
       showToast('success', t('location.locationUpdated', { name: location?.name }));
       // Replace history so browser back skips the edit page
       navigate(`/location/${id}`, { replace: true });
     } catch (err) {
       console.error('Failed to update location:', err);
       showToast('error', t('errors.failedToUpdate', { entity: 'location' }));
       setIsSubmitting(false);
     }
   };

  const handleCancel = () => {
    navigate(`/location/${id}`);
  };

  return (
    <Layout title={t('location.editLocation')}>
      {/* Loading state */}
      {loading && <DetailSkeleton />}

      {/* Error state */}
      {error && (
        <ErrorState
          message={error.message || t('location.failedToLoad')}
          onRetry={refetch}
        />
      )}

      {/* Not found state */}
      {!loading && !error && !location && (
        <EmptyState
          icon="🔍"
          title={t('location.notFound')}
          description="This location may have been deleted or the link is invalid."
          action={{ label: t('errors.goHome'), to: '/' }}
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
