import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { LearningPathCard } from '../components/LearningPathCard';
import { useLearningPaths } from '../hooks/useLearningPaths';

export default function LearningPathsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useLearningPaths(page);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Learning paths
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Curated and AI-generated course sequences to guide your learning.
        </p>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-card" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-card border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400">
          Could not load learning paths. Please try again later.
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.items.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </ul>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <div className="rounded-card border border-dashed border-slate-300 bg-surface-0 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No learning paths available yet.
          </p>
          <Link
            to="/courses"
            className="mt-3 inline-flex rounded-control text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Browse courses →
          </Link>
        </div>
      )}
    </div>
  );
}
