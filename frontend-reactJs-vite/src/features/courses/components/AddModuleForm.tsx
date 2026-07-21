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
  } = useForm<ModuleFormValues>({ resolver: zodResolver(moduleFormSchema) });

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
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('title')}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      <Button type="submit" variant="secondary" disabled={isPending}>
        Add module
      </Button>
    </form>
  );
}
