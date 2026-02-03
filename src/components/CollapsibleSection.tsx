import React, { useState, useRef, useEffect } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = true,
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
    <div className={`border-t border-gray-200 ${className}`}>
      {/* Header - clickable anywhere */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between py-4 px-0 hover:bg-gray-50 transition-colors duration-150"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span
          className={`text-xl text-gray-600 transition-transform duration-300 flex-shrink-0 inline-block ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {/* Content - with smooth height animation */}
      <div
        ref={contentRef}
        style={{
          height: height,
          overflow: 'hidden',
          transition: 'height 300ms ease-in-out',
        }}
      >
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
};
