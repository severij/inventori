import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LocationForm } from '../components/LocationForm';
import { createLocation } from '../db/locations';
import type { CreateLocationInput } from '../types';

/**
 * Add Location page
 */
export function AddLocation() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateLocationInput) => {
    setIsSubmitting(true);
    try {
      const location = await createLocation(data);
      navigate(`/location/${location.id}`);
    } catch (error) {
      console.error('Failed to create location:', error);
      alert('Failed to create location. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Layout title="Add Location">
      <LocationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
}
