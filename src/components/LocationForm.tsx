import { useState } from 'react';
import { PhotoCapture } from './PhotoCapture';
import { ShortIdDisplay } from './ShortIdDisplay';
import type { CreateLocationInput, Location } from '../types';

interface LocationFormProps {
  /** Initial values for editing, undefined for create mode */
  initialValues?: Location;
  /** Called when form is submitted with valid data */
  onSubmit: (data: CreateLocationInput) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
}

/**
 * Form for creating or editing a Location.
 * Fields: name (required), description (optional), photos (optional)
 */
export function LocationForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: LocationFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [photos, setPhotos] = useState<Blob[]>(initialValues?.photos ?? []);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEditMode = !!initialValues;

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      photos,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Label ID Section - only shown in edit mode when shortId exists */}
      {isEditMode && initialValues?.shortId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Label ID</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Use this ID on physical labels to quickly find this location
              </p>
            </div>
            <ShortIdDisplay shortId={initialValues.shortId} />
          </div>
        </div>
      )}

      {/* Name field */}
      <div>
        <label htmlFor="location-name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
          placeholder="e.g., Garage, Kitchen, Storage Unit"
          disabled={isSubmitting}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="location-description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="location-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          placeholder="Optional description of this location..."
          disabled={isSubmitting}
        />
      </div>

      {/* Photos */}
      <PhotoCapture photos={photos} onChange={setPhotos} maxPhotos={5} label="Photos" />

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Location' : 'Create Location'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
