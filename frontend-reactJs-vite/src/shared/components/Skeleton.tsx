interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-control bg-surface-200 dark:bg-slate-800 ${className}`}
      aria-hidden="true"
    />
  );
}
