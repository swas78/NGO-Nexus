import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("skeleton", className)} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card-static p-6 space-y-4">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-8 w-1/2 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/5">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  );
}
