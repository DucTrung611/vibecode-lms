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
    <Button
      onClick={() => enroll.mutate(learningPathId)}
      disabled={enroll.isPending}
    >
      {enroll.isPending ? 'Enrolling…' : 'Enroll'}
    </Button>
  );
}
