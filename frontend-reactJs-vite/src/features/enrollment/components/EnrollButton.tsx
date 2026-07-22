import { Link } from 'react-router-dom';
import { useBuyCourse } from '@/features/payments';
import { Button } from '@/shared/components/Button';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useEnroll } from '../hooks/useEnroll';

interface EnrollButtonProps {
  courseId: string;
  price?: number;
}

export function EnrollButton({ courseId, price = 0 }: EnrollButtonProps) {
  const user = useAuthStore((s) => s.user);
  const enroll = useEnroll();
  const buyCourse = useBuyCourse();

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex w-full items-center justify-center rounded-control bg-brand-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        Sign in to enroll
      </Link>
    );
  }

  if (user.role !== 'STUDENT') {
    return (
      <p className="rounded-control bg-surface-100 px-3 py-2.5 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Only student accounts can enroll in courses.
      </p>
    );
  }

  if (enroll.isSuccess) {
    return (
      <span className="flex w-full items-center justify-center gap-1.5 rounded-pill bg-success-50 px-3 py-2.5 text-base font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.415L8.5 12.086l6.79-6.796a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Enrolled
      </span>
    );
  }

  const isPending = enroll.isPending || buyCourse.isPending;

  function handleClick() {
    if (price > 0) {
      buyCourse.mutate(courseId, { onSuccess: () => enroll.mutate(courseId) });
      return;
    }
    enroll.mutate(courseId);
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={isPending}
      loading={isPending}
    >
      {isPending
        ? price > 0
          ? 'Processing…'
          : 'Enrolling…'
        : price > 0
          ? `Buy for $${price.toFixed(2)}`
          : 'Enroll now'}
    </Button>
  );
}
