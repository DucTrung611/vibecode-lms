import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import {
  questionFormSchema,
  type QuestionFormValues,
} from '../types/discussion.types';

interface LessonQuestionFormProps {
  isPending: boolean;
  onSubmit: (values: QuestionFormValues) => void;
}

export function LessonQuestionForm({ isPending, onSubmit }: LessonQuestionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: { content: '' },
  });

  function handleFormSubmit(values: QuestionFormValues) {
    onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3" noValidate>
      <div>
        <label htmlFor="question-content" className="sr-only">
          Your question
        </label>
        <textarea
          id="question-content"
          rows={3}
          placeholder="Ask a question about this lesson…"
          className="w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...register('content')}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-500">
            {errors.content.message}
          </p>
        )}
      </div>

      <Button type="submit" size="sm" loading={isPending} disabled={isPending}>
        {isPending ? 'Posting…' : 'Ask question'}
      </Button>
    </form>
  );
}
