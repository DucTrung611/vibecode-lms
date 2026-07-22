import { useRef, type ChangeEvent } from 'react';
import { useFileUpload } from '@/shared/hooks/useFileUpload';

interface FileUploadButtonProps {
  onUploaded: (fileUrl: string) => void;
  accept?: string;
  label?: string;
}

export function FileUploadButton({
  onUploaded,
  accept,
  label = 'Upload file',
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useFileUpload();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    upload.mutate(file, {
      onSuccess: (result) => onUploaded(result.fileUrl),
      onSettled: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      },
    });
  }

  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-dashed border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-950/70 ${upload.isPending ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
        disabled={upload.isPending}
      />
      {upload.isPending ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Uploading…
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 3a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V4a1 1 0 011-1z" />
            <path d="M4 15a1 1 0 011 1v1a1 1 0 001 1h8a1 1 0 001-1v-1a1 1 0 112 0v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1a1 1 0 011-1z" />
          </svg>
          {label}
        </>
      )}
    </label>
  );
}
