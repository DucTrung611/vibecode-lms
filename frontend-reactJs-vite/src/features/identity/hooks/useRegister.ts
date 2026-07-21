import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { identityService } from '../services/identity.service';
import type { RegisterPayload } from '../types/identity.types';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      identityService.register(payload),
    onSuccess: () => {
      toast.success('Account created — please sign in.');
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not create your account'));
    },
  });
}
