/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { Skeleton } from '@/shared/components/Skeleton';

const AssignmentSubmitPage = lazy(() => import('./AssignmentSubmitPage'));
const GradeSubmissionPage = lazy(() => import('./GradeSubmissionPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export const assignmentRoutes: RouteObject[] = [
  {
    path: '/assignments/:id/submit',
    element: (
      <ProtectedRoute role="STUDENT">
        <Suspense fallback={<PageFallback />}>
          <AssignmentSubmitPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/submissions/:id/grade',
    element: (
      <ProtectedRoute role="INSTRUCTOR">
        <Suspense fallback={<PageFallback />}>
          <GradeSubmissionPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
