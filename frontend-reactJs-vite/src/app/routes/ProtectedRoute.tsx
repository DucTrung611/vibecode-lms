import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth-context';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { AuthUser } from '@/shared/types/api.types';

interface ProtectedRouteProps extends PropsWithChildren {
  role?: AuthUser['role'];
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const currentUser = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentUser?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
