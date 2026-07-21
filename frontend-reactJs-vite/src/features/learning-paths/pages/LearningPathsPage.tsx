import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Skeleton';
import { LearningPathCard } from '../components/LearningPathCard';
import { useLearningPaths } from '../hooks/useLearningPaths';

export default function LearningPathsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useLearningPaths(page);
  const totalPages = data
    ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit))
    : 1;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Learning paths</h1>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-600">Could not load learning paths.</p>
      ) : data && data.items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.items.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </ul>
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-gray-500">No learning paths available yet.</p>
      )}
    </div>
  );
}
