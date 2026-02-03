import { useState, useEffect, useCallback } from 'react';
import type { Item } from '../types';
import {
  getAllItems,
  getItem,
  getItemsByParent,
  getUnassignedItems,
} from '../db/items';

interface UseItemsResult {
  items: Item[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all items
 */
export function useItems(): UseItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}

/**
 * Hook to fetch items by parent ID
 */
export function useItemsByParent(
  parentId: string | undefined,
  parentType: 'location' | 'item'
): UseItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!parentId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getItemsByParent(parentId, parentType);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  }, [parentId, parentType]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}


interface UseItemResult {
  item: Item | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single item by ID
 */
export function useItem(id: string | undefined): UseItemResult {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getItem(id);
      setItem(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch item'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { item, loading, error, refetch };
}

/**
 * Hook to fetch all items that can hold other items (canHoldItems=true)
 */
export function useContainerItems(): UseItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allItems = await getAllItems();
      // Filter items that can hold other items
      const containerItems = allItems.filter((item) => item.canHoldItems);
      setItems(containerItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch container items'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}

/**
 * Hook to fetch all unassigned items (items without a parent)
 * Used on Home page to show the Inbox tab
 * Items are sorted by createdAt (newest first)
 */
export function useUnassignedItems(): UseItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUnassignedItems();
      // Sort by createdAt descending (newest first)
      const sorted = data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setItems(sorted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch inbox items'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}
