import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { identityService } from '../services/identity.service';
import type { LoginPayload } from '../types/identity.types';

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => identityService.login(payload),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken, data.refreshToken);
      navigate('/', { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Invalid email or password'));
    },
  });
}
