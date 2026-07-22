import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { CategoryPicker } from './CategoryPicker';
import { ThumbnailField } from './ThumbnailField';
import {
  COURSE_LEVELS,
  COURSE_STATUSES,
  updateCourseFormSchema,
  type Course,
  type UpdateCourseFormValues,
} from '../types/courses.types';

interface CourseFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Course>;
  isPending: boolean;
  onSubmit: (values: UpdateCourseFormValues) => void;
}

const INPUT_CLASSES =
  'mt-1 w-full rounded-control border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const LABEL_CLASSES = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
const ERROR_CLASSES = 'mt-1 text-sm text-danger-600 dark:text-danger-400';

export function CourseForm({
  mode,
  defaultValues,
  isPending,
  onSubmit,
}: CourseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateCourseFormValues>({
    resolver: zodResolver(updateCourseFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      thumbnailUrl: defaultValues?.thumbnailUrl ?? '',
      price: defaultValues?.price ?? 0,
      level: defaultValues?.level ?? 'BEGINNER',
      status: defaultValues?.status ?? 'DRAFT',
      categoryId: defaultValues?.categoryId ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
      <div>
        <label htmlFor="title" className={LABEL_CLASSES}>
          Title
        </label>
        <input id="title" type="text" className={INPUT_CLASSES} {...register('title')} />
        {errors.title && <p className={ERROR_CLASSES}>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className={LABEL_CLASSES}>
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className={INPUT_CLASSES}
          {...register('description')}
        />
        {errors.description && (
          <p className={ERROR_CLASSES}>{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={LABEL_CLASSES}>
            Price (USD)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            className={INPUT_CLASSES}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className={ERROR_CLASSES}>{errors.price.message}</p>}
        </div>

        <div>
          <label htmlFor="level" className={LABEL_CLASSES}>
            Level
          </label>
          <select id="level" className={INPUT_CLASSES} {...register('level')}>
            {COURSE_LEVELS.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CategoryPicker register={register} setValue={setValue} />

      {mode === 'edit' && (
        <div>
          <label htmlFor="status" className={LABEL_CLASSES}>
            Status
          </label>
          <select id="status" className={INPUT_CLASSES} {...register('status')}>
            {COURSE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      )}

      <ThumbnailField
        register={register}
        setValue={setValue}
        error={errors.thumbnailUrl}
      />

      <Button type="submit" loading={isPending}>
        {isPending
          ? 'Saving…'
          : mode === 'create'
            ? 'Create course'
            : 'Save changes'}
      </Button>
    </form>
  );
}
