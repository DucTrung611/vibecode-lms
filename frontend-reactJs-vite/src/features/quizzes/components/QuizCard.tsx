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
    <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {quiz.title}
      </h1>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Questions
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            {questionCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Pass score
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            {quiz.passScore}%
          </dd>
        </div>
        {quiz.timeLimitSec ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Time limit
            </dt>
            <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              {Math.round(quiz.timeLimitSec / 60)} min
            </dd>
          </div>
        ) : null}
      </dl>
      <Button
        className="mt-6 w-full sm:w-auto"
        onClick={onStart}
        disabled={isStarting}
        loading={isStarting}
      >
        {isStarting ? 'Starting…' : 'Start quiz'}
      </Button>
    </div>
  );
}
