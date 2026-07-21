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
  }, [session?.messages?.length]);

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    );
  }

  if (isError || !session) {
    return <p className="text-red-600">Could not load this chat session.</p>;
  }

  const messages = session.messages ?? [];

  return (
    <div className="flex h-[60vh] flex-col gap-4">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Ask a question to get started.
          </p>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <ChatComposer
        onSend={(content) => sendMessage.mutate(content)}
        isPending={sendMessage.isPending}
      />
    </div>
  );
}
