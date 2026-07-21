import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { paymentService } from '../services/payment.service';

export function useBuyCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const order = await paymentService.createOrder([courseId]);
      return paymentService.pay(order.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Payment successful!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Payment failed'));
    },
  });
}
