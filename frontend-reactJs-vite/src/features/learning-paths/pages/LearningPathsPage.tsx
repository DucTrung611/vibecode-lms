import { useState } from 'react';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { LearningPathCard } from '../components/LearningPathCard';
import { useLearningPaths } from '../hooks/useLearningPaths';

export default function LearningPathsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useLearningPaths(page);

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
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <p className="text-gray-500">No learning paths available yet.</p>
      )}
    </div>
  );
}
