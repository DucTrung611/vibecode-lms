interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
}

const STARS = [1, 2, 3, 4, 5];

export function StarRating({ rating, onChange }: StarRatingProps) {
  return (
    <div
      className="flex gap-0.5"
      role={onChange ? 'radiogroup' : undefined}
      aria-label="Rating"
    >
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={onChange ? star <= rating : undefined}
          className={`text-lg leading-none transition-colors duration-150 ${
            star <= rating
              ? 'text-warning-500'
              : 'text-slate-300 dark:text-slate-700'
          } ${
            onChange
              ? 'cursor-pointer rounded-control hover:text-warning-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-95'
              : 'cursor-default'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
