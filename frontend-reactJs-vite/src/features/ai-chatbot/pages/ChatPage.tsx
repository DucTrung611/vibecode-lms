import { useEffect, useRef, useState } from 'react';
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
  const [startError, setStartError] = useState(false);

  useEffect(() => {
    if (sessionId || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    createSession
      .mutateAsync(searchParams.get('courseId') ?? undefined)
      .then((session) => {
        navigate(`/chat/${session.id}`, { replace: true });
      })
      .catch(() => {
        setStartError(true);
      });
    // Runs once per mount, guarded by hasStartedRef — not on every
    // createSession/searchParams/navigate identity change. Navigation is
    // driven by mutateAsync's own returned promise rather than the mutation
    // hook's reactive onSuccess/data, since that reactive state can miss an
    // update if StrictMode's mount/cleanup/remount replay detaches the
    // mutation observer mid-flight in development.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          AI Assistant
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ask questions about your course content and get instant answers.
        </p>
      </div>

      {sessionId ? (
        <ChatWindow sessionId={sessionId} />
      ) : startError ? (
        <div className="rounded-card border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400">
          Could not start a chat session. Please try again later.
        </div>
      ) : (
        <div className="space-y-3 rounded-card border border-surface-200 bg-surface-0 p-4 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="ml-auto h-10 w-1/2" />
        </div>
      )}
    </div>
  );
}
