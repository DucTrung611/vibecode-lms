import type { Question, SubmitAnswerPayload } from '../types/quiz.types';

interface QuestionCardProps {
  question: Question;
  index: number;
  answer?: SubmitAnswerPayload;
  onChange: (answer: SubmitAnswerPayload) => void;
}

export function QuestionCard({
  question,
  index,
  answer,
  onChange,
}: QuestionCardProps) {
  return (
    <fieldset className="rounded-lg border border-gray-200 p-4">
      <legend className="px-1 text-sm font-medium text-gray-900">
        {index + 1}. {question.content}{' '}
        <span className="text-gray-400">({question.points} pts)</span>
      </legend>

      {question.type === 'TEXT' ? (
        <textarea
          rows={3}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          value={answer?.answerText ?? ''}
          onChange={(e) =>
            onChange({ questionId: question.id, answerText: e.target.value })
          }
        />
      ) : (
        <div className="mt-2 space-y-2">
          {question.options?.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={answer?.selectedOptionId === option.id}
                onChange={() =>
                  onChange({
                    questionId: question.id,
                    selectedOptionId: option.id,
                  })
                }
                className="text-purple-600 focus:ring-purple-500"
              />
              {option.content}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
