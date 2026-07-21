import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { notificationService } from '../services/notification.service';

export function useNotifications(page = 1, limit = 20) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['notifications', { page, limit }],
    queryFn: () => notificationService.listMine(page, limit),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}
