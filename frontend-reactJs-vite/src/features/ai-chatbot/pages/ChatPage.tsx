import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { ChatWindow } from '../components/ChatWindow';
import { useCreateChatSession } from '../hooks/useCreateChatSession';

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const createSession = useCreateChatSession();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (sessionId || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    createSession.mutate(searchParams.get('courseId') ?? undefined, {
      onSuccess: (session) => {
        navigate(`/chat/${session.id}`, { replace: true });
      },
    });
    // Intentionally runs once per mount, guarded by hasStartedRef — not on
    // every createSession/searchParams/navigate identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">AI Assistant</h1>

      {sessionId ? (
        <ChatWindow sessionId={sessionId} />
      ) : (
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      )}
    </div>
  );
}
