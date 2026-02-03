import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { OverflowMenu, type MenuItem } from '../components/OverflowMenu';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CardListSkeleton } from '../components/Skeleton';
import { useTags, type TagWithCount } from '../hooks/useTags';
import { renameTag, deleteTag } from '../db/tags';

/**
 * Tags page - Manage all tags in the inventory
 * List all tags with item counts, rename/delete actions, and search filter
 */
export function Tags() {
  const navigate = useNavigate();
  const { tags, loading, error, refetch } = useTags();

  const [filterTerm, setFilterTerm] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagWithCount | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter tags based on search term
  const filteredTags = tags.filter((t) => t.tag.toLowerCase().includes(filterTerm.toLowerCase()));

  /**
   * Handle tag rename
   */
  const handleRenameTag = async () => {
    if (!selectedTag || !newTagName.trim()) return;

    setIsProcessing(true);
    try {
      await renameTag(selectedTag.tag, newTagName.trim());
      setRenameDialogOpen(false);
      setSelectedTag(null);
      setNewTagName('');
      await refetch();
    } catch (err) {
      console.error('Failed to rename tag:', err);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle tag delete
   */
  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    setIsProcessing(true);
    try {
      await deleteTag(selectedTag.tag);
      setDeleteDialogOpen(false);
      setSelectedTag(null);
      await refetch();
    } catch (err) {
      console.error('Failed to delete tag:', err);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get menu items for a tag
   */
  const getTagMenuItems = (tag: TagWithCount): MenuItem[] => [
    {
      id: 'rename',
      label: 'Rename',
      icon: '✏️',
      onClick: () => {
        setSelectedTag(tag);
        setNewTagName(tag.tag);
        setRenameDialogOpen(true);
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      onClick: () => {
        setSelectedTag(tag);
        setDeleteDialogOpen(true);
      },
      destructive: true,
    },
  ];

  return (
    <Layout title="Tags">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Search/filter input */}
        <SearchBar
          placeholder="Filter tags..."
          onSearch={setFilterTerm}
          debounceMs={100}
        />

        {/* Loading state */}
        {loading && <CardListSkeleton count={5} />}

        {/* Error state */}
        {error && !loading && (
          <EmptyState
            icon="❌"
            title="Failed to load tags"
            description={error.message}
            action={{
              label: 'Retry',
              onClick: () => refetch(),
            }}
          />
        )}

        {/* Empty state */}
        {!loading && !error && tags.length === 0 && (
          <EmptyState
            icon="🏷️"
            title="No tags yet"
            description="Tags are created when you add them to items"
          />
        )}

        {/* No results state */}
        {!loading && !error && tags.length > 0 && filteredTags.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No tags found"
            description={`No tags match "${filterTerm}"`}
          />
        )}

        {/* Tags list */}
        {!loading && !error && filteredTags.length > 0 && (
          <div className="space-y-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.tag}
                className="flex items-center justify-between p-4 bg-surface rounded-lg border border-surface-variant hover:bg-surface-hover transition-colors cursor-pointer"
                onClick={() => navigate(`/search?tags=${encodeURIComponent(tag.tag)}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-content truncate">{tag.tag}</div>
                  <div className="text-sm text-content-secondary">{tag.count} item{tag.count !== 1 ? 's' : ''}</div>
                </div>

                {/* Overflow menu */}
                <div
                  className="ml-4 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <OverflowMenu items={getTagMenuItems(tag)} ariaLabel={`Actions for tag ${tag.tag}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <ConfirmDialog
        isOpen={renameDialogOpen}
        title="Rename Tag"
        message={
          <div className="space-y-4">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name"
              className="w-full px-3 py-2 border border-surface-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-600"
              autoFocus
            />
            {selectedTag && (
              <p className="text-sm text-content-secondary">
                This will update {selectedTag.count} item{selectedTag.count !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
        }
        confirmLabel="Rename"
        cancelLabel="Cancel"
        onConfirm={handleRenameTag}
        onCancel={() => {
          setRenameDialogOpen(false);
          setSelectedTag(null);
          setNewTagName('');
        }}
        confirmDisabled={isProcessing || !newTagName.trim() || newTagName === selectedTag?.tag}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title={`Delete tag "${selectedTag?.tag}"?`}
        message={
          <p className="text-sm text-content-secondary">
            This tag will be removed from {selectedTag?.count} item{selectedTag?.count !== 1 ? 's' : ''}. This action
            cannot be undone.
          </p>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteTag}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedTag(null);
        }}
        isDestructive={true}
        confirmDisabled={isProcessing}
      />
    </Layout>
  );
}
