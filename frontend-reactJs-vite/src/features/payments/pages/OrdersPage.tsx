import { Link } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { OrderCard } from '../components/OrderCard';
import { useMyOrders } from '../hooks/useMyOrders';

export default function OrdersPage() {
  const { data, isPending, isError } = useMyOrders();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">My orders</h1>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-600">Could not load your orders.</p>
      ) : data && data.items.length > 0 ? (
        <ul className="space-y-3">
          {data.items.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">
          You haven't purchased any courses yet.{' '}
          <Link to="/courses" className="text-purple-600 hover:underline">
            Browse courses
          </Link>
          .
        </p>
      )}
    </div>
  );
}
