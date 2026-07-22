/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { Skeleton } from '@/shared/components/Skeleton';

const InstructorAnalyticsPage = lazy(() => import('./InstructorAnalyticsPage'));
const InstructorCourseAnalyticsPage = lazy(
  () => import('./InstructorCourseAnalyticsPage'),
);

function PageFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 py-12">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export const analyticsRoutes: RouteObject[] = [
  {
    path: '/instructor/analytics',
    element: (
      <ProtectedRoute role="INSTRUCTOR">
        <Suspense fallback={<PageFallback />}>
          <InstructorAnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/courses/:id/analytics',
    element: (
      <ProtectedRoute role="INSTRUCTOR">
        <Suspense fallback={<PageFallback />}>
          <InstructorCourseAnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
