import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFileUpload } from '@/shared/hooks/useFileUpload';
import { FileUploadButton } from '../FileUploadButton';

vi.mock('@/shared/hooks/useFileUpload');

describe('FileUploadButton', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFileUpload).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useFileUpload>);
  });

  it('uploads the selected file and reports its URL on success', async () => {
    const user = userEvent.setup();
    const onUploaded = vi.fn();
    render(<FileUploadButton onUploaded={onUploaded} label="Upload file" />);

    const file = new File(['content'], 'photo.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload file');
    await user.upload(input, file);

    expect(mutate).toHaveBeenCalledWith(
      file,
      expect.objectContaining({ onSuccess: expect.any(Function) as unknown }),
    );

    const onSuccess = mutate.mock.calls[0][1].onSuccess as (result: {
      fileUrl: string;
    }) => void;
    onSuccess({ fileUrl: 'http://localhost:3000/uploads/photo.png' });

    expect(onUploaded).toHaveBeenCalledWith(
      'http://localhost:3000/uploads/photo.png',
    );
  });

  it('shows a pending label and disables the input while uploading', () => {
    vi.mocked(useFileUpload).mockReturnValue({
      mutate,
      isPending: true,
    } as unknown as ReturnType<typeof useFileUpload>);

    render(<FileUploadButton onUploaded={vi.fn()} />);

    expect(screen.getByText('Uploading…')).toBeInTheDocument();
    expect(screen.getByLabelText('Uploading…')).toBeDisabled();
  });
});
