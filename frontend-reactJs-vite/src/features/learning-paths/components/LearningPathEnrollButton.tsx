import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useEnrollLearningPath } from '../hooks/useEnrollLearningPath';

interface LearningPathEnrollButtonProps {
  learningPathId: string;
}

export function LearningPathEnrollButton({
  learningPathId,
}: LearningPathEnrollButtonProps) {
  const user = useAuthStore((s) => s.user);
  const enroll = useEnrollLearningPath();

  if (!user) {
    return (
      <Link
        to="/login"
        className="shrink-0 rounded-control text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
      >
        Sign in to enroll
      </Link>
    );
  }

  if (user.role !== 'STUDENT') {
    return null;
  }

  if (enroll.isSuccess) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-success-50 px-3 py-1.5 text-sm font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
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

  return (
    <Button
      onClick={() => enroll.mutate(learningPathId)}
      disabled={enroll.isPending}
      loading={enroll.isPending}
      size="sm"
      className="shrink-0"
    >
      {enroll.isPending ? 'Enrolling…' : 'Enroll'}
    </Button>
  );
}
