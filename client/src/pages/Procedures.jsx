import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, formatFcfa } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import { IconDoc, IconArrow } from '../components/Icons.jsx';

export default function Procedures() {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // La liste des catégories est chargée une seule fois, sans filtre.
  useEffect(() => {
    get('/procedures').then((r) => setCategories([...new Set(r.data.map((p) => p.category))]));
  }, []);

  useEffect(() => {
    setLoading(true);
    get(`/procedures${category ? `?category=${encodeURIComponent(category)}` : ''}`)
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <>
      <PageHeader title={t('proc.title')} subtitle={t('proc.subtitle')} />

      <div className="container-page py-10">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`badge px-3 py-1.5 ${!category ? 'bg-brand-700 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-100'}`}
            >
              {t('uni.all')}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`badge px-3 py-1.5 ${category === c ? 'bg-brand-700 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-100'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState title={t('uni.empty')} />
        ) : (
          <ol className="grid gap-5 md:grid-cols-2">
            {rows.map((p, i) => (
              <li key={p.id}>
                <Link
                  to={`/demarches/${p.slug}`}
                  className="card group flex h-full flex-col p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 font-display font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="badge-sand">{p.category}</span>
                      <h2 className="mt-2 font-display text-lg font-bold leading-snug text-ink-900 group-hover:text-brand-700">
                        {p.title}
                      </h2>
                    </div>
                  </div>

                  <p className="prose-unigo mt-4 flex-1">{p.summary}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-100 pt-4 text-xs text-ink-400">
                    {p.estimatedDelay && <span>⏱ {p.estimatedDelay}</span>}
                    {p.estimatedCostFcfa ? <span>💰 {formatFcfa(p.estimatedCostFcfa)}</span> : null}
                    <span className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-700">
                      {t('common.seeMore')} <IconArrow size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 flex items-start gap-3 rounded-2xl bg-sand-50 p-5 text-sm text-sand-900">
          <IconDoc size={20} className="mt-0.5 shrink-0" />
          <p>
            Les informations de ce guide sont fournies à titre indicatif. Les procédures et les pièces
            demandées peuvent évoluer : vérifiez toujours auprès de l'administration compétente ou de
            la représentation diplomatique de votre pays.
          </p>
        </div>
      </div>
    </>
  );
}
