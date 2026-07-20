import type { PropsWithChildren } from 'react';

interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
