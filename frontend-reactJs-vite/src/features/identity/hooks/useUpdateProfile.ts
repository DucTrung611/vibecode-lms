import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/shared/stores/auth.store';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { identityService } from '../services/identity.service';
import type { UpdateProfilePayload } from '../types/identity.types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      identityService.updateMe(payload),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['identity', 'me'], user);
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not update your profile'));
    },
  });
}
