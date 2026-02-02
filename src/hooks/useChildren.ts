import { useState, useEffect, useCallback } from 'react';
import type { Item } from '../types';
import { getItemsByParent } from '../db/items';

interface UseChildrenResult {
  children: Item[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all direct children (items) of a parent entity.
 * Used for displaying contents of a location or item-container.
 */
export function useChildren(
  parentId: string | undefined,
  parentType: 'location' | 'item'
): UseChildrenResult {
  const [children, setChildren] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!parentId) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const childData = await getItemsByParent(parentId, parentType);
      setChildren(childData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch children'));
    } finally {
      setLoading(false);
    }
  }, [parentId, parentType]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { children, loading, error, refetch };
}
