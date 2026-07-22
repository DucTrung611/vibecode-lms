/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { Skeleton } from '@/shared/components/Skeleton';

const OrdersPage = lazy(() => import('./OrdersPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-28 w-full rounded-card" />
      <Skeleton className="h-28 w-full rounded-card" />
    </div>
  );
}

export const paymentRoutes: RouteObject[] = [
  {
    path: '/orders',
    element: (
      <ProtectedRoute role="STUDENT">
        <Suspense fallback={<PageFallback />}>
          <OrdersPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
