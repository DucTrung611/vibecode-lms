import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { FileUploadButton } from '@/shared/components/FileUploadButton';
import {
  submissionFormSchema,
  type SubmissionFormValues,
} from '../types/assignment.types';

interface SubmissionFormProps {
  isPending: boolean;
  onSubmit: (values: SubmissionFormValues) => void;
}

export function SubmissionForm({ isPending, onSubmit }: SubmissionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: { fileUrl: '', content: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 space-y-4"
      noValidate
    >
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Written answer
        </label>
        <textarea
          id="content"
          rows={6}
          className="mt-1.5 w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...register('content')}
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="fileUrl"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            File URL
          </label>
          <FileUploadButton
            label="Upload file"
            onUploaded={(fileUrl) =>
              setValue('fileUrl', fileUrl, { shouldValidate: true })
            }
          />
        </div>
        <input
          id="fileUrl"
          type="url"
          placeholder="https://…"
          className="mt-1.5 w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...register('fileUrl')}
        />
        {(errors.fileUrl ?? errors.content) && (
          <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-500">
            {errors.fileUrl?.message ?? errors.content?.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isPending}
        loading={isPending}
      >
        {isPending ? 'Submitting…' : 'Submit assignment'}
      </Button>
    </form>
  );
}
