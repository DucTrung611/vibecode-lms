import { useState } from 'react';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useCreateLessonQuestion } from '../hooks/useCreateLessonQuestion';
import { useLessonQuestions } from '../hooks/useLessonQuestions';
import { LessonQuestionCard } from './LessonQuestionCard';
import { LessonQuestionForm } from './LessonQuestionForm';

interface LessonQuestionsSectionProps {
  lessonId: string;
}

export function LessonQuestionsSection({ lessonId }: LessonQuestionsSectionProps) {
  const [page, setPage] = useState(1);
  const currentUser = useAuthStore((s) => s.user);
  const { data, isPending, isError } = useLessonQuestions(lessonId, page);
  const createQuestion = useCreateLessonQuestion(lessonId);
  const canAnswer = currentUser?.role === 'STUDENT' || currentUser?.role === 'INSTRUCTOR';

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Questions & answers
      </h2>

      {currentUser?.role === 'STUDENT' ? (
        <LessonQuestionForm
          isPending={createQuestion.isPending}
          onSubmit={(values) => createQuestion.mutate(values)}
        />
      ) : null}

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-card" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-card border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400">
          Could not load questions.
        </p>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-card border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No questions yet. Be the first to ask.
        </p>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-3">
            {data.items.map((question) => (
              <LessonQuestionCard
                key={question.id}
                question={question}
                lessonId={lessonId}
                canAnswer={canAnswer}
              />
            ))}
          </ul>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
