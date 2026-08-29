/* ===============================================================
 * MODULE TRANSPORT — responsable : Binta Comé
 * Branche de travail : feature/transport-binta
 *
 * Cette page est un point de départ fonctionnel : elle consomme
 * déjà /api/transport et /api/transport/routes.
 * À faire :
 *  - TODO : filtres par mode de transport et par zone
 *  - TODO : page de détail par moyen de transport
 *  - TODO : carte interactive (le composant <MapView /> est prêt,
 *           il suffit de lui passer des points {lat, lng, title})
 *  - TODO : annuaire des prestataires et liens utiles
 *  - TODO : conseils de sécurité par mode
 * =============================================================== */
import { useEffect, useState } from 'react';
import { get, formatFcfa } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import { IconBus, IconInfo, IconArrow } from '../components/Icons.jsx';

const MODE_LABELS = {
  BUS: 'Bus urbain',
  BRT: 'BRT',
  TER: 'Train (TER)',
  CAR_RAPIDE: 'Car rapide',
  TAXI: 'Taxi',
  VTC: 'VTC',
  INTERURBAIN: 'Interurbain',
};

export default function Transport() {
  const { t } = useI18n();
  const [options, setOptions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([get('/transport'), get('/transport/routes')])
      .then(([o, r]) => {
        setOptions(o.data);
        setRoutes(r.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title={t('home.module.transport.title')} subtitle={t('home.module.transport.desc')} />

      <div className="container-page py-10">
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-sand-200 bg-sand-50 p-5 text-sm text-sand-900">
          <IconInfo size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{t('module.wip.title')}</p>
            <p className="mt-1">{t('module.wip.transport')}</p>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <>
            <section>
              <h2 className="font-display text-xl font-bold text-ink-900">Moyens de transport</h2>
              {options.length === 0 ? (
                <EmptyState title="Aucun moyen de transport enregistré pour le moment." />
              ) : (
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {options.map((o) => (
                    <article key={o.id} className="card flex flex-col p-6">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sand-50 text-sand-700">
                          <IconBus size={22} />
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-ink-900">{o.name}</h3>
                          <span className="badge-muted">{MODE_LABELS[o.mode] || o.mode}</span>
                        </div>
                      </div>
                      <p className="prose-unigo mt-4 flex-1">{o.description}</p>
                      <dl className="mt-4 space-y-1.5 border-t border-ink-100 pt-4 text-sm">
                        {o.coverageArea && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-ink-400">Zone</dt>
                            <dd className="text-right font-medium text-ink-800">{o.coverageArea}</dd>
                          </div>
                        )}
                        {(o.priceMinFcfa || o.priceMaxFcfa) && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-ink-400">Tarif indicatif</dt>
                            <dd className="text-right font-medium text-ink-800">
                              {formatFcfa(o.priceMinFcfa)}
                              {o.priceMaxFcfa ? ` – ${formatFcfa(o.priceMaxFcfa)}` : ''}
                            </dd>
                          </div>
                        )}
                        {o.schedule && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-ink-400">Horaires</dt>
                            <dd className="text-right font-medium text-ink-800">{o.schedule}</dd>
                          </div>
                        )}
                      </dl>
                      {o.safetyTips && (
                        <p className="mt-4 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">⚠ {o.safetyTips}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            {routes.length > 0 && (
              <section className="mt-14">
                <h2 className="font-display text-xl font-bold text-ink-900">Trajets fréquents</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {routes.map((r) => (
                    <article key={r.id} className="card p-5">
                      <p className="flex flex-wrap items-center gap-2 font-display font-bold text-ink-900">
                        {r.fromLabel}
                        <IconArrow size={16} className="text-brand-600" />
                        {r.toLabel}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-600">
                        {r.durationMin && <span>⏱ ~{r.durationMin} min</span>}
                        {r.priceFcfa ? <span>💰 {formatFcfa(r.priceFcfa)}</span> : null}
                        {r.option?.name && <span className="badge-muted">{r.option.name}</span>}
                      </div>
                      {r.advice && <p className="prose-unigo mt-3">{r.advice}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
