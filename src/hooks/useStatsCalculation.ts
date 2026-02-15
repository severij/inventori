import { useState, useEffect } from 'react';
import type { Item } from '../types';
import { calculateItemCount, calculateTotalValue } from '../utils/stats';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Base hook for calculating inventory statistics
 * 
 * This shared hook eliminates duplication between useInventoryStats
 * and useEntityStats by extracting the common calculation logic.
 * 
 * @param fetchItems - Function that returns a promise of items to calculate stats for
 * @param dependencies - Additional dependencies that should trigger recalculation
 * @returns Object with item count, total value, and loading state
 */
export function useStatsCalculation(
  fetchItems: () => Promise<Item[]>,
  dependencies: any[]
) {
  const { settings } = useSettings();
  const [stats, setStats] = useState<{
    itemCount: number;
    totalValue: number;
    isLoading: boolean;
  }>({
    itemCount: 0,
    totalValue: 0,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function calculateStats() {
      try {
        // Fetch items using the provided function
        const items = await fetchItems();

        if (!mounted) return;

        // Calculate stats using user's preferred methods
        const itemCount = calculateItemCount(items, settings.itemCountMethod);
        const totalValue = calculateTotalValue(items, settings.valueCalculation);

        setStats({
          itemCount,
          totalValue,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to calculate stats:', error);
        if (mounted) {
          setStats({
            itemCount: 0,
            totalValue: 0,
            isLoading: false,
          });
        }
      }
    }

    calculateStats();

    return () => {
      mounted = false;
    };
  }, [settings.itemCountMethod, settings.valueCalculation, ...dependencies]);

  return stats;
}
