import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { categoriesService } from '../services/categories.service';
import type { Category } from '../types/courses.types';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => categoriesService.create(name),
    onSuccess: (category) => {
      // Write the new category into the cache synchronously (not just
      // invalidate) so a <select> reading this query already has the
      // matching <option> in the same render a caller's setValue(id) runs —
      // an invalidate-only refetch lands a tick too late for that.
      queryClient.setQueryData<Category[]>(['categories'], (old) => [
        ...(old ?? []),
        category,
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not create category'));
    },
  });
}
