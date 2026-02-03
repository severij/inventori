import { getAllItems } from './items';
import { getDB } from './index';

/**
 * Get all unique tags across all items with their item counts
 * Returns tags sorted alphabetically by name
 */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const allItems = await getAllItems();

  // Create a map of tag -> count
  const tagCounts = new Map<string, number>();

  for (const item of allItems) {
    for (const tag of item.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  // Convert to array and sort alphabetically
  const tags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));

  return tags;
}

/**
 * Rename a tag across all items that have it
 * Updates all items that contain oldName to have newName instead
 * Case-sensitive
 */
export async function renameTag(oldName: string, newName: string): Promise<void> {
  const db = await getDB();
  const allItems = await getAllItems();

  // Find all items with the old tag
  const itemsToUpdate = allItems.filter((item) => item.tags.includes(oldName));

  // Update each item
  for (const item of itemsToUpdate) {
    const updatedTags = item.tags.map((tag) => (tag === oldName ? newName : tag));
    item.tags = updatedTags;
    item.updatedAt = new Date();
    await db.put('items', item);
  }
}

/**
 * Delete a tag from all items that have it
 * Removes the tag from every item in the database
 * Case-sensitive
 */
export async function deleteTag(tagName: string): Promise<void> {
  const db = await getDB();
  const allItems = await getAllItems();

  // Find all items with the tag
  const itemsToUpdate = allItems.filter((item) => item.tags.includes(tagName));

  // Update each item to remove the tag
  for (const item of itemsToUpdate) {
    item.tags = item.tags.filter((tag) => tag !== tagName);
    item.updatedAt = new Date();
    await db.put('items', item);
  }
}
