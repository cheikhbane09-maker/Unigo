import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, formatFcfa } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import Spinner, { ErrorBox } from '../components/Spinner.jsx';
import { IconCheck, IconGlobe } from '../components/Icons.jsx';

export default function ProcedureDetail() {
  const { slug } = useParams();
  const { t } = useI18n();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    get(`/procedures/${slug}`)
      .then((r) => setRow(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner />;
  if (error) return <div className="container-page py-12"><ErrorBox message={error} /></div>;
  if (!row) return null;

  const steps = row.content.split('\n').filter(Boolean);
  const documents = (row.documents || '').split('\n').filter(Boolean);

  return (
    <div className="container-page py-10">
      <Link to="/demarches" className="text-sm text-ink-400 hover:text-brand-700">← {t('proc.back')}</Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_300px]">
        <article>
          <span className="badge-sand">{row.category}</span>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ink-900">{row.title}</h1>
          <p className="prose-unigo mt-4 text-base">{row.summary}</p>

          <section className="card mt-8 p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">{t('proc.steps')}</h2>
            <ol className="mt-5 space-y-5">
              {steps.map((s, i) => (
                <li key={i} className="relative pl-11">
                  <span className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <p className="prose-unigo pt-1">{s.replace(/^\d+\.\s*/, '')}</p>
                </li>
              ))}
            </ol>
          </section>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {documents.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-ink-900">{t('proc.documents')}</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-600">
                {documents.map((d) => (
                  <li key={d} className="flex gap-2">
                    <IconCheck size={16} className="mt-0.5 shrink-0 text-brand-600" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-5">
            <dl className="space-y-3 text-sm">
              {row.estimatedDelay && (
                <div>
                  <dt className="text-ink-400">{t('proc.delay')}</dt>
                  <dd className="font-semibold text-ink-800">{row.estimatedDelay}</dd>
                </div>
              )}
              {row.estimatedCostFcfa ? (
                <div>
                  <dt className="text-ink-400">{t('proc.cost')}</dt>
                  <dd className="font-semibold text-ink-800">{formatFcfa(row.estimatedCostFcfa)}</dd>
                </div>
              ) : null}
            </dl>
            {row.officialLink && (
              <a href={row.officialLink} target="_blank" rel="noreferrer noopener" className="btn-secondary mt-4 w-full">
                <IconGlobe size={16} /> {t('proc.official')}
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
