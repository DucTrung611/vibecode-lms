import { useState } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useCreateLessonAnswer } from '../hooks/useCreateLessonAnswer';
import type { LessonQuestion } from '../types/discussion.types';
import { LessonAnswerForm } from './LessonAnswerForm';

interface LessonQuestionCardProps {
  question: LessonQuestion;
  lessonId: string;
  canAnswer: boolean;
}

export function LessonQuestionCard({ question, lessonId, canAnswer }: LessonQuestionCardProps) {
  const [replying, setReplying] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const createAnswer = useCreateLessonAnswer(lessonId);

  return (
    <li className="rounded-card border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <p className="font-medium text-slate-900 dark:text-slate-100">
        {question.student?.fullName ?? 'Anonymous'}
      </p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{question.content}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        {new Date(question.createdAt).toLocaleDateString()}
      </p>

      {question.answers && question.answers.length > 0 ? (
        <ul className="mt-3 space-y-2 border-l-2 border-slate-100 pl-3 dark:border-slate-800">
          {question.answers.map((answer) => (
            <li key={answer.id}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {answer.author?.fullName ?? 'Anonymous'}
                </p>
                {answer.author?.role === 'INSTRUCTOR' ? (
                  <span className="rounded-pill bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                    Instructor
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{answer.content}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {canAnswer && currentUser ? (
        replying ? (
          <LessonAnswerForm
            isPending={createAnswer.isPending}
            onSubmit={(values) => {
              createAnswer.mutate(
                { questionId: question.id, payload: values },
                { onSuccess: () => setReplying(false) },
              );
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setReplying(true)}
            className="mt-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            Reply
          </button>
        )
      ) : null}
    </li>
  );
}
