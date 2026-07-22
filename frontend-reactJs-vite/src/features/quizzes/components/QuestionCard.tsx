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
    <fieldset className="rounded-card border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <legend className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
        {index + 1}. {question.content}{' '}
        <span className="inline-flex items-center rounded-pill bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
          {question.points} pts
        </span>
      </legend>

      {question.type === 'TEXT' ? (
        <textarea
          rows={3}
          className="mt-3 w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          value={answer?.answerText ?? ''}
          onChange={(e) =>
            onChange({ questionId: question.id, answerText: e.target.value })
          }
        />
      ) : (
        <div className="mt-3 space-y-2">
          {question.options?.map((option) => {
            const selected = answer?.selectedOptionId === option.id;
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-control border px-3 py-2.5 text-sm transition-colors ${
                  selected
                    ? 'border-brand-600 bg-brand-50 text-brand-900 dark:border-brand-500 dark:bg-brand-950/30 dark:text-brand-200'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-surface-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selected}
                  onChange={() =>
                    onChange({
                      questionId: question.id,
                      selectedOptionId: option.id,
                    })
                  }
                  className="h-4 w-4 shrink-0 accent-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                />
                {option.content}
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
