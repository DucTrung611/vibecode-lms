import { useState } from 'react';
import { Button } from '@/shared/components/Button';

interface ChatComposerProps {
  onSend: (content: string) => void;
  isPending: boolean;
}

export function ChatComposer({ onSend, isPending }: ChatComposerProps) {
  const [content, setContent] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (trimmed) {
          onSend(trimmed);
          setContent('');
        }
      }}
      className="flex items-center gap-2 border-t border-surface-200 bg-surface-0 p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4"
    >
      <label htmlFor="chat-message" className="sr-only">
        Message
      </label>
      <input
        id="chat-message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ask a question…"
        disabled={isPending}
        className="w-full rounded-control border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <Button type="submit" loading={isPending} disabled={!content.trim()}>
        {isPending ? 'Sending…' : 'Send'}
      </Button>
    </form>
  );
}
