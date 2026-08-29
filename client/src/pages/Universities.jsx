import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { get, formatFcfa } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import UniversityCard from '../components/UniversityCard.jsx';
import Spinner, { ErrorBox, EmptyState } from '../components/Spinner.jsx';
import { IconSearch, IconScale } from '../components/Icons.jsx';

const DEGREE_LABELS = {
  LICENCE: 'Licence',
  MASTER: 'Master',
  DOCTORAT: 'Doctorat',
  BTS: 'BTS',
  DUT: 'DUT',
  AUTRE: 'Autre',
};

export default function Universities() {
  const { t } = useI18n();
  const compare = useCompare();
  const [params, setParams] = useSearchParams();

  const [filters, setFilters] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = useMemo(() => Object.fromEntries(params.entries()), [params]);

  useEffect(() => {
    get('/universities/filters')
      .then(setFilters)
      .catch(() => setFilters(null));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const search = new URLSearchParams(params);
    if (!search.get('limit')) search.set('limit', '12');
    get(`/universities?${search.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
    // Tout changement de filtre ramène à la première page.
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const reset = () => setParams(new URLSearchParams());

  const Select = ({ name, label, options, render = (o) => o }) => (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      <select
        id={`f-${name}`}
        className="input"
        value={query[name] || ''}
        onChange={(e) => update(name, e.target.value)}
      >
        <option value="">{t('uni.all')}</option>
        {(options || []).map((o) => (
          <option key={o} value={o}>{render(o)}</option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <PageHeader title={t('uni.title')} subtitle={t('uni.subtitle')}>
        {compare.ids.length > 0 && (
          <Link to="/comparateur" className="btn-accent">
            <IconScale size={18} /> {t('uni.compare.open')} ({compare.ids.length})
          </Link>
        )}
      </PageHeader>

      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filtres */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-ink-900">{t('uni.filters')}</h2>
                <button type="button" onClick={reset} className="text-xs font-semibold text-brand-700 hover:underline">
                  {t('uni.filters.reset')}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="f-q">{t('uni.filters.search')}</label>
                  <div className="relative">
                    <IconSearch size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      id="f-q"
                      type="search"
                      className="input pl-10"
                      defaultValue={query.q || ''}
                      placeholder="UCAD, Dakar…"
                      onKeyDown={(e) => e.key === 'Enter' && update('q', e.currentTarget.value)}
                      onBlur={(e) => update('q', e.currentTarget.value)}
                    />
                  </div>
                </div>

                <Select name="city" label={t('uni.filters.city')} options={filters?.cities} />
                <Select
                  name="type"
                  label={t('uni.filters.type')}
                  options={filters?.types}
                  render={(o) => (o === 'PUBLIQUE' ? t('uni.public') : t('uni.private'))}
                />
                <Select name="field" label={t('uni.filters.field')} options={filters?.fields} />
                <Select
                  name="degree"
                  label={t('uni.filters.degree')}
                  options={filters?.degrees}
                  render={(o) => DEGREE_LABELS[o] || o}
                />
                <Select name="language" label={t('uni.filters.language')} options={filters?.languages} />

                <div>
                  <label className="label" htmlFor="f-budget">
                    {t('uni.filters.budget')} :{' '}
                    <span className="font-semibold text-ink-800">
                      {query.budgetMax ? formatFcfa(Number(query.budgetMax)) : t('uni.all')}
                    </span>
                  </label>
                  <input
                    id="f-budget"
                    type="range"
                    min="0"
                    max={filters?.maxTuition || 3000000}
                    step="50000"
                    value={query.budgetMax || filters?.maxTuition || 3000000}
                    onChange={(e) => update('budgetMax', e.target.value)}
                    className="w-full accent-brand-600"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
                  <input
                    type="checkbox"
                    checked={query.housing === 'true'}
                    onChange={(e) => update('housing', e.target.checked ? 'true' : '')}
                    className="h-4 w-4 rounded border-ink-100 text-brand-600 focus:ring-brand-500"
                  />
                  {t('uni.filters.housing')}
                </label>
              </div>
            </div>
          </aside>

          {/* Résultats */}
          <section>
            {loading && <Spinner />}
            {error && !loading && <ErrorBox message={error} onRetry={() => setParams(new URLSearchParams(params))} />}

            {!loading && !error && data && (
              <>
                <p className="mb-5 text-sm text-ink-400">
                  <span className="font-semibold text-ink-800">{data.pagination.total}</span> {t('uni.results')}
                </p>

                {data.data.length === 0 ? (
                  <EmptyState title={t('uni.empty')} description={t('uni.filters.reset')} />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {data.data.map((u) => (
                      <UniversityCard key={u.id} university={u} />
                    ))}
                  </div>
                )}

                {data.pagination.pages > 1 && (
                  <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update('page', String(p))}
                        aria-current={data.pagination.page === p ? 'page' : undefined}
                        className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                          data.pagination.page === p
                            ? 'bg-brand-700 text-white'
                            : 'bg-white text-ink-600 ring-1 ring-ink-100 hover:bg-ink-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
