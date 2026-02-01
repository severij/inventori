import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ItemForm } from '../components/ItemForm';
import { createItem } from '../db/items';
import { useToast } from '../contexts/ToastContext';
import type { CreateItemInput, ParentType } from '../types';

/**
 * Add Item page
 */
export function AddItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get parent from URL params if provided
  const defaultParentId = searchParams.get('parentId') ?? undefined;
  const defaultParentType = (searchParams.get('parentType') as ParentType) ?? undefined;

  const handleSubmit = async (data: CreateItemInput) => {
    setIsSubmitting(true);
    try {
      const item = await createItem(data);
      showToast('success', `"${item.name}" has been created`);
      navigate(`/item/${item.id}`);
    } catch (error) {
      console.error('Failed to create item:', error);
      showToast('error', 'Failed to create item. Please try again.');
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
    <Layout title="Add Item">
      <ItemForm
        defaultParentId={defaultParentId}
        defaultParentType={defaultParentType}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
}
