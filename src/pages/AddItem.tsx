import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { ItemForm } from '../components/ItemForm';
import { createItem } from '../db/items';
import { useToast } from '../contexts/ToastContext';
import type { CreateItemInput, Item } from '../types';

/**
 * Add Item page
 */
export function AddItem() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if duplicating from an existing item (passed via navigation state)
  const duplicateFrom = (location.state?.duplicateFrom as Item) ?? undefined;

  // Get parent from URL params if provided
  const defaultParentId = searchParams.get('parentId') ?? undefined;
  let defaultParentType = (searchParams.get('parentType') as 'location' | 'item' | 'container' | null) ?? undefined;
  
  // Convert 'container' to 'item' for backward compatibility with old URLs
  if (defaultParentType === 'container') {
    defaultParentType = 'item' as 'location' | 'item' | undefined;
  }

  const handleSubmit = async (data: CreateItemInput) => {
    setIsSubmitting(true);
    try {
      const item = await createItem(data);
      const displayName = item.name || t('common.unnamedItem');
      if (duplicateFrom) {
        showToast('success', t('item.itemDuplicated', { name: displayName }));
      } else {
        showToast('success', t('item.itemCreated', { name: displayName }));
      }
      navigate(`/item/${item.id}`);
    } catch (error) {
      console.error('Failed to create item:', error);
      showToast('error', t('errors.failedToCreate', { entity: 'item' }));
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to parent or home
    if (defaultParentId && defaultParentType) {
      navigate(`/${defaultParentType}/${defaultParentId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <Layout title={t('item.addItem')}>
      <ItemForm
        initialValues={duplicateFrom}
        isEditMode={false}
        defaultParentId={defaultParentId}
        defaultParentType={defaultParentType}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
}
