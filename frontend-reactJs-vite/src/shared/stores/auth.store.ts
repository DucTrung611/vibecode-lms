import { create } from 'zustand';
import type { AuthUser } from '@/shared/types/api.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  setSession: (user, accessToken, refreshToken) =>
    set({ user, accessToken, refreshToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () => set({ user: null, accessToken: null, refreshToken: null }),
}));
