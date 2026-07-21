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
      className="flex gap-2"
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
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
      />
      <Button type="submit" disabled={isPending || !content.trim()}>
        {isPending ? 'Sending…' : 'Send'}
      </Button>
    </form>
  );
}
