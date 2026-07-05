/** Simple pulsing placeholder block. Compose these for page-specific skeletons. */
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-700/50 ${className}`}
      aria-hidden="true"
    />
  );
}

export function PackageCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="mt-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-4 h-10 w-full rounded-2xl" />
      </div>
    </div>
  );
}
