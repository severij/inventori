import { useState, useEffect, useCallback } from 'react';
import { getAllItems } from '../db/items';

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
 * using each tag. Used for autocomplete suggestions in TagInput.
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
      // Get all items
      const allItems = await getAllItems();

      // Count tags
      const tagMap = new Map<string, number>();
      allItems.forEach((item) => {
        item.tags?.forEach((tag) => {
          const currentCount = tagMap.get(tag) || 0;
          tagMap.set(tag, currentCount + 1);
        });
      });

      // Convert to array and sort by count (descending)
      const tagArray: TagWithCount[] = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

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
