import { useState } from 'react';
import { PhotoCapture } from './PhotoCapture';
import { CollapsibleFormSection } from './CollapsibleFormSection';
import { TagInput } from './TagInput';
import { LocationPicker } from './LocationPicker';
import { useTags } from '../hooks/useTags';
import type { CreateItemInput, Item } from '../types';

interface ItemFormProps {
  /** Initial values for editing, undefined for create mode */
  initialValues?: Item;
  /** Pre-selected parent ID (from URL query params) */
  defaultParentId?: string;
  /** Pre-selected parent type (from URL query params) */
  defaultParentType?: 'location' | 'item';
  /** Default value for canHoldItems (from URL query params) */
  defaultCanHoldItems?: boolean;
  /** Called when form is submitted with valid data */
  onSubmit: (data: CreateItemInput) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
}

/**
 * Form for creating or editing an Item.
 * Includes fields: name, description, parent, canHoldItems, quantity, photos.
 */
export function ItemForm({
  initialValues,
  defaultParentId,
  defaultParentType,
  defaultCanHoldItems = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ItemFormProps) {
  const { tags: allTags } = useTags();

  // Item capability
  const [canHoldItems, setCanHoldItems] = useState(initialValues?.canHoldItems ?? defaultCanHoldItems);

  // Basic fields
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [quantity, setQuantity] = useState<number | ''>(initialValues?.quantity ?? 1);

  // Parent selection (required in new model)
  const [parentId, setParentId] = useState(initialValues?.parentId ?? defaultParentId ?? '');
  const [parentType, setParentType] = useState<'location' | 'item' | undefined>(
    initialValues?.parentType ?? defaultParentType
  );

  // Photos
  const [photos, setPhotos] = useState<Blob[]>(initialValues?.photos ?? []);

  // Additional Information fields
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [purchasePrice, setPurchasePrice] = useState<number | undefined>(initialValues?.purchasePrice);
  const [currentValue, setCurrentValue] = useState<number | undefined>(initialValues?.currentValue);
  const [dateAcquired, setDateAcquired] = useState<string>(
    initialValues?.dateAcquired ? new Date(initialValues.dateAcquired).toISOString().split('T')[0] : ''
  );
  const [includeInTotal, setIncludeInTotal] = useState(initialValues?.includeInTotal ?? true);

  const [errors, setErrors] = useState<{ name?: string; parentId?: string; quantity?: string }>({});

  const isEditMode = !!initialValues;
  const isLoadingParents = false; // LocationPicker handles loading internally

  const validate = (): boolean => {
     const newErrors: { name?: string; parentId?: string; quantity?: string } = {};

     if (!name.trim()) {
       newErrors.name = 'Name is required';
     }

     // parentId is now optional (can be unassigned)

     // Validate quantity (only for non-containers)
     if (!canHoldItems) {
       if (quantity === '' || quantity < 1) {
         newErrors.quantity = 'Quantity is required and must be at least 1';
       }
     }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

   const handleCanHoldItemsChange = (checked: boolean) => {
    setCanHoldItems(checked);
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
       parentId: parentId || undefined, // Can be undefined for unassigned items
       parentType: parentType, // Can be undefined for unassigned items
       canHoldItems,
       quantity: canHoldItems ? 1 : (quantity === '' ? 1 : quantity), // Containers always have quantity 1, default to 1 if empty
       photos,
       includeInTotal,
       tags,
       purchasePrice: purchasePrice || undefined,
       currentValue: currentValue || undefined,
       dateAcquired: dateAcquired ? new Date(dateAcquired) : undefined,
     };

     onSubmit(data);
   };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Container Toggle - at top for visibility */}
      <div className="bg-accent-50 dark:bg-surface-tertiary border border-accent-200 dark:border-accent-600/50 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={canHoldItems}
            onChange={(e) => handleCanHoldItemsChange(e.target.checked)}
            disabled={isSubmitting}
            className="w-5 h-5 rounded border-border text-accent-500 focus:ring-accent-500"
          />
          <div>
            <span className="font-medium text-content">This item can hold other items</span>
            <p className="text-sm text-content-secondary">
              Enable this for containers like boxes, shelves, drawers, bags, etc.
            </p>
          </div>
        </label>
      </div>

      {/* Basic Information Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-content">Basic Information</legend>

        {/* Name + Quantity on same row */}
        <div className="flex gap-3">
          {/* Name field */}
          <div className="flex-1">
            <label htmlFor="item-name" className="block text-sm font-medium text-content-secondary">
              Name <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              type="text"
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
                errors.name ? 'border-red-500' : 'border-border'
              } bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none`}
              placeholder={canHoldItems ? "e.g., Toolbox, Shelf, Storage Bin" : "e.g., Hammer, Laptop, Winter Jacket"}
              disabled={isSubmitting}
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'item-name-error' : undefined}
            />
            {errors.name && <p id="item-name-error" className="mt-1 text-sm text-red-500" role="alert">{errors.name}</p>}
          </div>

          {/* Quantity field - narrow, only show when not a container */}
          {!canHoldItems && (
            <div className="w-20">
              <label htmlFor="item-quantity" className="block text-sm font-medium text-content-secondary">
                Quantity <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
               <input
                 type="number"
                 id="item-quantity"
                 value={quantity}
                 onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
                 min={1}
                 className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
                   errors.quantity ? 'border-red-500' : 'border-border'
                 } bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none`}
                 disabled={isSubmitting}
                 aria-invalid={errors.quantity ? 'true' : undefined}
                 aria-describedby={errors.quantity ? 'item-quantity-error' : undefined}
               />
              {errors.quantity && <p id="item-quantity-error" className="mt-1 text-sm text-red-500" role="alert">{errors.quantity}</p>}
            </div>
          )}
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="item-description" className="block text-sm font-medium text-content-secondary">
            Description
          </label>
          <textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-border bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none resize-none"
            placeholder="Optional description..."
            disabled={isSubmitting}
          />
        </div>

         {/* Location field */}
         <div>
           <label htmlFor="item-parent" className="block text-sm font-medium text-content-secondary">
             Location
           </label>
           <LocationPicker
             value={parentId}
             parentType={parentType}
             onChange={(newParentId, newParentType) => {
               setParentId(newParentId);
               setParentType(newParentType);
             }}
             disabled={isSubmitting || isLoadingParents}
             hasError={!!errors.parentId}
             excludeItemId={initialValues?.id}
             placeholder="Select a location or container..."
           />
           {errors.parentId && <p id="item-parent-error" className="mt-1 text-sm text-red-500" role="alert">{errors.parentId}</p>}
         </div>

        {/* Tags field */}
        <div>
          <label htmlFor="item-tags" className="block text-sm font-medium text-content-secondary mb-2">
            Tags
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            availableTags={allTags}
            maxTags={10}
            placeholder="Add tags to organize this item..."
          />
          <p className="text-xs text-content-muted mt-1">
            Use tags to categorize and filter items (e.g., "urgent", "gift", "fragile")
          </p>
        </div>

        {/* Photos */}
        <PhotoCapture photos={photos} onChange={setPhotos} maxPhotos={10} label="Photos" />
      </fieldset>

       {/* Additional Information Section (Collapsible) */}
       <CollapsibleFormSection title="Additional Information" defaultOpen={false}>
          {/* Purchase Price */}
         <div className="mb-4">
           <label htmlFor="item-purchase-price" className="block text-sm font-medium text-content-secondary">
             Purchase Price
           </label>
           <div className="relative mt-1 flex items-center">
             <span className="absolute left-3 text-content-secondary">$</span>
             <input
               type="number"
               id="item-purchase-price"
               value={purchasePrice ?? ''}
               onChange={(e) => setPurchasePrice(e.target.value ? parseFloat(e.target.value) : undefined)}
               min={0}
               step={0.01}
               className="block w-full rounded-md shadow-sm px-3 py-2 pl-7 border border-border bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
               placeholder="0.00"
               disabled={isSubmitting}
               aria-label="Purchase price in dollars"
             />
           </div>
           <p className="text-xs text-content-muted mt-1">
             Original price paid for this item
           </p>
         </div>

         {/* Current Value */}
         <div className="mb-4">
           <label htmlFor="item-current-value" className="block text-sm font-medium text-content-secondary">
             Current Value
           </label>
           <div className="relative mt-1 flex items-center">
             <span className="absolute left-3 text-content-secondary">$</span>
             <input
               type="number"
               id="item-current-value"
               value={currentValue ?? ''}
               onChange={(e) => setCurrentValue(e.target.value ? parseFloat(e.target.value) : undefined)}
               min={0}
               step={0.01}
               className="block w-full rounded-md shadow-sm px-3 py-2 pl-7 border border-border bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
               placeholder="0.00"
               disabled={isSubmitting}
               aria-label="Current value in dollars"
             />
           </div>
           <p className="text-xs text-content-muted mt-1">
             Estimated current resale or replacement value
           </p>
         </div>

         {/* Date Acquired */}
         <div className="mb-4">
           <label htmlFor="item-date-acquired" className="block text-sm font-medium text-content-secondary">
             Date Acquired
           </label>
           <input
             type="date"
             id="item-date-acquired"
             value={dateAcquired}
             onChange={(e) => setDateAcquired(e.target.value)}
             className="mt-1 block w-full rounded-md shadow-sm px-3 py-2 border border-border bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
             disabled={isSubmitting}
           />
           <p className="text-xs text-content-muted mt-1">
             When you acquired this item
           </p>
         </div>

         {/* Include in Inventory Totals */}
         <div>
           <label className="flex items-center gap-3 cursor-pointer">
             <input
               type="checkbox"
               checked={includeInTotal}
               onChange={(e) => setIncludeInTotal(e.target.checked)}
               disabled={isSubmitting}
               className="w-4 h-4 rounded border-border text-accent-500 focus:ring-accent-500"
             />
             <span className="text-sm font-medium text-content">Include in inventory totals</span>
           </label>
           <p className="text-xs text-content-muted mt-1 ml-7">
             Include this item in total value and quantity calculations
           </p>
         </div>
       </CollapsibleFormSection>

       {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] bg-accent-500 text-white py-2 px-4 rounded-md hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
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
