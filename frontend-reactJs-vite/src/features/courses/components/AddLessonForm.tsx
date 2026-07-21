import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { FileUploadButton } from '@/shared/components/FileUploadButton';
import { LESSON_TYPES, lessonFormSchema, type LessonFormValues } from '../types/courses.types';

interface AddLessonFormProps {
  isPending: boolean;
  onSubmit: (values: LessonFormValues) => void;
}

export function AddLessonForm({ isPending, onSubmit }: AddLessonFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: { type: 'VIDEO' },
    shouldUnregister: true,
  });

  const type = watch('type');

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit(values);
        reset();
      })}
      className="space-y-2"
      noValidate
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="New lesson title"
            aria-label="New lesson title"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        <select
          aria-label="Lesson type"
          className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('type')}
        >
          {LESSON_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" disabled={isPending}>
          Add lesson
        </Button>
      </div>

      {type === 'VIDEO' && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="Video URL"
            aria-label="Video URL"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            {...register('videoUrl')}
          />
          <FileUploadButton
            accept="video/*"
            label="Upload video"
            onUploaded={(fileUrl) =>
              setValue('videoUrl', fileUrl, { shouldValidate: true })
            }
          />
        </div>
      )}

      {type === 'TEXT' && (
        <textarea
          placeholder="Lesson content"
          aria-label="Lesson content"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('content')}
        />
      )}
    </form>
  );
}
