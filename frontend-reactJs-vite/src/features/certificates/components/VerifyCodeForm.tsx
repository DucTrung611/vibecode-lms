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
      className="mt-4 flex gap-2"
    >
      <label htmlFor="certificate-code" className="sr-only">
        Certificate code
      </label>
      <input
        id="certificate-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Certificate code"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
      <Button type="submit">Verify</Button>
    </form>
  );
}
