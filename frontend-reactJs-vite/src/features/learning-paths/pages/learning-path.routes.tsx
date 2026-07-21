/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';

const LearningPathsPage = lazy(() => import('./LearningPathsPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 py-12">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export const learningPathRoutes: RouteObject[] = [
  {
    path: '/learning-paths',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LearningPathsPage />
      </Suspense>
    ),
  },
];
