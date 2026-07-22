import { useState } from 'react';
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
import type { UpdateCourseFormValues } from '../types/courses.types';

interface CategoryPickerProps {
  register: UseFormRegister<UpdateCourseFormValues>;
  setValue: UseFormSetValue<UpdateCourseFormValues>;
}

const SELECT_CLASSES =
  'mt-1 w-full rounded-control border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function CategoryPicker({ register, setValue }: CategoryPickerProps) {
  const categories = useCategories();
  const createCategory = useCreateCategory();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Category <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
        </label>
        <button
          type="button"
          onClick={() => setIsAddingCategory((prev) => !prev)}
          className="rounded-control text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
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
            className={SELECT_CLASSES}
          />
          <Button
            type="button"
            variant="secondary"
            loading={createCategory.isPending}
            disabled={!newCategoryName.trim()}
            onClick={() => {
              createCategory.mutate(newCategoryName.trim(), {
                onSuccess: (category) => {
                  setValue('categoryId', category.id, { shouldValidate: true });
                  setNewCategoryName('');
                  setIsAddingCategory(false);
                },
              });
            }}
          >
            Add
          </Button>
        </div>
      ) : (
        <select id="categoryId" className={SELECT_CLASSES} {...register('categoryId')}>
          <option value="">No category</option>
          {(categories.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
