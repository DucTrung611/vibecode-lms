import { Button } from '@/shared/components/Button';
import type { PaginationMeta } from '@/shared/types/api.types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        <span aria-hidden="true">←</span> Previous
      </Button>
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Page {meta.page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={meta.page >= totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Next <span aria-hidden="true">→</span>
      </Button>
    </div>
  );
}
