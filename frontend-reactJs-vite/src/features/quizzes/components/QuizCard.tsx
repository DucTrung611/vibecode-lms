import { Button } from '@/shared/components/Button';
import type { Quiz } from '../types/quiz.types';

interface QuizCardProps {
  quiz: Quiz;
  onStart: () => void;
  isStarting: boolean;
}

export function QuizCard({ quiz, onStart, isStarting }: QuizCardProps) {
  const questionCount = quiz.questions?.length ?? 0;

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 sm:grid-cols-3">
        <div>
          <dt className="text-gray-500">Questions</dt>
          <dd className="font-medium text-gray-900">{questionCount}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Pass score</dt>
          <dd className="font-medium text-gray-900">{quiz.passScore}%</dd>
        </div>
        {quiz.timeLimitSec ? (
          <div>
            <dt className="text-gray-500">Time limit</dt>
            <dd className="font-medium text-gray-900">
              {Math.round(quiz.timeLimitSec / 60)} min
            </dd>
          </div>
        ) : null}
      </dl>
      <Button className="mt-6" onClick={onStart} disabled={isStarting}>
        {isStarting ? 'Starting…' : 'Start quiz'}
      </Button>
    </div>
  );
}
