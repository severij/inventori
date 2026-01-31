import { useState } from 'react';
import { PhotoCapture } from './PhotoCapture';
import { useLocations } from '../hooks/useLocations';
import { useContainers } from '../hooks/useContainers';
import type { CreateContainerInput, Container, ParentType } from '../types';

interface ContainerFormProps {
  /** Initial values for editing, undefined for create mode */
  initialValues?: Container;
  /** Pre-selected parent ID (from URL query params) */
  defaultParentId?: string;
  /** Pre-selected parent type (from URL query params) */
  defaultParentType?: ParentType;
  /** Called when form is submitted with valid data */
  onSubmit: (data: CreateContainerInput) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
}

/**
 * Form for creating or editing a Container.
 * Fields: name (required), description (optional), parent (required), photos (optional)
 */
export function ContainerForm({
  initialValues,
  defaultParentId,
  defaultParentType,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ContainerFormProps) {
  const { locations, loading: locationsLoading } = useLocations();
  const { containers, loading: containersLoading } = useContainers();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [parentId, setParentId] = useState(initialValues?.parentId ?? defaultParentId ?? '');
  const [parentType, setParentType] = useState<ParentType>(
    initialValues?.parentType ?? defaultParentType ?? 'location'
  );
  const [photos, setPhotos] = useState<Blob[]>(initialValues?.photos ?? []);
  const [errors, setErrors] = useState<{ name?: string; parent?: string }>({});

  const isEditMode = !!initialValues;
  const isLoadingParents = locationsLoading || containersLoading;

  // Build parent options - locations and containers (excluding self if editing)
  const parentOptions: { id: string; name: string; type: ParentType; label: string }[] = [
    ...locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      type: 'location' as ParentType,
      label: `📍 ${loc.name}`,
    })),
    ...containers
      .filter((c) => c.id !== initialValues?.id) // Exclude self when editing
      .map((container) => ({
        id: container.id,
        name: container.name,
        type: 'container' as ParentType,
        label: `📦 ${container.name}`,
      })),
  ];

  const validate = (): boolean => {
    const newErrors: { name?: string; parent?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!parentId) {
      newErrors.parent = 'Parent location or container is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setParentId(selectedId);

    // Find the selected option to set the parent type
    const selected = parentOptions.find((opt) => opt.id === selectedId);
    if (selected) {
      setParentType(selected.type);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      parentId,
      parentType,
      photos,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div>
        <label htmlFor="container-name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="container-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
          placeholder="e.g., Toolbox, Shelf A, Moving Box 1"
          disabled={isSubmitting}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="container-description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="container-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          placeholder="Optional description of this container..."
          disabled={isSubmitting}
        />
      </div>

      {/* Parent selector */}
      <div>
        <label htmlFor="container-parent" className="block text-sm font-medium text-gray-700">
          Parent Location/Container <span className="text-red-500">*</span>
        </label>
        <select
          id="container-parent"
          value={parentId}
          onChange={handleParentChange}
          disabled={isSubmitting || isLoadingParents}
          className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
            errors.parent ? 'border-red-500' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white`}
        >
          <option value="">
            {isLoadingParents ? 'Loading...' : 'Select parent location or container'}
          </option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.parent && <p className="mt-1 text-sm text-red-500">{errors.parent}</p>}
        {parentOptions.length === 0 && !isLoadingParents && (
          <p className="mt-1 text-sm text-amber-600">
            No locations or containers available. Create a location first.
          </p>
        )}
      </div>

      {/* Photos */}
      <PhotoCapture photos={photos} onChange={setPhotos} maxPhotos={5} label="Photos" />

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isLoadingParents}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Container' : 'Create Container'}
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
