import { Skeleton } from '@/shared/components/Skeleton';

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-surface-200 bg-surface-0 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-20 rounded-pill" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-2 h-4 w-16" />
      </div>
    </div>
  );
}
