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
        <label htmlFor="score" className="block text-sm font-medium text-gray-700">
          Score
        </label>
        <input
          id="score"
          type="number"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('score', { valueAsNumber: true })}
        />
        {errors.score && (
          <p className="mt-1 text-sm text-red-600">{errors.score.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
          Feedback
        </label>
        <textarea
          id="feedback"
          rows={4}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('feedback')}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save grade'}
      </Button>
    </form>
  );
}
