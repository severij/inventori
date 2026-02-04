import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { LocationForm } from '../components/LocationForm';
import { createLocation } from '../db/locations';
import { useToast } from '../contexts/ToastContext';
import type { CreateLocationInput } from '../types';

/**
 * Add Location page
 */
export function AddLocation() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get parentId from URL query params
  const defaultParentId = searchParams.get('parentId') || undefined;

  const handleSubmit = async (data: CreateLocationInput) => {
    setIsSubmitting(true);
    try {
      const location = await createLocation(data);
      showToast('success', t('location.locationCreated', { name: location.name }));
      navigate(`/location/${location.id}`);
    } catch (error) {
      console.error('Failed to create location:', error);
      showToast('error', t('errors.failedToCreate', { entity: 'location' }));
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Layout title={t('location.addLocation')}>
      <LocationForm
        defaultParentId={defaultParentId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
}
