import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useEnroll } from '../hooks/useEnroll';

interface EnrollButtonProps {
  courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const user = useAuthStore((s) => s.user);
  const enroll = useEnroll();

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

  return (
    <Button onClick={() => enroll.mutate(courseId)} disabled={enroll.isPending}>
      {enroll.isPending ? 'Enrolling…' : 'Enroll'}
    </Button>
  );
}
