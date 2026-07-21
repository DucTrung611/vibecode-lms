import type { ApiSuccess } from '@/shared/types/api.types';
import { api, unwrap } from './api';

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post<ApiSuccess<{ fileUrl: string }>>('/uploads', formData)
    .then(unwrap);
}
