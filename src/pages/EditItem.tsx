import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ItemForm } from '../components/ItemForm';
import { DetailSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useItem } from '../hooks/useItems';
import { updateItem } from '../db/items';
import { useToast } from '../contexts/ToastContext';
import type { CreateItemInput } from '../types';

/**
 * Edit Item page
 */
export function EditItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { item, loading, error, refetch } = useItem(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateItemInput) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateItem(id, data);
      showToast('success', 'Item updated successfully');
      navigate(`/item/${id}`);
    } catch (err) {
      console.error('Failed to update item:', err);
      showToast('error', 'Failed to update item. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/item/${id}`);
  };

  return (
    <Layout title="Edit Item">
      {/* Loading state */}
      {loading && <DetailSkeleton />}

      {/* Error state */}
      {error && (
        <ErrorState
          message={error.message || 'Failed to load item'}
          onRetry={refetch}
        />
      )}

      {/* Not found state */}
      {!loading && !error && !item && (
        <EmptyState
          icon="🔍"
          title="Item not found"
          description="This item may have been deleted or the link is invalid."
          action={{ label: 'Go Home', to: '/' }}
        />
      )}

      {/* Form */}
      {!loading && item && (
        <ItemForm
          initialValues={item}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </Layout>
  );
}
