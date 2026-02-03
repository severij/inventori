import React, { useState, useRef, useEffect } from 'react';

interface CollapsibleFormSectionProps {
  title: string;
  /** Number of fields in this section (shows in header) */
  fieldCount?: number;
  children: React.ReactNode;
  /** Whether section starts expanded (default: false = collapsed) */
  defaultOpen?: boolean;
  /** Optional CSS classes */
  className?: string;
}

/**
 * CollapsibleFormSection - Groups form fields into collapsible sections
 *
 * Similar to CollapsibleSection but styled specifically for form contexts.
 * Features:
 * - Fieldset styling for semantic HTML
 * - Field count display in header
 * - Collapsed by default for "Additional Info" type sections
 * - Smooth height animation
 * - Accessible (ARIA expanded, legend semantics)
 *
 * @example
 * ```tsx
 * <CollapsibleFormSection title="Additional Information" fieldCount={3}>
 *   <div>
 *     <label>Purchase Price</label>
 *     <input type="number" />
 *   </div>
 *   <div>
 *     <label>Current Value</label>
 *     <input type="number" />
 *   </div>
 * </CollapsibleFormSection>
 * ```
 */
export const CollapsibleFormSection: React.FC<CollapsibleFormSectionProps> = ({
  title,
  fieldCount,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update height when isOpen changes or children update
  useEffect(() => {
    if (isOpen) {
      // Expanding: measure content height
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    } else {
      // Collapsing: set to 0
      setHeight(0);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <fieldset className={`border border-border rounded-lg ${className}`}>
      {/* Legend - clickable to toggle */}
       <legend className="px-0 py-0">
         <button
           type="button"
           onClick={handleToggle}
           className="w-full flex items-center justify-between px-4 py-4 hover:bg-surface-tertiary transition-colors duration-150"
           aria-expanded={isOpen}
         >
          <h3 className="text-lg font-semibold text-content">
            {title}
            {fieldCount !== undefined && (
              <span className="text-sm font-normal text-content-secondary ml-2">
                ({fieldCount})
              </span>
            )}
          </h3>
          <span
            className={`text-xl text-gray-600 transition-transform duration-300 flex-shrink-0 inline-block ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>
      </legend>

      {/* Content - with smooth height animation */}
      <div
        ref={contentRef}
        style={{
          height: height,
          overflow: 'hidden',
          transition: 'height 300ms ease-in-out',
        }}
      >
        <div className="px-4 py-4 border-t border-border space-y-4">
          {children}
        </div>
      </div>
    </fieldset>
  );
};
