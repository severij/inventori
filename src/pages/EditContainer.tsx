import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ContainerForm } from '../components/ContainerForm';
import { DetailSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useContainer } from '../hooks/useContainers';
import { updateContainer } from '../db/containers';
import { useToast } from '../contexts/ToastContext';
import type { CreateContainerInput } from '../types';

/**
 * Edit Container page
 */
export function EditContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { container, loading, error, refetch } = useContainer(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateContainerInput) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateContainer(id, data);
      showToast('success', 'Container updated successfully');
      navigate(`/container/${id}`);
    } catch (err) {
      console.error('Failed to update container:', err);
      showToast('error', 'Failed to update container. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/container/${id}`);
  };

  return (
    <Layout title="Edit Container">
      {/* Loading state */}
      {loading && <DetailSkeleton />}

      {/* Error state */}
      {error && (
        <ErrorState
          message={error.message || 'Failed to load container'}
          onRetry={refetch}
        />
      )}

      {/* Not found state */}
      {!loading && !error && !container && (
        <EmptyState
          icon="🔍"
          title="Container not found"
          description="This container may have been deleted or the link is invalid."
          action={{ label: 'Go Home', to: '/' }}
        />
      )}

      {/* Form */}
      {!loading && container && (
        <ContainerForm
          initialValues={container}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </Layout>
  );
}
