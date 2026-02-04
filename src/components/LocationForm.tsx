import { useState } from 'react';
import { PhotoCapture } from './PhotoCapture';
import { LocationPicker } from './LocationPicker';
import type { CreateLocationInput, Location } from '../types';

interface LocationFormProps {
  /** Initial values for editing, undefined for create mode */
  initialValues?: Location;
  /** Pre-selected parent ID (from URL query params) */
  defaultParentId?: string;
  /** Called when form is submitted with valid data */
  onSubmit: (data: CreateLocationInput) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
}

/**
 * Form for creating or editing a Location.
 * Fields: name (required), description (optional), parentId (optional), photos (optional)
 */
export function LocationForm({
  initialValues,
  defaultParentId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: LocationFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [parentId, setParentId] = useState(initialValues?.parentId ?? defaultParentId ?? '');
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
      parentId: parentId || undefined,
      photos,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div>
        <label htmlFor="location-name" className="block text-sm font-medium text-content-secondary">
          Name <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          type="text"
          id="location-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
            errors.name ? 'border-red-500' : 'border-border'
          } bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none`}
          placeholder="e.g., Garage, Kitchen, Storage Unit"
          disabled={isSubmitting}
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'location-name-error' : undefined}
        />
        {errors.name && <p id="location-name-error" className="mt-1 text-sm text-red-500" role="alert">{errors.name}</p>}
      </div>

       {/* Description field */}
       <div>
         <label htmlFor="location-description" className="block text-sm font-medium text-content-secondary">
           Description
         </label>
         <textarea
           id="location-description"
           value={description}
           onChange={(e) => setDescription(e.target.value)}
           rows={3}
           className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-border bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none resize-none"
           placeholder="Optional description of this location..."
           disabled={isSubmitting}
         />
       </div>

        {/* Parent Location field */}
        <div>
          <label htmlFor="location-parent" className="block text-sm font-medium text-content-secondary">
            Parent Location
          </label>
          <LocationPicker
            id="location-parent"
            value={parentId}
            parentType="location"
            onChange={(id) => setParentId(id)}
            disabled={isSubmitting}
            locationsOnly={true}
            excludeLocationId={initialValues?.id}
            placeholder="Select parent location..."
          />
        </div>

      {/* Photos */}
      <PhotoCapture photos={photos} onChange={setPhotos} maxPhotos={5} label="Photos" />

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] bg-accent-500 text-white py-2 px-4 rounded-md hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Location' : 'Create Location'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-[44px] px-4 py-2 border border-border text-content-secondary rounded-md hover:bg-surface-tertiary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
