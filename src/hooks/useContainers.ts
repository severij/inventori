import { useState, useEffect, useCallback } from 'react';
import type { Container } from '../types';
import {
  getAllContainers,
  getContainer,
  getContainersByParent,
} from '../db/containers';

interface UseContainersResult {
  containers: Container[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all containers
 */
export function useContainers(): UseContainersResult {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContainers();
      setContainers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch containers'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { containers, loading, error, refetch };
}

/**
 * Hook to fetch containers by parent ID
 */
export function useContainersByParent(parentId: string | undefined): UseContainersResult {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!parentId) {
      setContainers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getContainersByParent(parentId);
      setContainers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch containers'));
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { containers, loading, error, refetch };
}

interface UseContainerResult {
  container: Container | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single container by ID
 */
export function useContainer(id: string | undefined): UseContainerResult {
  const [container, setContainer] = useState<Container | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setContainer(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getContainer(id);
      setContainer(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch container'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { container, loading, error, refetch };
}
