import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess, AuthUser, TokenPair } from '@/shared/types/api.types';
import type {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '../types/identity.types';

export const identityService = {
  register: (payload: RegisterPayload) =>
    api
      .post<ApiSuccess<AuthUser>>('/auth/register', payload)
      .then(unwrap),

  login: (payload: LoginPayload) =>
    api
      .post<ApiSuccess<TokenPair & { user: AuthUser }>>('/auth/login', payload)
      .then(unwrap),

  logout: (refreshToken: string) =>
    api.post<void>('/auth/logout', { refreshToken }),

  getMe: () => api.get<ApiSuccess<AuthUser>>('/users/me').then(unwrap),

  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<ApiSuccess<AuthUser>>('/users/me', payload).then(unwrap),
};
