import React, { useState, useRef, useEffect } from 'react';

/**
 * MenuItem configuration for OverflowMenu
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** Emoji icon to display */
  icon: string;
  /** Callback when item is clicked */
  onClick: () => void;
  /** Whether this is a destructive action (delete, remove, etc.) */
  destructive?: boolean;
}

interface OverflowMenuProps {
  /** Array of menu items to display */
  items: MenuItem[];
  /** Optional CSS classes */
  className?: string;
  /** Aria label for the menu button */
  ariaLabel?: string;
}

/**
 * OverflowMenu component - Three-dot menu with dropdown items
 *
 * Features:
 * - Click to toggle menu on desktop
 * - Bottom sheet drawer on mobile
 * - Emoji icons with labels
 * - Red styling for destructive actions
 * - Click outside to close
 * - Closes when item is selected
 *
 * @example
 * ```tsx
 * <OverflowMenu
 *   items={[
 *     { id: 'edit', label: 'Edit', icon: '✏️', onClick: () => navigate(`/item/${id}`) },
 *     { id: 'delete', label: 'Delete', icon: '🗑️', onClick: handleDelete, destructive: true },
 *   ]}
 * />
 * ```
 */
export const OverflowMenu: React.FC<OverflowMenuProps> = ({
  items,
  className = '',
  ariaLabel = 'More options',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile/desktop on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  if (!items.length) {
    return null;
  }

  return (
    <div ref={menuRef} className={`relative inline-block ${className}`}>
      {/* Menu button - three dots */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span className="text-xl">⋯</span>
      </button>

      {/* Desktop dropdown menu */}
      {!isMobile && isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 ${
                item.destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-900'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mobile bottom sheet overlay and menu */}
      {isMobile && isOpen && (
        <>
          {/* Semi-transparent overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom sheet drawer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-5">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Menu items */}
            <div className="px-4 pb-4">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-colors duration-150 ${
                    item.destructive
                      ? 'text-red-600 active:bg-red-50'
                      : 'text-gray-900 active:bg-gray-100'
                  } ${index < items.length - 1 ? 'mb-1' : ''}`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-base font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Bottom padding to account for notches */}
            <div className="h-4" />
          </div>
        </>
      )}
    </div>
  );
};
