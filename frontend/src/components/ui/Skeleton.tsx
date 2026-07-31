interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 ${className}`}
      aria-hidden="true"
    />
  );
}

export function KpiSkeleton() {
  return (
    <div className="card-base p-6">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-36" />
      <Skeleton className="mt-4 h-3 w-28" />
    </div>
  );
}

export function ChartSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="card-base overflow-hidden">
      <div className="border-b border-border-subtle px-6 py-5">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-2 h-3 w-64" />
      </div>
      <div className="p-6">
        <Skeleton className={tall ? "h-[380px]" : "h-[300px]"} />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="card-base overflow-hidden">
      <div className="border-b border-border-subtle px-6 py-5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>
      <div className="space-y-1 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
