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
        className="text-sm font-medium text-purple-600 hover:underline"
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
      <span className="text-sm font-medium text-green-600">Enrolled ✓</span>
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
    <Button onClick={handleClick} disabled={isPending}>
      {isPending
        ? price > 0
          ? 'Processing…'
          : 'Enrolling…'
        : price > 0
          ? `Buy for $${price.toFixed(2)}`
          : 'Enroll'}
    </Button>
  );
}
