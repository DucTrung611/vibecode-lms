export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  tokensUsed: number | null;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  studentId: string;
  courseId: string | null;
  title: string | null;
  createdAt: string;
  messages?: ChatMessage[];
}

export interface SendMessageResult {
  messageId: string;
  role: string;
  content: string;
  sourcesUsed: string[];
}
