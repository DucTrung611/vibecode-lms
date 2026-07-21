import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { FileUploadButton } from '@/shared/components/FileUploadButton';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
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

  const categories = useCategories();
  const createCategory = useCreateCategory();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('title')}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (USD)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700">
            Level
          </label>
          <select
            id="level"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            {...register('level')}
          >
            {COURSE_LEVELS.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <button
            type="button"
            onClick={() => setIsAddingCategory((prev) => !prev)}
            className="text-xs font-medium text-purple-600 hover:underline"
          >
            {isAddingCategory ? 'Cancel' : '+ New category'}
          </button>
        </div>

        {isAddingCategory ? (
          <div className="mt-1 flex gap-2">
            <input
              id="categoryId"
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={createCategory.isPending || !newCategoryName.trim()}
              onClick={() => {
                createCategory.mutate(newCategoryName.trim(), {
                  onSuccess: (category) => {
                    setValue('categoryId', category.id, {
                      shouldValidate: true,
                    });
                    setNewCategoryName('');
                    setIsAddingCategory(false);
                  },
                });
              }}
            >
              {createCategory.isPending ? 'Adding…' : 'Add'}
            </Button>
          </div>
        ) : (
          <select
            id="categoryId"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            {...register('categoryId')}
          >
            <option value="">No category</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {mode === 'edit' && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            {...register('status')}
          >
            {COURSE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="thumbnailUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Thumbnail URL
          </label>
          <FileUploadButton
            accept="image/*"
            label="Upload image"
            onUploaded={(fileUrl) =>
              setValue('thumbnailUrl', fileUrl, { shouldValidate: true })
            }
          />
        </div>
        <input
          id="thumbnailUrl"
          type="url"
          placeholder="https://…"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('thumbnailUrl')}
        />
        {errors.thumbnailUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.thumbnailUrl.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending
          ? 'Saving…'
          : mode === 'create'
            ? 'Create course'
            : 'Save changes'}
      </Button>
    </form>
  );
}
