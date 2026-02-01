import { useState, useEffect, useRef, useId } from 'react';

interface SearchBarProps {
  /** Called with the debounced search term */
  onSearch: (term: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Initial search term */
  initialValue?: string;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
}

/**
 * Search input with debounced onChange and clear button.
 * Emits the debounced search term to the parent component.
 * Accessible with proper ARIA labels and keyboard support.
 */
export function SearchBar({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 150,
  initialValue = '',
  autoFocus = false,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Clear on Escape
    if (e.key === 'Escape' && value) {
      handleClear();
    }
  };

  return (
    <div className="relative" role="search">
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-content-muted"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        id={searchId}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-surface focus:border-accent-500 focus:ring-2 focus:ring-accent-500 outline-none text-content placeholder-content-muted min-h-[44px]"
        aria-label="Search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-muted hover:text-content-secondary min-w-[44px] justify-center"
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
