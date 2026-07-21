import { AxiosError } from 'axios';
import type { ApiErrorPayload } from '@/shared/types/api.types';

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    return payload?.error?.message ?? fallback;
  }
  return fallback;
}
