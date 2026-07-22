import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import {
  answerFormSchema,
  type AnswerFormValues,
} from '../types/discussion.types';

interface LessonAnswerFormProps {
  isPending: boolean;
  onSubmit: (values: AnswerFormValues) => void;
}

export function LessonAnswerForm({ isPending, onSubmit }: LessonAnswerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnswerFormValues>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: { content: '' },
  });

  function handleFormSubmit(values: AnswerFormValues) {
    onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-2 space-y-2" noValidate>
      <div>
        <label htmlFor="answer-content" className="sr-only">
          Your answer
        </label>
        <textarea
          id="answer-content"
          rows={2}
          placeholder="Write a reply…"
          className="w-full rounded-control border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...register('content')}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-500">
            {errors.content.message}
          </p>
        )}
      </div>

      <Button type="submit" size="sm" variant="secondary" loading={isPending} disabled={isPending}>
        {isPending ? 'Replying…' : 'Reply'}
      </Button>
    </form>
  );
}
