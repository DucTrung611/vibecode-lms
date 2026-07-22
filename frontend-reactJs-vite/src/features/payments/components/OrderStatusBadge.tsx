import type { Order } from '../types/payment.types';

const STATUS_CLASSES: Record<Order['status'], string> = {
  PENDING:
    'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500',
  PAID: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400',
  CANCELLED:
    'bg-surface-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  REFUNDED: 'bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400',
};

interface OrderStatusBadgeProps {
  status: Order['status'];
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`rounded-pill px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {status}
    </span>
  );
}
