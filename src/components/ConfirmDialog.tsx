import { useEffect, useRef, useCallback, useState } from 'react';
import { LocationPicker } from './LocationPicker';

export interface DialogChoice {
  value: string;
  label: string;
  description?: string;
}

interface LocationPickerConfig {
  value: string;
  parentType?: 'location' | 'item';
  onChange: (parentId: string, parentType?: 'location' | 'item') => void;
  excludeLocationId?: string;
  excludeItemId?: string;
  locationsOnly?: boolean;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (choice?: string, destination?: { id: string; type?: 'location' | 'item' }) => void;
  onCancel: () => void;
  isDestructive?: boolean;
  confirmDisabled?: boolean;
  choices?: DialogChoice[];
  defaultChoice?: string;
  locationPicker?: LocationPickerConfig;
}

/**
 * A modal confirmation dialog.
 * Traps focus and closes on Escape key.
 * Optionally supports radio button choices for more complex confirmations.
 * Can embed a LocationPicker for choosing item destinations.
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  confirmDisabled = false,
  choices,
  defaultChoice,
  locationPicker,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  
  // Track selected choice if choices are provided
  const [selectedChoice, setSelectedChoice] = useState<string>(
    defaultChoice || choices?.[0]?.value || ''
  );
  
  // Reset selected choice when dialog opens
  useEffect(() => {
    if (isOpen && choices) {
      setSelectedChoice(defaultChoice || choices[0]?.value || '');
    }
  }, [isOpen, choices, defaultChoice]);

  // Focus the cancel button when dialog opens (safer default for destructive actions)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Focus trap - keep focus within dialog
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: if on first element, move to last
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, move to first
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay"
        onClick={onCancel}
        aria-hidden="true"
      />

       {/* Dialog */}
       <div
         ref={dialogRef}
         role="alertdialog"
         aria-modal="true"
         aria-labelledby="dialog-title"
         aria-describedby="dialog-description"
         className="relative bg-surface rounded-lg shadow-lg max-w-md w-full p-6 max-h-[80vh] flex flex-col"
       >
        <h2
          id="dialog-title"
          className="text-lg font-semibold text-content mb-2"
        >
          {title}
        </h2>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1">
          <div id="dialog-description" className="text-content-secondary mb-6">
            {message}
          </div>

          {/* Radio button choices (if provided) */}
          {choices && choices.length > 0 && (
            <div className="mb-6 space-y-3">
              {choices.map((choice, index) => (
                <div key={choice.value}>
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-tertiary transition-colors">
                    <input
                      type="radio"
                      name="dialog-choice"
                      value={choice.value}
                      checked={selectedChoice === choice.value}
                      onChange={(e) => setSelectedChoice(e.target.value)}
                      className="mt-1 w-4 h-4 text-accent-600 border-border focus:ring-2 focus:ring-accent-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-content">{choice.label}</div>
                      {choice.description && (
                        <div className="text-sm text-content-secondary mt-1">
                          {choice.description}
                        </div>
                      )}
                    </div>
                  </label>
                  
                  {/* LocationPicker below first choice if provided */}
                  {index === 0 && locationPicker && (
                    <div
                      className={`mt-3 ml-7 transition-opacity ${
                        selectedChoice !== choices[0]?.value
                          ? 'opacity-50 pointer-events-none'
                          : ''
                      }`}
                    >
                      <LocationPicker
                        value={locationPicker.value}
                        parentType={locationPicker.parentType}
                        onChange={locationPicker.onChange}
                        excludeLocationId={locationPicker.excludeLocationId}
                        excludeItemId={locationPicker.excludeItemId}
                        locationsOnly={locationPicker.locationsOnly}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 text-content-secondary bg-surface-tertiary rounded-lg hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={() => {
              const destination = locationPicker
                ? { id: locationPicker.value, type: locationPicker.parentType }
                : undefined;
              onConfirm(choices ? selectedChoice : undefined, destination);
            }}
            disabled={confirmDisabled}
            className={`min-h-[44px] px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-accent-500 hover:bg-accent-600 focus:ring-accent-500'
            } ${confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
