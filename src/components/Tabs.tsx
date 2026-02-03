import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface TabConfig {
  id: string;
  label: string;
  badge?: string | number;
  render: () => ReactNode;
}

interface TabsProps {
  tabs: TabConfig[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * Tabs component with smooth animated underline.
 * 
 * Controlled component - parent manages activeTabId and handles onTabChange.
 * Each tab can display an optional badge (e.g., item counts).
 * 
 * @example
 * const [activeTab, setActiveTab] = useState('locations');
 * <Tabs
 *   tabs={[
 *     { id: 'locations', label: 'Locations', badge: 8, render: () => <LocationsList /> },
 *     { id: 'unassigned', label: 'Unassigned', badge: 2, render: () => <UnassignedList /> },
 *   ]}
 *   activeTabId={activeTab}
 *   onTabChange={setActiveTab}
 * />
 */
export function Tabs({ tabs, activeTabId, onTabChange, className = '' }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // Update underline position when active tab changes
  useEffect(() => {
    if (!containerRef.current) return;

    const activeButton = containerRef.current.querySelector(
      `[data-tab-id="${activeTabId}"]`
    ) as HTMLElement;

    if (activeButton) {
      const { offsetLeft, offsetWidth } = activeButton;
      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTabId]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Tab buttons */}
      <div
        ref={containerRef}
        className="relative border-b border-border flex"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-3 font-medium text-sm transition-colors duration-200
                ${isActive ? 'text-accent-600' : 'text-content-secondary hover:text-content'}
              `}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge !== null && (
                <span className="ml-1 text-xs text-content-secondary">
                  ({tab.badge})
                </span>
              )}
            </button>
          );
        })}

        {/* Animated underline */}
        <div
          className="absolute bottom-0 h-1 bg-accent-600 transition-all duration-300 ease-out"
          style={{
            left: `${underlineStyle.left}px`,
            width: `${underlineStyle.width}px`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Tab content */}
      <div role="tabpanel" className="w-full">
        {activeTab && activeTab.render()}
      </div>
    </div>
  );
}
