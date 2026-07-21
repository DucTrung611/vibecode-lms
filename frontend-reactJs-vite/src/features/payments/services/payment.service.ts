import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type { Order } from '../types/payment.types';

export const paymentService = {
  createOrder: (courseIds: string[]) =>
    api.post<ApiSuccess<Order>>('/orders', { courseIds }).then(unwrap),

  listMine: async (page: number, limit: number) => {
    const response = await api.get<ApiSuccess<Order[]>>('/orders/me', {
      params: { page, limit },
    });
    return { items: response.data.data, meta: response.data.meta! };
  },

  pay: (orderId: string) =>
    api.post<ApiSuccess<Order>>(`/orders/${orderId}/pay`).then(unwrap),
};
