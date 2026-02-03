/**
 * Hook for fetching total item counts with loading and error states
 * TEMPORARY: Will be renamed to useTotalItemCount in Phase 13.2
 */

import { useState, useEffect } from 'react';
import { getTotalItemCount } from '../utils/counts';

interface UseChildCountsResult {
  count: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch total item count for a parent entity (recursive).
 *
 * @param parentId - The ID of the parent entity
 * @param parentType - Whether the parent is a 'location' or 'item'
 * @returns Object with count, loading state, error, and refetch function
 *
 * The hook re-fetches when parentId or parentType changes.
 */
export function useChildCounts(
  parentId: string,
  parentType: 'location' | 'item'
): UseChildCountsResult {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const total = await getTotalItemCount(parentId, parentType);
      setCount(total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch item count'));
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [parentId, parentType]);

  const refetch = async () => {
    await fetchCount();
  };

  return {
    count,
    loading,
    error,
    refetch,
  };
}
