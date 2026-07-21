import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type { Category } from '../types/courses.types';

export const categoriesService = {
  list: () =>
    api.get<ApiSuccess<Category[]>>('/categories').then(unwrap),

  create: (name: string) =>
    api.post<ApiSuccess<Category>>('/categories', { name }).then(unwrap),
};
