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
    <label className="inline-flex cursor-pointer items-center text-sm font-medium text-purple-600 hover:underline">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
        disabled={upload.isPending}
      />
      {upload.isPending ? 'Uploading…' : label}
    </label>
  );
}
