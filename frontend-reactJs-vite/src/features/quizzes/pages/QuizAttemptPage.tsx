import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { QuizAttemptForm } from '../components/QuizAttemptForm';
import { QuizCard } from '../components/QuizCard';
import { QuizResult } from '../components/QuizResult';
import { useQuiz } from '../hooks/useQuiz';
import { useStartAttempt } from '../hooks/useStartAttempt';
import { useSubmitAttempt } from '../hooks/useSubmitAttempt';
import { useQuizAttemptStore } from '../stores/quiz.store';

export default function QuizAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const { data: quiz, isPending, isError } = useQuiz(id);
  const { attemptId, answers, setAnswer, reset } = useQuizAttemptStore();
  const startAttempt = useStartAttempt();
  const submitAttempt = useSubmitAttempt();

  useEffect(() => reset, [id, reset]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-center text-red-600">Could not load this quiz.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {submitAttempt.isSuccess ? (
        <QuizResult result={submitAttempt.data} onRetake={reset} />
      ) : attemptId ? (
        <QuizAttemptForm
          quiz={quiz}
          answers={answers}
          onAnswerChange={setAnswer}
          isSubmitting={submitAttempt.isPending}
          onSubmit={() =>
            submitAttempt.mutate({
              attemptId,
              payload: { answers: Object.values(answers) },
            })
          }
        />
      ) : (
        <QuizCard
          quiz={quiz}
          isStarting={startAttempt.isPending}
          onStart={() => startAttempt.mutate(quiz.id)}
        />
      )}
    </div>
  );
}
