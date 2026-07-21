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
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Written answer
        </label>
        <textarea
          id="content"
          rows={6}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('content')}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="fileUrl"
            className="block text-sm font-medium text-gray-700"
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
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('fileUrl')}
        />
        {(errors.fileUrl ?? errors.content) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.fileUrl?.message ?? errors.content?.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Submitting…' : 'Submit assignment'}
      </Button>
    </form>
  );
}
