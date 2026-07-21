import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { paymentService } from '../services/payment.service';

export function useMyOrders(page = 1, limit = 20) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['orders', 'me', { page, limit }],
    queryFn: () => paymentService.listMine(page, limit),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}
