interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton placeholder for loading states.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-surface-tertiary rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Card skeleton for entity cards.
 */
export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border p-3 flex items-center gap-3">
      {/* Thumbnail skeleton */}
      <Skeleton className="w-12 h-12 flex-shrink-0 rounded-md" />
      
      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      
      {/* Chevron placeholder */}
      <Skeleton className="w-5 h-5 flex-shrink-0 rounded" />
    </div>
  );
}

/**
 * List of card skeletons.
 */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Detail page skeleton.
 */
export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48 rounded-lg mb-4" />
      
      {/* Title and ID */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-6 w-24" />
      </div>
      
      {/* Description */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-4" />
      
      {/* Buttons */}
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-10 rounded-lg" />
        <Skeleton className="flex-1 h-10 rounded-lg" />
      </div>
      
      <span className="sr-only">Loading...</span>
    </div>
  );
}
