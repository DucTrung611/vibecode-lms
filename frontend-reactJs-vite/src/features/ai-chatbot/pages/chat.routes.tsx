/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { Skeleton } from '@/shared/components/Skeleton';

const ChatPage = lazy(() => import('./ChatPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[70vh] w-full rounded-card sm:h-[65vh]" />
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
