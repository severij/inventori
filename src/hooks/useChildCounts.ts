/**
 * Hook for fetching child counts with loading and error states
 */

import { useState, useEffect } from 'react';
import { getChildCounts, type ChildCounts } from '../utils/counts';

interface UseChildCountsResult extends ChildCounts {
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch counts of direct children for a parent entity.
 *
 * @param parentId - The ID of the parent entity
 * @param parentType - Whether the parent is a 'location' or 'item'
 * @returns Object with locations, items counts, loading state, error, and refetch function
 *
 * The hook re-fetches when parentId or parentType changes.
 */
export function useChildCounts(
  parentId: string,
  parentType: 'location' | 'item'
): UseChildCountsResult {
  const [locations, setLocations] = useState<number>(0);
  const [items, setItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const counts = await getChildCounts(parentId, parentType);
      setLocations(counts.locations);
      setItems(counts.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch child counts'));
      setLocations(0);
      setItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [parentId, parentType]);

  const refetch = async () => {
    await fetchCounts();
  };

  return {
    locations,
    items,
    loading,
    error,
    refetch,
  };
}
