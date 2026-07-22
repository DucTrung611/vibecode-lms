import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { OrderCard } from '../components/OrderCard';
import { useMyOrders } from '../hooks/useMyOrders';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useMyOrders(page);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          My orders
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your purchase history and payment status.
        </p>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-card" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-card border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400">
          Could not load your orders. Please try again later.
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <div className="rounded-card border border-dashed border-slate-300 bg-surface-0 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You haven't purchased any courses yet.
          </p>
          <Link
            to="/courses"
            className="mt-3 inline-flex rounded-control text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Browse courses →
          </Link>
        </div>
      )}
    </div>
  );
}
