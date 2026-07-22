import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { FileUploadButton } from '@/shared/components/FileUploadButton';
import { LESSON_TYPES, lessonFormSchema, type LessonFormValues } from '../types/courses.types';
import type { Lesson } from '../types/courses.types';

interface EditLessonFormProps {
  lesson: Lesson;
  isPending: boolean;
  onSubmit: (values: LessonFormValues) => void;
  onCancel: () => void;
}

const INPUT_CLASSES =
  'w-full rounded-control border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function EditLessonForm({
  lesson,
  isPending,
  onSubmit,
  onCancel,
}: EditLessonFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: lesson.title,
      type: lesson.type,
      videoUrl: lesson.videoUrl ?? '',
      content: lesson.content ?? '',
      durationSec: lesson.durationSec ?? undefined,
    },
    shouldUnregister: true,
  });

  const type = watch('type');

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className="space-y-2"
      noValidate
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <input
            type="text"
            aria-label="Lesson title"
            className={INPUT_CLASSES}
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
              {errors.title.message}
            </p>
          )}
        </div>
        <select
          aria-label="Lesson type"
          className={`sm:w-auto ${INPUT_CLASSES}`}
          {...register('type')}
        >
          {LESSON_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {type === 'VIDEO' && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="Video URL"
            aria-label="Video URL"
            className={`flex-1 ${INPUT_CLASSES}`}
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
          className={INPUT_CLASSES}
          {...register('content')}
        />
      )}

      <div className="flex gap-2">
        <Button type="submit" variant="secondary" size="sm" loading={isPending}>
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
