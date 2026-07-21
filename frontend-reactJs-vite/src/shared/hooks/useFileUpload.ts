import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { uploadFile } from '@/shared/services/upload.service';
import { getErrorMessage } from '@/shared/utils/get-error-message';

export function useFileUpload() {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not upload file'));
    },
  });
}
