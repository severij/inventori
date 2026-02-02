import { useState, useEffect, useCallback } from 'react';
import type { BreadcrumbItem } from '../types';
import { getLocation } from '../db/locations';
import { getItem } from '../db/items';

interface UseAncestorsResult {
  ancestors: BreadcrumbItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to build breadcrumb path by traversing up the hierarchy.
 * Returns array of { id, name, type } from root to current entity.
 */
export function useAncestors(
  id: string | undefined,
  type: 'location' | 'item' | undefined
): UseAncestorsResult {
  const [ancestors, setAncestors] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!id || !type) {
      setAncestors([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
       const path: BreadcrumbItem[] = [];
       let currentId: string | undefined = id;
       let currentType: 'location' | 'item' | undefined = type;

       // Traverse up the hierarchy
       while (currentId && currentType) {
         if (currentType === 'location') {
           const location = await getLocation(currentId);
           if (location) {
             path.unshift({ id: location.id, name: location.name, type: 'location' });
           }
           // Locations are top-level, stop here
           break;
         } else if (currentType === 'item') {
           const item = await getItem(currentId);
           if (item) {
             path.unshift({ id: item.id, name: item.name, type: 'item' });
             currentId = item.parentId;
             currentType = item.parentType;
           } else {
             break;
           }
         } else {
           break;
         }
       }

      setAncestors(path);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch ancestors'));
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ancestors, loading, error, refetch };
}
