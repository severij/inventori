import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ItemForm } from '../components/ItemForm';
import { useItem } from '../hooks/useItems';
import { updateItem } from '../db/items';
import type { CreateItemInput } from '../types';

/**
 * Edit Item page
 */
export function EditItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { item, loading, error } = useItem(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateItemInput) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateItem(id, data);
      navigate(`/item/${id}`);
    } catch (err) {
      console.error('Failed to update item:', err);
      alert('Failed to update item. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/item/${id}`);
  };

  return (
    <Layout title="Edit Item">
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>Error: {error.message}</p>
        </div>
      )}

      {/* Not found state */}
      {!loading && !error && !item && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Item not found</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
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
