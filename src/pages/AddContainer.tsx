import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ContainerForm } from '../components/ContainerForm';
import { createContainer } from '../db/containers';
import type { CreateContainerInput, ParentType } from '../types';

/**
 * Add Container page
 */
export function AddContainer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get parent from URL params if provided
  const defaultParentId = searchParams.get('parentId') ?? undefined;
  const defaultParentType = (searchParams.get('parentType') as ParentType) ?? undefined;

  const handleSubmit = async (data: CreateContainerInput) => {
    setIsSubmitting(true);
    try {
      const container = await createContainer(data);
      navigate(`/container/${container.id}`);
    } catch (error) {
      console.error('Failed to create container:', error);
      alert('Failed to create container. Please try again.');
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
    <Layout title="Add Container">
      <ContainerForm
        defaultParentId={defaultParentId}
        defaultParentType={defaultParentType}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
}
