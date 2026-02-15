import { getAllItems } from '../db/items';
import { useStatsCalculation } from './useStatsCalculation';

/**
 * Hook to calculate global inventory statistics
 * Used on the Home page to show overall inventory totals
 * 
 * This is a thin wrapper around useStatsCalculation that fetches all items.
 * 
 * @returns Object with item count and total value
 */
export function useInventoryStats() {
  return useStatsCalculation(getAllItems, []);
}
