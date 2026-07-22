import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
const HINT_CLASSES = 'mt-1 text-xs text-slate-400 dark:text-slate-500';
const ERROR_CLASSES = 'mt-1 text-sm text-danger-600 dark:text-danger-400';
const SECTION_LABEL_CLASSES =
  'text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500';

export function CourseForm({
  mode,
  defaultValues,
  isPending,
  onSubmit,
}: CourseFormProps) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <div className="space-y-4">
        <p className={SECTION_LABEL_CLASSES}>Course details</p>

        <div>
          <label htmlFor="title" className={LABEL_CLASSES}>
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Intro to Algebra"
            className={INPUT_CLASSES}
            {...register('title')}
          />
          {errors.title ? (
            <p className={ERROR_CLASSES}>{errors.title.message}</p>
          ) : (
            <p className={HINT_CLASSES}>Shown as the course name everywhere.</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className={LABEL_CLASSES}>
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="What will students learn in this course?"
            className={INPUT_CLASSES}
            {...register('description')}
          />
          {errors.description && (
            <p className={ERROR_CLASSES}>{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t border-surface-200 pt-6 dark:border-slate-800">
        <p className={SECTION_LABEL_CLASSES}>Pricing &amp; category</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className={LABEL_CLASSES}>
              Price (USD)
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400 dark:text-slate-500">
                $
              </span>
              <input
                id="price"
                type="number"
                step="0.01"
                min={0}
                className={`${INPUT_CLASSES} mt-0 pl-6`}
                {...register('price', { valueAsNumber: true })}
              />
            </div>
            {errors.price ? (
              <p className={ERROR_CLASSES}>{errors.price.message}</p>
            ) : (
              <p className={HINT_CLASSES}>Set to 0 to make this course free.</p>
            )}
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
            <p className={HINT_CLASSES}>
              Only Published courses are visible in the catalog.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-surface-200 pt-6 dark:border-slate-800">
        <p className={SECTION_LABEL_CLASSES}>Media</p>

        <ThumbnailField
          register={register}
          setValue={setValue}
          value={watch('thumbnailUrl')}
          error={errors.thumbnailUrl}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-surface-200 pt-6 dark:border-slate-800">
        <Button type="submit" loading={isPending}>
          {isPending
            ? 'Saving…'
            : mode === 'create'
              ? 'Create course'
              : 'Save changes'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
