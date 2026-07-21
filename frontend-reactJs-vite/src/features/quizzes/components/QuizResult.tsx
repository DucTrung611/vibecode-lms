import { Button } from '@/shared/components/Button';
import type { SubmitAttemptResult } from '../types/quiz.types';

interface QuizResultProps {
  result: SubmitAttemptResult;
  onRetake: () => void;
}

export function QuizResult({ result, onRetake }: QuizResultProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <p
        className={
          result.passed
            ? 'text-lg font-semibold text-green-600'
            : 'text-lg font-semibold text-red-600'
        }
      >
        {result.passed ? 'Passed' : 'Not passed'} — {result.score}%
      </p>

      <ul className="mt-4 space-y-1 text-sm">
        {result.answers.map((answer, index) => (
          <li
            key={answer.questionId}
            className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}
          >
            Question {index + 1}: {answer.isCorrect ? 'Correct' : 'Incorrect'}
          </li>
        ))}
      </ul>

      <Button variant="secondary" className="mt-6" onClick={onRetake}>
        Retake quiz
      </Button>
    </div>
  );
}
