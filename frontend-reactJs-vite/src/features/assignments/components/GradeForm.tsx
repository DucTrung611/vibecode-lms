import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import {
  gradeFormSchema,
  type GradeFormValues,
} from '../types/assignment.types';

interface GradeFormProps {
  isPending: boolean;
  onSubmit: (values: GradeFormValues) => void;
}

export function GradeForm({ isPending, onSubmit }: GradeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: { score: 0, feedback: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg space-y-4"
      noValidate
    >
      <div>
        <label
          htmlFor="score"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Score
        </label>
        <input
          id="score"
          type="number"
          className="mt-1.5 w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...register('score', { valueAsNumber: true })}
        />
        {errors.score && (
          <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-500">
            {errors.score.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="feedback"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Feedback
        </label>
        <textarea
          id="feedback"
          rows={4}
          className="mt-1.5 w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...register('feedback')}
        />
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isPending}
        loading={isPending}
      >
        {isPending ? 'Saving…' : 'Save grade'}
      </Button>
    </form>
  );
}
