import { Button } from '@/shared/components/Button';
import type { SubmitAttemptResult } from '../types/quiz.types';

interface QuizResultProps {
  result: SubmitAttemptResult;
  onRetake: () => void;
}

export function QuizResult({ result, onRetake }: QuizResultProps) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <span
        className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold ${
          result.passed
            ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500'
            : 'bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-500'
        }`}
      >
        {result.passed ? 'Passed' : 'Not passed'}
      </span>
      <p
        className={`mt-3 text-4xl font-bold ${
          result.passed
            ? 'text-success-600 dark:text-success-500'
            : 'text-danger-600 dark:text-danger-500'
        }`}
      >
        {result.score}%
      </p>

      <ul className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
        {result.answers.map((answer, index) => (
          <li
            key={answer.questionId}
            className="flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <span>Question {index + 1}</span>
            <span
              className={`inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium ${
                answer.isCorrect
                  ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500'
                  : 'bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-500'
              }`}
            >
              {answer.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant="secondary"
        className="mt-6 w-full sm:w-auto"
        onClick={onRetake}
      >
        Retake quiz
      </Button>
    </div>
  );
}
