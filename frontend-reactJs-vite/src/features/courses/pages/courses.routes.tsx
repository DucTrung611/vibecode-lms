/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { Skeleton } from '@/shared/components/Skeleton';

const CourseCatalogPage = lazy(() => import('./CourseCatalogPage'));
const CourseDetailPage = lazy(() => import('./CourseDetailPage'));
const InstructorCourseCreatePage = lazy(
  () => import('./InstructorCourseCreatePage'),
);
const InstructorCourseEditPage = lazy(
  () => import('./InstructorCourseEditPage'),
);

function PageFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 py-12">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export const coursesRoutes: RouteObject[] = [
  {
    path: '/courses',
    element: (
      <Suspense fallback={<PageFallback />}>
        <CourseCatalogPage />
      </Suspense>
    ),
  },
  {
    path: '/courses/:id',
    element: (
      <Suspense fallback={<PageFallback />}>
        <CourseDetailPage />
      </Suspense>
    ),
  },
  {
    path: '/instructor/courses/new',
    element: (
      <ProtectedRoute role="INSTRUCTOR">
        <Suspense fallback={<PageFallback />}>
          <InstructorCourseCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/courses/:id/edit',
    element: (
      <ProtectedRoute role="INSTRUCTOR">
        <Suspense fallback={<PageFallback />}>
          <InstructorCourseEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
