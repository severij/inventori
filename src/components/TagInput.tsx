import React, { useState, useRef, useEffect } from 'react';
import type { TagWithCount } from '../hooks/useTags';

interface TagInputProps {
  /** Current tags */
  tags: string[];
  /** Called when tags array changes */
  onChange: (tags: string[]) => void;
  /** Available tags for autocomplete suggestions */
  availableTags: TagWithCount[];
  /** Whether suggestions are loading */
  suggestionsLoading?: boolean;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional CSS classes */
  className?: string;
  /** Max tags allowed (optional, no limit if undefined) */
  maxTags?: number;
}

/**
 * TagInput Component - Input for managing tags with autocomplete
 *
 * Features:
 * - Add tags by typing and pressing Enter
 * - Autocomplete dropdown showing existing tags with usage counts
 * - Remove tags by clicking the ✕ icon
 * - Prevent duplicate tags
 * - Keyboard navigation of suggestions
 * - Click outside to close suggestions
 * - Max tags limit (optional)
 *
 * @example
 * ```tsx
 * const [tags, setTags] = useState<string[]>([]);
 * const { tags: availableTags } = useTags();
 *
 * <TagInput
 *   tags={tags}
 *   onChange={setTags}
 *   availableTags={availableTags}
 *   placeholder="Add tags..."
 *   maxTags={10}
 * />
 * ```
 */
export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  availableTags,
  suggestionsLoading = false,
  placeholder = 'Add tags...',
  className = '',
  maxTags,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input and exclude already-added tags
  const filteredSuggestions = availableTags.filter(
    (suggestion) =>
      suggestion.tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion.tag)
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();

    // Validate tag
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) return; // Prevent duplicates
    if (maxTags && tags.length >= maxTags) return; // Check max limit

    onChange([...tags, trimmedTag]);
    setInputValue('');
    setHighlightedIndex(-1);
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        // Add highlighted suggestion
        addTag(filteredSuggestions[highlightedIndex].tag);
      } else if (inputValue.trim()) {
        // Add custom tag
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (tag: string) => {
    addTag(tag);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Tag Display Area */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full text-sm font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent-200 dark:hover:bg-accent-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
              aria-label={`Remove ${tag} tag`}
            >
              <span className="text-sm">✕</span>
            </button>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={!!(maxTags && tags.length >= maxTags)}
          className="w-full px-3 py-2 border border-border rounded-md bg-surface text-content focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none disabled:bg-surface-tertiary disabled:text-content-muted"
          aria-label="Tag input"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="tag-suggestions"
        />

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            id="tag-suggestions"
            className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto"
          >
            {suggestionsLoading ? (
              <div className="px-3 py-2 text-sm text-content-secondary">
                Loading...
              </div>
            ) : (
              filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.tag}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.tag)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    index === highlightedIndex
                      ? 'bg-accent-100 dark:bg-accent-900/30'
                      : 'hover:bg-surface-tertiary'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-content">{suggestion.tag}</span>
                    <span className="text-xs text-content-secondary">
                      {suggestion.count} item{suggestion.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Empty suggestions message */}
        {showSuggestions && inputValue && filteredSuggestions.length === 0 && !suggestionsLoading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-md shadow-lg z-10 px-3 py-2">
            <p className="text-sm text-content-secondary">
              No tags found. Press Enter to create "{inputValue}"
            </p>
          </div>
        )}
      </div>

      {/* Max tags reached message */}
      {maxTags && tags.length >= maxTags && (
        <p className="mt-1 text-xs text-content-secondary">
          Maximum {maxTags} tag{maxTags !== 1 ? 's' : ''} reached
        </p>
      )}
    </div>
  );
};
