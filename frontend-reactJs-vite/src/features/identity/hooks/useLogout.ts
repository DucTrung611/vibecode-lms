import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';
import { identityService } from '../services/identity.service';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: async () => {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) return;
      await identityService.logout(refreshToken);
    },
    onSettled: () => {
      clearSession();
      queryClient.removeQueries({ queryKey: ['identity', 'me'] });
      navigate('/login', { replace: true });
    },
  });
}
