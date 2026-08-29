import { IconStar } from './Icons.jsx';

/** Affichage (et saisie facultative) d'une note sur 5. */
export default function StarRating({ value = 0, onChange, size = 18, showValue = false }) {
  const interactive = typeof onChange === 'function';

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <IconStar
            size={size}
            filled={filled}
            className={filled ? 'text-sand-500' : 'text-ink-100'}
          />
        );
        return interactive ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="rounded transition-transform hover:scale-110"
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-ink-600">
          {value ? value.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}
