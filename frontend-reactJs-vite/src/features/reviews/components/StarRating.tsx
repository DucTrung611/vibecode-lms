interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
}

const STARS = [1, 2, 3, 4, 5];

export function StarRating({ rating, onChange }: StarRatingProps) {
  return (
    <div
      className="flex gap-1"
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
          className={
            star <= rating
              ? 'text-yellow-400 disabled:cursor-default'
              : 'text-gray-300 disabled:cursor-default'
          }
        >
          ★
        </button>
      ))}
    </div>
  );
}
