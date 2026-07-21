import { useState } from 'react';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { CertificateCard } from '../components/CertificateCard';
import { useMyCertificates } from '../hooks/useMyCertificates';

export default function MyCertificatesPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useMyCertificates(page);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">My certificates</h1>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-600">Could not load your certificates.</p>
      ) : data && data.items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.items.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </ul>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <p className="text-gray-500">
          You haven't earned any certificates yet. Complete a course to earn
          one.
        </p>
      )}
    </div>
  );
}
