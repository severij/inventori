import { useState, useEffect, useCallback } from 'react';
import { getAllTags } from '../db/tags';

export interface TagWithCount {
  tag: string;
  count: number;
}

interface UseTagsResult {
  tags: TagWithCount[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all unique tags from items with their usage counts
 *
 * Returns a list of tags across all items with the number of items
 * using each tag. Sorted by count (descending), then alphabetically.
 * Used for autocomplete suggestions in TagInput and Tags page.
 *
 * Example:
 * ```
 * const { tags, loading } = useTags();
 * // Returns: [
 * //   { tag: 'kitchen', count: 12 },
 * //   { tag: 'seasonal', count: 8 },
 * //   { tag: 'appliances', count: 5 }
 * // ]
 * ```
 */
export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the database function to get all tags with counts
      const tagArray = await getAllTags();
      setTags(tagArray);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tags, loading, error, refetch };
}
