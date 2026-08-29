import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, post, formatFcfa, formatDate } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import Spinner, { ErrorBox } from '../components/Spinner.jsx';
import StarRating from '../components/StarRating.jsx';
import MapView from '../components/MapView.jsx';
import { IconPin, IconGlobe, IconHeart, IconScale, IconCheck, IconArrow } from '../components/Icons.jsx';

const DEGREE_LABELS = {
  LICENCE: 'Licence',
  MASTER: 'Master',
  DOCTORAT: 'Doctorat',
  BTS: 'BTS',
  DUT: 'DUT',
  AUTRE: 'Autre',
};

function ReviewForm({ universityId, onDone }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setStatus({ type: 'error', text: 'Choisissez une note.' });
    setBusy(true);
    setStatus(null);
    try {
      const res = await post('/reviews', { universityId, rating, title, comment });
      setStatus({ type: 'ok', text: res.message });
      setTitle('');
      setComment('');
      setRating(0);
      onDone?.();
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
      <h3 className="font-display font-bold text-ink-900">{t('uni.detail.writeReview')}</h3>
      <div>
        <span className="label">Note</span>
        <StarRating value={rating} onChange={setRating} size={26} />
      </div>
      <div>
        <label className="label" htmlFor="r-title">Titre</label>
        <input id="r-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <div>
        <label className="label" htmlFor="r-comment">Votre avis</label>
        <textarea
          id="r-comment"
          className="input min-h-[110px]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={10}
        />
      </div>
      {status && (
        <p className={`text-sm ${status.type === 'ok' ? 'text-brand-700' : 'text-red-600'}`}>{status.text}</p>
      )}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? t('common.loading') : t('uni.detail.writeReview')}
      </button>
    </form>
  );
}

