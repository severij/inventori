import { useState } from 'react';
import { PhotoCapture } from './PhotoCapture';
import { useLocations } from '../hooks/useLocations';
import { useContainers } from '../hooks/useContainers';
import { useContainerItems } from '../hooks/useItems';
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
 * Form for creating or editing a Container (pure organizational structure).
 * Simpler than ItemForm - only has name, description, parent, and photos.
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
  const { items: containerItems, loading: containerItemsLoading } = useContainerItems();

  // Basic fields
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');

  // Parent selection (required for containers)
  const [parentId, setParentId] = useState(initialValues?.parentId ?? defaultParentId ?? '');
  const [parentType, setParentType] = useState<ParentType | undefined>(
    initialValues?.parentType ?? defaultParentType
  );

  // Photos
  const [photos, setPhotos] = useState<Blob[]>(initialValues?.photos ?? []);

  const [errors, setErrors] = useState<{ name?: string; parent?: string }>({});

  const isEditMode = !!initialValues;
  const isLoadingParents = locationsLoading || containersLoading || containerItemsLoading;

  // Build parent options (locations + containers + item-containers)
  const parentOptions: { id: string; name: string; type: ParentType; label: string }[] = [
    ...locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      type: 'location' as ParentType,
      label: `📍 ${loc.name}`,
    })),
    ...containers
      .filter((c) => c.id !== initialValues?.id) // Don't show self as parent option
      .map((container) => ({
        id: container.id,
        name: container.name,
        type: 'container' as ParentType,
        label: `🗄️ ${container.name}`,
      })),
    ...containerItems.map((item) => ({
      id: item.id,
      name: item.name,
      type: 'item' as ParentType,
      label: `📦 ${item.name}`,
    })),
  ];

  const validate = (): boolean => {
    const newErrors: { name?: string; parent?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!parentId) {
      newErrors.parent = 'Parent is required for containers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setParentId(selectedId);

    if (!selectedId) {
      setParentType(undefined);
    } else {
      const selected = parentOptions.find((opt) => opt.id === selectedId);
      if (selected) {
        setParentType(selected.type);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateContainerInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId,
      parentType: parentType!,
      photos,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info banner */}
      <div className="bg-surface-tertiary border border-border rounded-lg p-4">
        <p className="text-sm text-content-secondary">
          <strong>Containers</strong> are for organizing items (drawers, shelves, bins).
          They don't have purchase info or value tracking.
          Use <strong>Items</strong> with "can hold other items" for trackable containers like toolboxes.
        </p>
      </div>

      {/* Basic Information Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-content">Basic Information</legend>

        {/* Name field */}
        <div>
          <label htmlFor="container-name" className="block text-sm font-medium text-content-secondary">
            Name <span className="text-red-500" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            type="text"
            id="container-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
              errors.name ? 'border-red-500' : 'border-border'
            } bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none`}
            placeholder="e.g., Top Drawer, Left Shelf, Under Sink"
            disabled={isSubmitting}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'container-name-error' : undefined}
          />
          {errors.name && <p id="container-name-error" className="mt-1 text-sm text-red-500" role="alert">{errors.name}</p>}
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="container-description" className="block text-sm font-medium text-content-secondary">
            Description
          </label>
          <textarea
            id="container-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-border bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none resize-none"
            placeholder="Optional description..."
            disabled={isSubmitting}
          />
        </div>
      </fieldset>

      {/* Location Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-content">Location</legend>

        <div>
          <label htmlFor="container-parent" className="block text-sm font-medium text-content-secondary">
            Parent <span className="text-red-500" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <select
            id="container-parent"
            value={parentId}
            onChange={handleParentChange}
            disabled={isSubmitting || isLoadingParents}
            className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
              errors.parent ? 'border-red-500' : 'border-border'
            } bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none`}
            aria-invalid={errors.parent ? 'true' : undefined}
            aria-describedby={errors.parent ? 'container-parent-error' : 'container-parent-hint'}
          >
            <option value="">
              {isLoadingParents ? 'Loading...' : 'Select a parent...'}
            </option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.parent && <p id="container-parent-error" className="mt-1 text-sm text-red-500" role="alert">{errors.parent}</p>}
          <p id="container-parent-hint" className="mt-1 text-xs text-content-muted">
            Containers must be inside a location, another container, or a container-item.
          </p>
        </div>
      </fieldset>

      {/* Photos Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-content">Photos</legend>
        <PhotoCapture photos={photos} onChange={setPhotos} maxPhotos={5} label="Container Photos" />
      </fieldset>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] bg-accent-500 text-white py-2 px-4 rounded-md hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Container' : 'Create Container'}
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
