import type { ChatMessage } from '../types/chat.types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'USER';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <p
        className={`max-w-[80%] whitespace-pre-wrap rounded-card px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-surface-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
        }`}
      >
        {message.content}
      </p>
    </div>
  );
}