export default function UniversityDetail() {
  const { slug } = useParams();
  const { t, locale } = useI18n();
  const { isAuthenticated, favoriteIds, toggleFavorite } = useAuth();
  const compare = useCompare();

  const [uni, setUni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    get(`/universities/${slug}`)
      .then((r) => setUni(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug]);

  if (loading) return <Spinner />;
  if (error) return <div className="container-page py-12"><ErrorBox message={error} onRetry={load} /></div>;
  if (!uni) return null;

  const isFav = favoriteIds.includes(uni.id);
  const byDegree = uni.programs.reduce((acc, p) => {
    (acc[p.degree] ||= []).push(p);
    return acc;
  }, {});

  const facts = [
    { label: t('uni.detail.students'), value: uni.studentCount ? uni.studentCount.toLocaleString('fr-FR') : '—' },
    { label: t('uni.detail.founded'), value: uni.foundedYear || '—' },
    { label: t('uni.filters.language'), value: uni.languages },
    { label: t('uni.detail.housing'), value: uni.hasCampusHousing ? t('common.yes') : t('common.no') },
  ];

  return (
    <>
      {/* Bandeau */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_30%,white_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        <div className="container-page relative py-12">
          <Link to="/universites" className="text-sm text-white/70 hover:text-white">
            ← {t('uni.title')}
          </Link>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-white/15 text-white ring-1 ring-inset ring-white/25">
                  {uni.type === 'PUBLIQUE' ? t('uni.public') : t('uni.private')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
                  <IconPin size={15} /> {uni.city}
                  {uni.region && uni.region !== uni.city ? `, ${uni.region}` : ''}
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">{uni.name}</h1>
              <div className="mt-3 flex items-center gap-2">
                <StarRating value={uni.rating} size={18} />
                <span className="text-sm text-white/70">
                  {uni.rating ? uni.rating.toFixed(1) : '—'} · {uni.reviewCount} {t('uni.detail.reviews').toLowerCase()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => toggleFavorite(uni.id)}
                  className={`btn ${isFav ? 'bg-white text-red-500' : 'bg-white/15 text-white ring-1 ring-inset ring-white/25 hover:bg-white/25'}`}
                >
                  <IconHeart size={18} filled={isFav} /> {t('nav.favorites')}
                </button>
              )}
              <button
                type="button"
                onClick={() => compare.toggle(uni.id)}
                className={`btn ${compare.has(uni.id) ? 'bg-sand-500 text-white' : 'bg-white/15 text-white ring-1 ring-inset ring-white/25 hover:bg-white/25'}`}
              >
                <IconScale size={18} />
                {compare.has(uni.id) ? t('uni.compare.added') : t('uni.compare.add')}
              </button>
              {uni.website && (
                <a href={uni.website} target="_blank" rel="noreferrer noopener" className="btn bg-white text-brand-800 hover:bg-brand-50">
                  <IconGlobe size={18} /> {t('uni.detail.website')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <section className="card p-6">
              <h2 className="font-display text-xl font-bold text-ink-900">{t('uni.detail.about')}</h2>
              <p className="prose-unigo mt-3 whitespace-pre-line">{uni.description}</p>
            </section>

            <section className="card p-6">
              <h2 className="font-display text-xl font-bold text-ink-900">{t('uni.detail.programs')}</h2>
              <div className="mt-4 space-y-6">
                {Object.entries(byDegree).map(([degree, programs]) => (
                  <div key={degree}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">
                      {DEGREE_LABELS[degree] || degree}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                            <th className="pb-2 pr-4 font-medium">Filière</th>
                            <th className="pb-2 pr-4 font-medium">{t('uni.filters.field')}</th>
                            <th className="pb-2 pr-4 font-medium">{t('uni.detail.duration')}</th>
                            <th className="pb-2 font-medium">{t('uni.detail.tuition')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                          {programs.map((p) => (
                            <tr key={p.id}>
                              <td className="py-3 pr-4 font-medium text-ink-800">{p.name}</td>
                              <td className="py-3 pr-4 text-ink-600">{p.field}</td>
                              <td className="py-3 pr-4 text-ink-600">
                                {p.durationYears} {t('uni.detail.years')}
                              </td>
                              <td className="py-3 font-semibold text-ink-800">{formatFcfa(p.tuitionFcfa)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-xl bg-sand-50 p-3 text-xs text-sand-800">
                Frais indicatifs — à confirmer auprès de l'établissement avant toute inscription.
              </p>
            </section>

            {(uni.admissionInfo || uni.scholarships) && (
              <section className="grid gap-5 sm:grid-cols-2">
                {uni.admissionInfo && (
                  <div className="card p-6">
                    <h2 className="font-display text-lg font-bold text-ink-900">{t('uni.detail.admission')}</h2>
                    <p className="prose-unigo mt-3 whitespace-pre-line">{uni.admissionInfo}</p>
                  </div>
                )}
                {uni.scholarships && (
                  <div className="card p-6">
                    <h2 className="font-display text-lg font-bold text-ink-900">{t('uni.detail.scholarships')}</h2>
                    <p className="prose-unigo mt-3 whitespace-pre-line">{uni.scholarships}</p>
                  </div>
                )}
              </section>
            )}

            {/* Avis */}
            <section className="card p-6">
              <h2 className="font-display text-xl font-bold text-ink-900">{t('uni.detail.reviews')}</h2>

              {uni.reviews.length === 0 ? (
                <p className="prose-unigo mt-3">{t('uni.detail.noreviews')}</p>
              ) : (
                <ul className="mt-4 divide-y divide-ink-100">
                  {uni.reviews.map((r) => (
                    <li key={r.id} className="py-4 first:pt-0">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                          {r.user.fullName.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-ink-800">{r.user.fullName}</p>
                          <p className="text-xs text-ink-400">
                            {r.user.countryOrigin ? `${r.user.countryOrigin} · ` : ''}
                            {formatDate(r.createdAt, locale === 'en' ? 'en-GB' : 'fr-FR')}
                          </p>
                        </div>
                        <span className="ml-auto"><StarRating value={r.rating} size={15} /></span>
                      </div>
                      {r.title && <p className="mt-3 font-semibold text-ink-800">{r.title}</p>}
                      <p className="prose-unigo mt-1">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              )}

              {isAuthenticated ? (
                <ReviewForm universityId={uni.id} onDone={load} />
              ) : (
                <p className="mt-5 rounded-xl bg-ink-50 p-4 text-sm text-ink-600">
                  <Link to="/connexion" className="link font-semibold">{t('nav.login')}</Link> — {t('uni.detail.loginToReview')}
                </p>
              )}
            </section>

            {uni.testimonials?.length > 0 && (
              <section className="card p-6">
                <h2 className="font-display text-xl font-bold text-ink-900">{t('uni.detail.testimonials')}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {uni.testimonials.map((tm) => (
                    <figure key={tm.id} className="rounded-xl bg-ink-50 p-4">
                      <blockquote className="prose-unigo">« {tm.content} »</blockquote>
                      <figcaption className="mt-2 text-xs font-medium text-ink-400">
                        {tm.authorName} — {tm.country}{tm.year ? ` (${tm.year})` : ''}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Colonne latérale */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-ink-900">En bref</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-3 border-b border-ink-100 pb-3 last:border-0 last:pb-0">
                    <dt className="text-ink-400">{f.label}</dt>
                    <dd className="text-right font-semibold text-ink-800">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-ink-900">{t('uni.detail.contact')}</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-600">
                {uni.address && <li className="flex gap-2"><IconPin size={16} className="mt-0.5 shrink-0 text-brand-600" />{uni.address}</li>}
                {uni.phone && <li>☎ {uni.phone}</li>}
                {uni.email && <li>✉ <a href={`mailto:${uni.email}`} className="link">{uni.email}</a></li>}
                {uni.website && (
                  <li className="truncate">
                    <a href={uni.website} target="_blank" rel="noreferrer noopener" className="link">{uni.website}</a>
                  </li>
                )}
              </ul>
              {uni.latitude && uni.longitude && (
                <div className="mt-4">
                  <MapView
                    height={220}
                    zoom={13}
                    points={[{ id: uni.id, lat: uni.latitude, lng: uni.longitude, title: uni.name, subtitle: uni.city }]}
                  />
                </div>
              )}
            </div>

            <div className="card bg-brand-700 p-5 text-white">
              <p className="font-display font-bold">{t('proc.title')}</p>
              <p className="mt-1.5 text-sm text-white/80">{t('proc.subtitle')}</p>
              <Link to="/demarches" className="btn mt-4 bg-white text-brand-800 hover:bg-brand-50">
                {t('home.cta.procedures')} <IconArrow size={16} />
              </Link>
            </div>

            {uni.hasCampusHousing && (
              <p className="flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                <IconCheck size={16} /> {t('uni.detail.housing')} : {t('common.yes')}
              </p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
