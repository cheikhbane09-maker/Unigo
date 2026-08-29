import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, formatFcfa } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import StarRating from '../components/StarRating.jsx';
import { IconX, IconCheck } from '../components/Icons.jsx';

export default function Compare() {
  const { t } = useI18n();
  const { ids, toggle, clear } = useCompare();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    get(`/universities/compare?ids=${ids.join(',')}`)
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }, [ids]);

  const cheapest = (u) =>
    u.programs?.length ? Math.min(...u.programs.map((p) => p.tuitionFcfa ?? 0)) : null;

  const criteria = [
    { label: t('uni.filters.city'), render: (u) => u.city },
    { label: t('uni.filters.type'), render: (u) => (u.type === 'PUBLIQUE' ? t('uni.public') : t('uni.private')) },
    { label: t('uni.detail.reviews'), render: (u) => <StarRating value={u.rating || 0} size={15} showValue /> },
    { label: t('uni.programs'), render: (u) => u.programs?.length ?? 0 },
    { label: t('uni.detail.tuition'), render: (u) => formatFcfa(cheapest(u)) },
    { label: t('uni.detail.students'), render: (u) => (u.studentCount ? u.studentCount.toLocaleString('fr-FR') : '—') },
    { label: t('uni.detail.founded'), render: (u) => u.foundedYear || '—' },
    { label: t('uni.filters.language'), render: (u) => u.languages },
    {
      label: t('uni.filters.housing'),
      render: (u) =>
        u.hasCampusHousing ? (
          <span className="inline-flex items-center gap-1 text-brand-700"><IconCheck size={16} /> {t('common.yes')}</span>
        ) : (
          <span className="text-ink-400">{t('common.no')}</span>
        ),
    },
    {
      label: t('uni.filters.field'),
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {[...new Set((u.programs || []).map((p) => p.field))].map((f) => (
            <span key={f} className="badge-muted">{f}</span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={t('compare.title')} subtitle={t('compare.subtitle')}>
        {ids.length > 0 && (
          <button type="button" onClick={clear} className="btn-secondary">
            {t('compare.clear')}
          </button>
        )}
      </PageHeader>

      <div className="container-page py-10">
        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            title={t('compare.empty')}
            action={<Link to="/universites" className="btn-primary mt-4">{t('home.cta.explore')}</Link>}
          />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="w-44 p-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {t('compare.criteria')}
                  </th>
                  {rows.map((u) => (
                    <th key={u.id} className="p-4 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/universites/${u.slug}`} className="font-display text-base font-bold text-ink-900 hover:text-brand-700">
                          {u.acronym || u.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle(u.id)}
                          className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-800"
                          aria-label={t('common.close')}
                        >
                          <IconX size={16} />
                        </button>
                      </div>
                      <p className="mt-1 text-xs font-normal text-ink-400">{u.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {criteria.map((c) => (
                  <tr key={c.label}>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-ink-400">{c.label}</th>
                    {rows.map((u) => (
                      <td key={u.id} className="p-4 align-top text-ink-800">{c.render(u)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th className="p-4" />
                  {rows.map((u) => (
                    <td key={u.id} className="p-4">
                      <Link to={`/universites/${u.slug}`} className="btn-primary">{t('common.seeMore')}</Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
