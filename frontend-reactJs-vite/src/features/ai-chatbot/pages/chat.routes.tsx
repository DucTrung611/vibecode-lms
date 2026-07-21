/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { Skeleton } from '@/shared/components/Skeleton';

const ChatPage = lazy(() => import('./ChatPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 py-12">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export const chatRoutes: RouteObject[] = [
  {
    path: '/chat/:sessionId?',
    element: (
      <ProtectedRoute role="STUDENT">
        <Suspense fallback={<PageFallback />}>
          <ChatPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
