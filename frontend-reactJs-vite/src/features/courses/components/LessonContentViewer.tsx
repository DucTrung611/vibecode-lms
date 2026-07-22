import { Link } from 'react-router-dom';
import type { Lesson } from '../types/courses.types';

interface LessonContentViewerProps {
  lesson: Lesson;
}

function getYouTubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtube.com') {
    if (parsed.pathname === '/watch') {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (parsed.pathname.startsWith('/embed/')) return url;
  }
  if (host === 'youtu.be') {
    const videoId = parsed.pathname.slice(1);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  return null;
}

export function LessonContentViewer({ lesson }: LessonContentViewerProps) {
  const embedUrl = lesson.videoUrl ? getYouTubeEmbedUrl(lesson.videoUrl) : null;

  return (
    <div className="rounded-card border border-surface-200 bg-surface-0 p-4 dark:border-slate-800 dark:bg-slate-900">
      {lesson.type === 'VIDEO' && embedUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-control bg-black">
          <iframe
            src={embedUrl}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : lesson.type === 'VIDEO' && lesson.videoUrl ? (
        <video
          src={lesson.videoUrl}
          controls
          className="w-full rounded-control bg-black"
        />
      ) : lesson.type === 'TEXT' && lesson.content ? (
        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
          {lesson.content}
        </p>
      ) : lesson.quizId ? (
        <p className="text-slate-700 dark:text-slate-300">
          This lesson has a quiz.{' '}
          <Link
            to={`/quizzes/${lesson.quizId}/attempt`}
            className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            Take the quiz
          </Link>
        </p>
      ) : lesson.assignmentId ? (
        <p className="text-slate-700 dark:text-slate-300">
          This lesson has an assignment.{' '}
          <Link
            to={`/assignments/${lesson.assignmentId}/submit`}
            className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            View the assignment
          </Link>
        </p>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">
          No content for this lesson yet.
        </p>
      )}
    </div>
  );
}
