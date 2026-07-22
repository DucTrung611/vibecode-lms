import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { moduleFormSchema, type ModuleFormValues } from '../types/courses.types';

interface AddModuleFormProps {
  isPending: boolean;
  onSubmit: (values: ModuleFormValues) => void;
}

export function AddModuleForm({ isPending, onSubmit }: AddModuleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: { title: '' },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit(values);
        reset();
      })}
      className="flex items-start gap-2"
      noValidate
    >
      <div className="flex-1">
        <input
          type="text"
          placeholder="New module title"
          aria-label="New module title"
          className="w-full rounded-control border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          {...register('title')}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
            {errors.title.message}
          </p>
        )}
      </div>
      <Button type="submit" variant="secondary" loading={isPending}>
        Add module
      </Button>
    </form>
  );
}
