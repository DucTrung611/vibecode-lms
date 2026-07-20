import type { PropsWithChildren } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: PropsWithChildren) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return (
    <AuthContext value={{ isAuthenticated: Boolean(accessToken) }}>
      {children}
    </AuthContext>
  );
}
