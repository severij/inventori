import { useState } from 'react';
import { PhotoCapture } from './PhotoCapture';
import { ShortIdDisplay } from './ShortIdDisplay';
import { useLocations } from '../hooks/useLocations';
import { useContainers } from '../hooks/useContainers';
import { useContainerItems } from '../hooks/useItems';
import type { CreateItemInput, Item, ParentType } from '../types';

interface ItemFormProps {
  /** Initial values for editing, undefined for create mode */
  initialValues?: Item;
  /** Pre-selected parent ID (from URL query params) */
  defaultParentId?: string;
  /** Pre-selected parent type (from URL query params) */
  defaultParentType?: ParentType;
  /** Default value for isContainer (from URL query params) */
  defaultIsContainer?: boolean;
  /** Called when form is submitted with valid data */
  onSubmit: (data: CreateItemInput) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
}

/**
 * Form for creating or editing an Item.
 * Includes fields: name, description, parent, isContainer, quantity, photos.
 */
export function ItemForm({
  initialValues,
  defaultParentId,
  defaultParentType,
  defaultIsContainer = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ItemFormProps) {
  const { locations, loading: locationsLoading } = useLocations();
  const { containers, loading: containersLoading } = useContainers();
  const { items: containerItems, loading: containerItemsLoading } = useContainerItems();

  // Container capability
  const [isContainer, setIsContainer] = useState(initialValues?.isContainer ?? defaultIsContainer);

  // Basic fields
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [quantity, setQuantity] = useState(initialValues?.quantity ?? 1);

  // Parent selection (optional for items)
  const [parentId, setParentId] = useState(initialValues?.parentId ?? defaultParentId ?? '');
  const [parentType, setParentType] = useState<ParentType | undefined>(
    initialValues?.parentType ?? defaultParentType
  );

  // Photos
  const [photos, setPhotos] = useState<Blob[]>(initialValues?.photos ?? []);

  const [errors, setErrors] = useState<{ name?: string; quantity?: string }>({});

  const isEditMode = !!initialValues;
  const isLoadingParents = locationsLoading || containersLoading || containerItemsLoading;

  // Build parent options (locations + containers + container-items)
  const parentOptions: { id: string; name: string; type: ParentType; label: string }[] = [
    ...locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      type: 'location' as ParentType,
      label: `📍 ${loc.name}`,
    })),
    ...containers.map((container) => ({
      id: container.id,
      name: container.name,
      type: 'container' as ParentType,
      label: `🗄️ ${container.name}`,
    })),
    ...containerItems
      .filter((item) => item.id !== initialValues?.id) // Don't show self as parent option
      .map((item) => ({
        id: item.id,
        name: item.name,
        type: 'item' as ParentType,
        label: `📦 ${item.name}`,
      })),
  ];

  const validate = (): boolean => {
    const newErrors: { name?: string; quantity?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Containers must have quantity 1
    const effectiveQuantity = isContainer ? 1 : quantity;
    if (effectiveQuantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
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

  const handleIsContainerChange = (checked: boolean) => {
    setIsContainer(checked);
    // Force quantity to 1 when becoming a container
    if (checked) {
      setQuantity(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateItemInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: parentId || undefined,
      parentType: parentId ? parentType : undefined,
      isContainer,
      quantity: isContainer ? 1 : quantity, // Containers always have quantity 1
      photos,
    };

    onSubmit(data);
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
                Use this ID on physical labels to quickly find this item
              </p>
            </div>
            <ShortIdDisplay shortId={initialValues.shortId} />
          </div>
        </div>
      )}

      {/* Container Toggle - at top for visibility */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isContainer}
            onChange={(e) => handleIsContainerChange(e.target.checked)}
            disabled={isSubmitting}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">This item can hold other items</span>
            <p className="text-sm text-gray-600">
              Enable this for containers like boxes, shelves, drawers, bags, etc.
            </p>
          </div>
        </label>
      </div>

      {/* Basic Information Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-gray-900">Basic Information</legend>

        {/* Name field */}
        <div>
          <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
            placeholder={isContainer ? "e.g., Toolbox, Shelf, Storage Bin" : "e.g., Hammer, Laptop, Winter Jacket"}
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="item-description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            placeholder="Optional description..."
            disabled={isSubmitting}
          />
        </div>

        {/* Quantity field */}
        <div>
          <label htmlFor="item-quantity" className="block text-sm font-medium text-gray-700">
            Quantity {!isContainer && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            id="item-quantity"
            value={isContainer ? 1 : quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min={1}
            className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${
              isContainer ? 'bg-gray-100 text-gray-500' : ''
            }`}
            disabled={isSubmitting || isContainer}
          />
          {isContainer && (
            <p className="mt-1 text-xs text-gray-500">Containers always have quantity 1</p>
          )}
          {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
        </div>
      </fieldset>

      {/* Location Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-gray-900">Location</legend>

        <div>
          <label htmlFor="item-parent" className="block text-sm font-medium text-gray-700">
            Parent Location/Container
          </label>
          <select
            id="item-parent"
            value={parentId}
            onChange={handleParentChange}
            disabled={isSubmitting || isLoadingParents}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">
              {isLoadingParents ? 'Loading...' : 'Unassigned (no location)'}
            </option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Items can be unassigned and added to a location later.
          </p>
        </div>
      </fieldset>

      {/* Photos Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-gray-900">Photos</legend>
        <PhotoCapture photos={photos} onChange={setPhotos} maxPhotos={10} label="Item Photos" />
      </fieldset>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
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
