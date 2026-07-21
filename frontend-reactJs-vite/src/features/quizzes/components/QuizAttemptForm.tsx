import { Button } from '@/shared/components/Button';
import { QuestionCard } from './QuestionCard';
import type { Quiz, SubmitAnswerPayload } from '../types/quiz.types';

interface QuizAttemptFormProps {
  quiz: Quiz;
  answers: Record<string, SubmitAnswerPayload>;
  onAnswerChange: (answer: SubmitAnswerPayload) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function QuizAttemptForm({
  quiz,
  answers,
  onAnswerChange,
  onSubmit,
  isSubmitting,
}: QuizAttemptFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>

      {quiz.questions?.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          answer={answers[question.id]}
          onChange={onAnswerChange}
        />
      ))}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Submit answers'}
      </Button>
    </form>
  );
}
