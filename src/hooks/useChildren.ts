import { useState, useEffect, useCallback } from 'react';
import type { Container, Item } from '../types';
import { getContainersByParent } from '../db/containers';
import { getItemsByParent } from '../db/items';

interface UseChildrenResult {
  containers: Container[];
  items: Item[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all direct children (containers + items) of a parent.
 * Used for displaying contents of a location, container, or item-container.
 */
export function useChildren(parentId: string | undefined): UseChildrenResult {
  const [containers, setContainers] = useState<Container[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!parentId) {
      setContainers([]);
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [containerData, itemData] = await Promise.all([
        getContainersByParent(parentId),
        getItemsByParent(parentId),
      ]);
      setContainers(containerData);
      setItems(itemData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch children'));
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { containers, items, loading, error, refetch };
}
