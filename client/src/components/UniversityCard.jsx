import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { formatFcfa } from '../lib/api.js';
import StarRating from './StarRating.jsx';
import { IconHeart, IconPin, IconScale, IconArrow } from './Icons.jsx';

export default function UniversityCard({ university }) {
  const { t } = useI18n();
  const { isAuthenticated, favoriteIds, toggleFavorite } = useAuth();
  const compare = useCompare();
  const [busy, setBusy] = useState(false);

  const isFav = favoriteIds.includes(university.id);
  const inCompare = compare.has(university.id);

  const minTuition = university.programs?.length
    ? Math.min(...university.programs.map((p) => p.tuitionFcfa ?? 0))
    : null;
  const fields = [...new Set((university.programs || []).map((p) => p.field))].slice(0, 3);

  const onFav = async () => {
    if (!isAuthenticated || busy) return;
    setBusy(true);
    try {
      await toggleFavorite(university.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative h-24 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:14px_14px]" />
        <span className="absolute left-4 top-4">
          <span className={university.type === 'PUBLIQUE' ? 'badge bg-white/90 text-brand-800' : 'badge bg-sand-100 text-sand-800'}>
            {university.type === 'PUBLIQUE' ? t('uni.public') : t('uni.private')}
          </span>
        </span>
        {isAuthenticated && (
          <button
            type="button"
            onClick={onFav}
            disabled={busy}
            aria-pressed={isFav}
            aria-label={t('nav.favorites')}
            className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
              isFav ? 'bg-white text-red-500' : 'bg-white/25 text-white hover:bg-white/40'
            }`}
          >
            <IconHeart size={18} filled={isFav} />
          </button>
        )}
        <span className="absolute -bottom-6 left-4 grid h-12 w-12 place-items-center rounded-xl bg-white font-display text-sm font-extrabold text-brand-700 shadow-card ring-1 ring-ink-100">
          {university.acronym || university.name.slice(0, 3).toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-8">
        <h3 className="font-display text-base font-bold leading-snug text-ink-900">
          <Link to={`/universites/${university.slug}`} className="hover:text-brand-700">
            {university.name}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
          <IconPin size={15} /> {university.city}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <StarRating value={university.rating || 0} size={15} />
          <span className="text-xs text-ink-400">({university.reviewCount || 0})</span>
        </div>

        <p className="prose-unigo mt-3 line-clamp-3 text-sm">{university.description}</p>

        {fields.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {fields.map((f) => (
              <span key={f} className="badge-muted">{f}</span>
            ))}
            {university.programs?.length > 3 && (
              <span className="badge-muted">+{university.programs.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between border-t border-ink-100 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-400">{t('uni.detail.tuition')}</p>
            <p className="text-sm font-semibold text-ink-800">
              {minTuition !== null ? `dès ${formatFcfa(minTuition)}` : '—'}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => compare.toggle(university.id)}
              title={inCompare ? t('uni.compare.added') : t('uni.compare.add')}
              className={`grid h-9 w-9 place-items-center rounded-xl ring-1 ring-inset transition ${
                inCompare
                  ? 'bg-sand-500 text-white ring-sand-500'
                  : 'bg-white text-ink-600 ring-ink-100 hover:bg-ink-50'
              }`}
            >
              <IconScale size={17} />
            </button>
            <Link to={`/universites/${university.slug}`} className="btn-primary !px-3">
              <IconArrow size={17} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
