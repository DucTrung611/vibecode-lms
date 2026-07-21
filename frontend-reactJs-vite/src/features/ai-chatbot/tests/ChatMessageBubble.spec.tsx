import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import type { ChatMessage } from '../types/chat.types';

const baseMessage: ChatMessage = {
  id: 'msg_1',
  sessionId: 'session_1',
  role: 'USER',
  content: 'What is a right triangle?',
  tokensUsed: null,
  createdAt: '2026-01-15T00:00:00.000Z',
};

describe('ChatMessageBubble', () => {
  it('renders the message content', () => {
    render(<ChatMessageBubble message={baseMessage} />);

    expect(screen.getByText('What is a right triangle?')).toBeInTheDocument();
  });

  it('right-aligns user messages and left-aligns assistant messages', () => {
    const { container: userContainer } = render(
      <ChatMessageBubble message={baseMessage} />,
    );
    expect(userContainer.firstChild).toHaveClass('justify-end');

    const { container: assistantContainer } = render(
      <ChatMessageBubble message={{ ...baseMessage, role: 'ASSISTANT' }} />,
    );
    expect(assistantContainer.firstChild).toHaveClass('justify-start');
  });
});
