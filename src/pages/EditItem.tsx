import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { item, loading, error, refetch } = useItem(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (data: CreateItemInput) => {
     if (!id) return;

     setIsSubmitting(true);
     try {
       await updateItem(id, data);
       showToast('success', t('item.itemUpdated', { name: item?.name }));
       // Replace history so browser back skips the edit page
       navigate(`/item/${id}`, { replace: true });
     } catch (err) {
       console.error('Failed to update item:', err);
       showToast('error', t('errors.failedToUpdate', { entity: 'item' }));
       setIsSubmitting(false);
     }
   };

  const handleCancel = () => {
    navigate(`/item/${id}`);
  };

  return (
    <Layout title={t('item.editItem')}>
      {/* Loading state */}
      {loading && <DetailSkeleton />}

      {/* Error state */}
      {error && (
        <ErrorState
          message={error.message || t('item.failedToLoad')}
          onRetry={refetch}
        />
      )}

      {/* Not found state */}
      {!loading && !error && !item && (
        <EmptyState
          icon="🔍"
          title={t('item.notFound')}
          description="This item may have been deleted or the link is invalid."
          action={{ label: t('errors.goHome'), to: '/' }}
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
