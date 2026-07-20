import { createContext, use } from 'react';

export const AuthContext = createContext<{ isAuthenticated: boolean } | null>(
  null,
);

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
