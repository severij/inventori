import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../types';
import { getLocationsByParent } from '../db/locations';

interface UseChildLocationsResult {
  locations: Location[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all direct child locations of a parent location.
 * Used for displaying nested locations in a location view.
 */
export function useChildLocations(parentId: string | undefined): UseChildLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!parentId) {
      setLocations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const childLocations = await getLocationsByParent(parentId);
      setLocations(childLocations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch child locations'));
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { locations, loading, error, refetch };
}
