import React, { useState, useRef, useEffect } from 'react';
import { useLocations } from '../hooks/useLocations';
import { useContainerItems } from '../hooks/useItems';
import { useAncestors } from '../hooks/useAncestors';
import type { Location, Item } from '../types';

interface LocationPickerProps {
  /** Currently selected parent ID */
  value: string;
  /** Currently selected parent type */
  parentType?: 'location' | 'item';
  /** Called when selection changes */
  onChange: (parentId: string, parentType: 'location' | 'item') => void;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether to show error styling */
  hasError?: boolean;
  /** Exclude this item ID from being selectable (for edit mode) */
  excludeItemId?: string;
  /** Placeholder text for trigger button */
  placeholder?: string;
}

interface NavigationLevel {
  id: string;
  name: string;
  type: 'location' | 'item';
}

/**
 * LocationPicker component - Modal/bottom sheet for selecting locations and containers
 *
 * Features:
 * - Drill-down navigation through location and container hierarchy
 * - Auto-select for items without children
 * - Mobile bottom sheet / desktop modal
 * - Shows current selection path on trigger button
 * - Back navigation to parent levels
 *
 * @example
 * ```tsx
 * <LocationPicker
 *   value={parentId}
 *   parentType={parentType}
 *   onChange={(id, type) => setParentId(id); setParentType(type)}
 *   placeholder="Select a location..."
 * />
 * ```
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  parentType,
  onChange,
  disabled = false,
  hasError = false,
  excludeItemId,
  placeholder = 'Select a location or container...',
}) => {
  const { locations, loading: locationsLoading } = useLocations();
  const { items: containerItems, loading: containerItemsLoading } = useContainerItems();
  const { ancestors } = useAncestors(value, parentType);

  const [isOpen, setIsOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState<NavigationLevel[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Detect mobile/desktop on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  /**
   * Get children (locations and/or items) for the current navigation level
   */
  const getChildren = (): { locations: Location[]; items: Item[] } => {
    const currentLevel = navigationStack[navigationStack.length - 1];

    if (!currentLevel) {
      // Root level: show top-level locations only
      const topLevelLocs = locations.filter((loc) => !loc.parentId);
      return { locations: topLevelLocs, items: [] };
    }

    if (currentLevel.type === 'location') {
      // Location level: show child locations and items in this location
      const childLocs = locations.filter((loc) => loc.parentId === currentLevel.id);
      const childItems = containerItems.filter(
        (item) =>
          item.parentId === currentLevel.id &&
          item.parentType === 'location' &&
          item.id !== excludeItemId
      );
      return { locations: childLocs, items: childItems };
    } else {
      // Item (container) level: show items in this container
      const childItems = containerItems.filter(
        (item) =>
          item.parentId === currentLevel.id &&
          item.parentType === 'item' &&
          item.id !== excludeItemId
      );
      return { locations: [], items: childItems };
    }
  };

  /**
   * Check if an entity has children
   */
  const hasChildren = (id: string, type: 'location' | 'item'): boolean => {
    if (type === 'location') {
      const hasChildLocs = locations.some((loc) => loc.parentId === id);
      const hasChildItems = containerItems.some(
        (item) => item.parentId === id && item.parentType === 'location'
      );
      return hasChildLocs || hasChildItems;
    } else {
      const hasChildItems = containerItems.some(
        (item) => item.parentId === id && item.parentType === 'item'
      );
      return hasChildItems;
    }
  };

  /**
   * Handle selecting an item (location or container)
   * - If it has children: drill in
   * - If no children: select and close
   */
  const handleSelectItem = (id: string, name: string, type: 'location' | 'item') => {
    if (hasChildren(id, type)) {
      // Drill in
      setNavigationStack([...navigationStack, { id, name, type }]);
    } else {
      // Auto-select and close
      onChange(id, type);
      setIsOpen(false);
      setNavigationStack([]);
    }
  };

  /**
   * Handle selecting the current level (from "Select [name]" button)
   */
  const handleSelectCurrent = () => {
    const currentLevel = navigationStack[navigationStack.length - 1];
    if (currentLevel) {
      onChange(currentLevel.id, currentLevel.type);
      setIsOpen(false);
      setNavigationStack([]);
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    setNavigationStack(navigationStack.slice(0, -1));
  };

  /**
   * Close the picker
   */
  const handleClose = () => {
    setIsOpen(false);
    setNavigationStack([]);
  };

  const isLoading = locationsLoading || containerItemsLoading;
  const { locations: children, items: childItems } = getChildren();
  const currentLevel = navigationStack[navigationStack.length - 1];

  // Build display text for trigger button
  const displayText =
    ancestors.length > 0
      ? ancestors.map((a) => (a.type === 'location' ? '📍' : '📦') + ' ' + a.name).join(' > ')
      : placeholder;

  return (
    <div ref={pickerRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={`w-full text-left mt-1 block rounded-md shadow-sm px-3 py-2 border ${
          hasError ? 'border-red-500' : 'border-border'
        } bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between`}
      >
        <span className="truncate">{displayText}</span>
        <span className="flex-shrink-0 ml-2">▼</span>
      </button>

      {/* Modal/Sheet Container */}
      {isOpen && (
        <>
          {/* Semi-transparent overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={handleClose}
          />

          {/* Mobile bottom sheet or desktop modal */}
          {isMobile ? (
            // Mobile bottom sheet
            <div className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 max-h-[70vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  {navigationStack.length > 0 && (
                    <button
                      onClick={handleBack}
                      className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                      aria-label="Go back"
                    >
                      ←
                    </button>
                  )}
                  <h2 className="text-lg font-medium text-content">
                    {currentLevel ? currentLevel.name : 'Select Location'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500 mb-2" />
                      <p className="text-sm text-content-secondary">Loading...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Select current button (only when drilled in) */}
                    {navigationStack.length > 0 && (
                      <button
                        onClick={handleSelectCurrent}
                        className="w-full mb-3 px-3 py-3 bg-accent-50 dark:bg-surface-tertiary border border-accent-200 dark:border-accent-600/50 rounded-lg hover:bg-accent-100 dark:hover:bg-surface-secondary transition-colors text-content font-medium flex items-center justify-center gap-2"
                      >
                        <span>✓</span>
                        <span>Select "{currentLevel?.name}"</span>
                      </button>
                    )}

                    {/* List of children */}
                    <div className="space-y-1">
                      {/* Child locations */}
                      {children.map((location) => (
                        <button
                          key={location.id}
                          onClick={() =>
                            handleSelectItem(location.id, location.name, 'location')
                          }
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-surface-tertiary dark:hover:bg-surface-secondary transition-colors flex items-center justify-between group"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-lg">📍</span>
                            <span className="text-content">{location.name}</span>
                          </span>
                          {hasChildren(location.id, 'location') && (
                            <span className="text-content-secondary group-hover:text-content transition-colors">
                              {'>'}
                            </span>
                          )}
                        </button>
                      ))}

                      {/* Child items */}
                      {childItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectItem(item.id, item.name, 'item')}
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-surface-tertiary dark:hover:bg-surface-secondary transition-colors flex items-center justify-between group"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-lg">📦</span>
                            <span className="text-content">{item.name}</span>
                          </span>
                          {hasChildren(item.id, 'item') && (
                            <span className="text-content-secondary group-hover:text-content transition-colors">
                              {'>'}
                            </span>
                          )}
                        </button>
                      ))}

                      {/* Empty state */}
                      {children.length === 0 && childItems.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-content-secondary">
                            {currentLevel
                              ? `"${currentLevel.name}" has no items`
                              : 'No locations available'}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Bottom padding for notch/safe area */}
              <div className="h-4 flex-shrink-0" />
            </div>
          ) : (
            // Desktop modal
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-lg shadow-xl z-50 w-full max-w-[400px] max-h-[600px] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  {navigationStack.length > 0 && (
                    <button
                      onClick={handleBack}
                      className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                      aria-label="Go back"
                    >
                      ←
                    </button>
                  )}
                  <h2 className="text-lg font-medium text-content">
                    {currentLevel ? currentLevel.name : 'Select Location'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500 mb-2" />
                      <p className="text-sm text-content-secondary">Loading...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Select current button (only when drilled in) */}
                    {navigationStack.length > 0 && (
                      <button
                        onClick={handleSelectCurrent}
                        className="w-full mb-3 px-3 py-3 bg-accent-50 dark:bg-surface-tertiary border border-accent-200 dark:border-accent-600/50 rounded-lg hover:bg-accent-100 dark:hover:bg-surface-secondary transition-colors text-content font-medium flex items-center justify-center gap-2"
                      >
                        <span>✓</span>
                        <span>Select "{currentLevel?.name}"</span>
                      </button>
                    )}

                    {/* List of children */}
                    <div className="space-y-1">
                      {/* Child locations */}
                      {children.map((location) => (
                        <button
                          key={location.id}
                          onClick={() =>
                            handleSelectItem(location.id, location.name, 'location')
                          }
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-surface-tertiary dark:hover:bg-surface-secondary transition-colors flex items-center justify-between group"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-lg">📍</span>
                            <span className="text-content">{location.name}</span>
                          </span>
                          {hasChildren(location.id, 'location') && (
                            <span className="text-content-secondary group-hover:text-content transition-colors">
                              {'>'}
                            </span>
                          )}
                        </button>
                      ))}

                      {/* Child items */}
                      {childItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectItem(item.id, item.name, 'item')}
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-surface-tertiary dark:hover:bg-surface-secondary transition-colors flex items-center justify-between group"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-lg">📦</span>
                            <span className="text-content">{item.name}</span>
                          </span>
                          {hasChildren(item.id, 'item') && (
                            <span className="text-content-secondary group-hover:text-content transition-colors">
                              {'>'}
                            </span>
                          )}
                        </button>
                      ))}

                      {/* Empty state */}
                      {children.length === 0 && childItems.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-content-secondary">
                            {currentLevel
                              ? `"${currentLevel.name}" has no items`
                              : 'No locations available'}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
