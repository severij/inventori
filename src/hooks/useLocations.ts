import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../types';
import { getAllLocations, getLocation } from '../db/locations';

interface UseLocationsResult {
  locations: Location[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all locations
 */
export function useLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch locations'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { locations, loading, error, refetch };
}

interface UseLocationResult {
  location: Location | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single location by ID
 */
export function useLocation(id: string | undefined): UseLocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setLocation(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getLocation(id);
      setLocation(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch location'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { location, loading, error, refetch };
}
