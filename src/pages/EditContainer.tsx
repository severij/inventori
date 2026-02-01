import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ContainerForm } from '../components/ContainerForm';
import { useContainer } from '../hooks/useContainers';
import { updateContainer } from '../db/containers';
import type { CreateContainerInput } from '../types';

/**
 * Edit Container page
 */
export function EditContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { container, loading, error } = useContainer(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateContainerInput) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateContainer(id, data);
      navigate(`/container/${id}`);
    } catch (err) {
      console.error('Failed to update container:', err);
      alert('Failed to update container. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/container/${id}`);
  };

  return (
    <Layout title="Edit Container">
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
      {!loading && !error && !container && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-content mb-2">Container not found</h2>
          <Link to="/" className="text-accent-600 hover:underline">
            Go back home
          </Link>
        </div>
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
