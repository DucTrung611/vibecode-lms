import type { FieldError, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { FileUploadButton } from '@/shared/components/FileUploadButton';
import type { UpdateCourseFormValues } from '../types/courses.types';

interface ThumbnailFieldProps {
  register: UseFormRegister<UpdateCourseFormValues>;
  setValue: UseFormSetValue<UpdateCourseFormValues>;
  error?: FieldError;
}

export function ThumbnailField({ register, setValue, error }: ThumbnailFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="thumbnailUrl"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
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
        className="mt-1 w-full rounded-control border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        {...register('thumbnailUrl')}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
          {error.message}
        </p>
      )}
    </div>
  );
}
