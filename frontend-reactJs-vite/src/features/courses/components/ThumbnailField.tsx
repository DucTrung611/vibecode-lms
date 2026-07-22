import type { FieldError, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { FileUploadButton } from '@/shared/components/FileUploadButton';
import type { UpdateCourseFormValues } from '../types/courses.types';

interface ThumbnailFieldProps {
  register: UseFormRegister<UpdateCourseFormValues>;
  setValue: UseFormSetValue<UpdateCourseFormValues>;
  value?: string;
  error?: FieldError;
}

export function ThumbnailField({
  register,
  setValue,
  value,
  error,
}: ThumbnailFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="thumbnailUrl"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Thumbnail <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
        </label>
        <FileUploadButton
          accept="image/*"
          label="Upload image"
          onUploaded={(fileUrl) =>
            setValue('thumbnailUrl', fileUrl, { shouldValidate: true })
          }
        />
      </div>

      <div className="mt-1 flex items-start gap-3">
        {value ? (
          <img
            src={value}
            alt=""
            className="h-16 w-28 shrink-0 rounded-control border border-surface-200 object-cover dark:border-slate-700"
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
        ) : (
          <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-control border border-dashed border-surface-200 text-[10px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
            No image
          </div>
        )}
        <div className="flex-1">
          <input
            id="thumbnailUrl"
            type="url"
            placeholder="https://…"
            className="w-full rounded-control border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register('thumbnailUrl')}
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Shown on the course catalog and detail page. Paste a URL or upload an image.
          </p>
          {error && (
            <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
              {error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
