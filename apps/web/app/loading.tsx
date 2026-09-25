export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Top Banner Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted/60" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-2xs"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded bg-muted/80" />
            <div className="h-2.5 w-32 animate-pulse rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* Feed Table Skeleton */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-2xs">
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
          <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
          <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
          <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
        </div>
      </div>
    </div>
  )
}
