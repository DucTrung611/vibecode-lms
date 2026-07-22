/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { Skeleton } from '@/shared/components/Skeleton';

const LoginPage = lazy(() => import('./LoginPage'));
const RegisterPage = lazy(() => import('./RegisterPage'));
const ProfilePage = lazy(() => import('./ProfilePage'));

function PageFallback() {
  return (
    <div className="mx-auto w-full max-w-sm py-10 sm:py-16">
      <div className="space-y-4 rounded-card border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export const identityRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageFallback />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageFallback />}>
          <ProfilePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
