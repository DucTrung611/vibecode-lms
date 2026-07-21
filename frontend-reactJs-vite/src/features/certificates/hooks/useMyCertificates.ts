import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { certificateService } from '../services/certificate.service';

export function useMyCertificates(page = 1, limit = 20) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['certificates', 'me', { page, limit }],
    queryFn: () => certificateService.listMine(page, limit),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}
