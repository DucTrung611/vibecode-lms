import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { ApiErrorPayload, ApiSuccess, TokenPair } from '@/shared/types/api.types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setAccessToken, clearSession } = useAuthStore.getState();
  if (!refreshToken) {
    clearSession();
    throw new Error('No refresh token available');
  }

  const response = await axios.post<ApiSuccess<TokenPair>>(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    { refreshToken },
  );
  const { accessToken } = response.data.data;
  setAccessToken(accessToken);
  return accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const code = error.response?.data?.error?.code;

    if (
      error.response?.status === 401 &&
      code === 'AUTH_002' &&
      originalRequest &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export function unwrap<T>(response: { data: ApiSuccess<T> }): T {
  return response.data.data;
}
