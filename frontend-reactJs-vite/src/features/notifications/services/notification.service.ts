import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type { Notification } from '../types/notification.types';

export const notificationService = {
  listMine: async (page: number, limit: number) => {
    const response = await api.get<ApiSuccess<Notification[]>>(
      '/notifications',
      { params: { page, limit } },
    );
    return { items: response.data.data, meta: response.data.meta! };
  },

  markAsRead: (id: string) =>
    api
      .patch<ApiSuccess<Notification>>(`/notifications/${id}/read`)
      .then(unwrap),
};
