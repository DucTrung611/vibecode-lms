import type { Order } from '../types/payment.types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <li className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-2 space-y-1">
        {(order.items ?? []).map((item) => (
          <li key={item.id} className="text-sm text-gray-900">
            {item.course?.title ?? 'Untitled course'}{' '}
            <span className="text-gray-500">${item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-right text-sm font-semibold text-gray-900">
        Total ${order.totalAmount.toFixed(2)}
      </p>
    </li>
  );
}
