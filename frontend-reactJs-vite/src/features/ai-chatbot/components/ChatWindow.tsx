import { useEffect, useRef } from 'react';
import { Skeleton } from '@/shared/components/Skeleton';
import { ChatComposer } from './ChatComposer';
import { ChatMessageBubble } from './ChatMessageBubble';
import { useChatSession } from '../hooks/useChatSession';
import { useSendChatMessage } from '../hooks/useSendChatMessage';

interface ChatWindowProps {
  sessionId: string;
}

export function ChatWindow({ sessionId }: ChatWindowProps) {
  const { data: session, isPending, isError } = useChatSession(sessionId);
  const sendMessage = useSendChatMessage(sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages?.length, sendMessage.isPending]);

  if (isPending) {
    return (
      <div className="space-y-3 rounded-card border border-surface-200 bg-surface-0 p-4 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="ml-auto h-10 w-1/2" />
        <Skeleton className="h-10 w-3/5" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="rounded-card border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400">
        Could not load this chat session.
      </div>
    );
  }

  const messages = session.messages ?? [];

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-card border border-surface-200 bg-surface-0 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:h-[65vh]">
      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Start a conversation
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ask a question about your course and the AI assistant will help.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))
        )}
        {sendMessage.isPending ? (
          <div className="flex justify-start" role="status" aria-live="polite">
            <div className="flex items-center gap-1.5 rounded-card bg-surface-100 px-4 py-3 dark:bg-slate-800">
              <span className="sr-only">Assistant is typing</span>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
      <ChatComposer
        onSend={(content) => sendMessage.mutate(content)}
        isPending={sendMessage.isPending}
      />
    </div>
  );
}
