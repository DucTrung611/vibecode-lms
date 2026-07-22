import type { Order } from '../types/payment.types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <li className="rounded-card border border-slate-200 bg-surface-0 p-4 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
        {(order.items ?? []).map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="text-slate-700 dark:text-slate-300">
              {item.course?.title ?? 'Untitled course'}
            </span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              ${item.price.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
        <span>Total</span>
        <span>${order.totalAmount.toFixed(2)}</span>
      </p>
    </li>
  );
}
