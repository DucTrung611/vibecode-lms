import { useState } from 'react';
import { Button } from '@/shared/components/Button';

interface VerifyCodeFormProps {
  onSubmit: (code: string) => void;
}

export function VerifyCodeForm({ onSubmit }: VerifyCodeFormProps) {
  const [code, setCode] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = code.trim();
        if (trimmed) {
          onSubmit(trimmed);
        }
      }}
      className="mt-6 flex flex-col gap-3 sm:flex-row"
    >
      <label htmlFor="certificate-code" className="sr-only">
        Certificate code
      </label>
      <input
        id="certificate-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Certificate code"
        className="w-full rounded-control border border-slate-300 bg-surface-0 px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <Button type="submit" className="shrink-0">
        Verify
      </Button>
    </form>
  );
}
