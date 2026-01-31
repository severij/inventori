import { useState } from 'react';
import { PhotoCapture } from './PhotoCapture';
import { useLocations } from '../hooks/useLocations';
import { useContainers } from '../hooks/useContainers';
import type { CreateItemInput, Item, ParentType } from '../types';

interface ItemFormProps {
  /** Initial values for editing, undefined for create mode */
  initialValues?: Item;
  /** Pre-selected parent ID (from URL query params) */
  defaultParentId?: string;
  /** Pre-selected parent type (from URL query params) */
  defaultParentType?: ParentType;
  /** Called when form is submitted with valid data */
  onSubmit: (data: CreateItemInput) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
}

/**
 * Form for creating or editing an Item.
 * Includes all item fields: name, description, parent, category, quantity,
 * brand, manualUrl, photos, purchase info (date, price, store, receipt), disposal date.
 */
export function ItemForm({
  initialValues,
  defaultParentId,
  defaultParentType,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ItemFormProps) {
  const { locations, loading: locationsLoading } = useLocations();
  const { containers, loading: containersLoading } = useContainers();

  // Basic fields
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [quantity, setQuantity] = useState(initialValues?.quantity ?? 1);
  const [brand, setBrand] = useState(initialValues?.brand ?? '');
  const [manualUrl, setManualUrl] = useState(initialValues?.manualUrl ?? '');

  // Parent selection (optional for items)
  const [parentId, setParentId] = useState(initialValues?.parentId ?? defaultParentId ?? '');
  const [parentType, setParentType] = useState<ParentType | undefined>(
    initialValues?.parentType ?? defaultParentType
  );

  // Photos
  const [photos, setPhotos] = useState<Blob[]>(initialValues?.photos ?? []);
  const [receiptPhoto, setReceiptPhoto] = useState<Blob[]>(
    initialValues?.receiptPhoto ? [initialValues.receiptPhoto] : []
  );

  // Purchase info
  const [purchaseDate, setPurchaseDate] = useState(
    initialValues?.purchaseDate ? formatDateForInput(initialValues.purchaseDate) : ''
  );
  const [purchasePrice, setPurchasePrice] = useState(
    initialValues?.purchasePrice?.toString() ?? ''
  );
  const [purchaseStore, setPurchaseStore] = useState(initialValues?.purchaseStore ?? '');

  // Lifecycle
  const [disposalDate, setDisposalDate] = useState(
    initialValues?.disposalDate ? formatDateForInput(initialValues.disposalDate) : ''
  );

  const [errors, setErrors] = useState<{ name?: string; quantity?: string }>({});

  const isEditMode = !!initialValues;
  const isLoadingParents = locationsLoading || containersLoading;

  // Build parent options
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
      label: `📦 ${container.name}`,
    })),
  ];

  const validate = (): boolean => {
    const newErrors: { name?: string; quantity?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (quantity < 1) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateItemInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: parentId || undefined,
      parentType: parentId ? parentType : undefined,
      category: category.trim() || undefined,
      quantity,
      brand: brand.trim() || undefined,
      manualUrl: manualUrl.trim() || undefined,
      photos,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      purchaseStore: purchaseStore.trim() || undefined,
      receiptPhoto: receiptPhoto[0] ?? undefined,
      disposalDate: disposalDate ? new Date(disposalDate) : undefined,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="e.g., Hammer, Laptop, Winter Jacket"
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

        {/* Category and Quantity row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="item-category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              id="item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g., Tools, Electronics"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="item-quantity" className="block text-sm font-medium text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="item-quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min={1}
              className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              disabled={isSubmitting}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
          </div>
        </div>

        {/* Brand and Manual URL row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="item-brand" className="block text-sm font-medium text-gray-700">
              Brand
            </label>
            <input
              type="text"
              id="item-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g., DeWalt, Apple"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="item-manual-url" className="block text-sm font-medium text-gray-700">
              Manual URL
            </label>
            <input
              type="url"
              id="item-manual-url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="https://..."
              disabled={isSubmitting}
            />
          </div>
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

      {/* Purchase Information Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-gray-900">Purchase Information</legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="item-purchase-date" className="block text-sm font-medium text-gray-700">
              Purchase Date
            </label>
            <input
              type="date"
              id="item-purchase-date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="item-purchase-price" className="block text-sm font-medium text-gray-700">
              Purchase Price
            </label>
            <input
              type="number"
              id="item-purchase-price"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              min={0}
              step={0.01}
              className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="item-purchase-store" className="block text-sm font-medium text-gray-700">
            Purchase Store
          </label>
          <input
            type="text"
            id="item-purchase-store"
            value={purchaseStore}
            onChange={(e) => setPurchaseStore(e.target.value)}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="e.g., Amazon, Home Depot"
            disabled={isSubmitting}
          />
        </div>

        <PhotoCapture
          photos={receiptPhoto}
          onChange={setReceiptPhoto}
          maxPhotos={1}
          label="Receipt Photo"
        />
      </fieldset>

      {/* Lifecycle Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-gray-900">Lifecycle</legend>

        <div>
          <label htmlFor="item-disposal-date" className="block text-sm font-medium text-gray-700">
            Disposal Date
          </label>
          <input
            type="date"
            id="item-disposal-date"
            value={disposalDate}
            onChange={(e) => setDisposalDate(e.target.value)}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            Set this when the item is sold, donated, or thrown away.
          </p>
        </div>
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

/**
 * Format a Date object for use in an input[type="date"] field
 */
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}
