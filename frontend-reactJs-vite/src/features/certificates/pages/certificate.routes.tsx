/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { Skeleton } from '@/shared/components/Skeleton';

const MyCertificatesPage = lazy(() => import('./MyCertificatesPage'));
const CertificateVerifyPage = lazy(() => import('./CertificateVerifyPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 py-12">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export const certificateRoutes: RouteObject[] = [
  {
    path: '/my-certificates',
    element: (
      <ProtectedRoute role="STUDENT">
        <Suspense fallback={<PageFallback />}>
          <MyCertificatesPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/certificates/verify',
    element: (
      <Suspense fallback={<PageFallback />}>
        <CertificateVerifyPage />
      </Suspense>
    ),
  },
  {
    path: '/certificates/verify/:code',
    element: (
      <Suspense fallback={<PageFallback />}>
        <CertificateVerifyPage />
      </Suspense>
    ),
  },
];
