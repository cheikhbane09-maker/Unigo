/* ===============================================================
 * MODULE ACTIVITÉS & DIVERTISSEMENT — responsable : Maguette Niang
 * Branche de travail : feature/activites-maguette
 *
 * Cette page est un point de départ fonctionnel : elle consomme
 * déjà /api/activities/events, /venues et /communities.
 * À faire :
 *  - TODO : filtres par catégorie, ville et période
 *  - TODO : page de détail d'un événement
 *  - TODO : formulaire de proposition d'événement (POST /api/activities/events)
 *  - TODO : recommandations selon les centres d'intérêt du profil
 *  - TODO : pages communautés avec liens d'adhésion
 * =============================================================== */
import { useEffect, useState } from 'react';
import { get, formatFcfa, formatDate } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import { IconCalendar, IconPin, IconInfo, IconSparkles } from '../components/Icons.jsx';

export default function Activities() {
  const { t, locale } = useI18n();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([get('/activities/events'), get('/activities/venues'), get('/activities/communities')])
      .then(([e, v, c]) => {
        setEvents(e.data);
        setVenues(v.data);
        setCommunities(c.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR';

  return (
    <>
      <PageHeader title={t('home.module.activities.title')} subtitle={t('home.module.activities.desc')} />

      <div className="container-page py-10">
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-sand-200 bg-sand-50 p-5 text-sm text-sand-900">
          <IconInfo size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{t('module.wip.title')}</p>
            <p className="mt-1">{t('module.wip.activities')}</p>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="space-y-14">
            <section>
              <h2 className="font-display text-xl font-bold text-ink-900">Agenda des événements</h2>
              {events.length === 0 ? (
                <EmptyState title="Aucun événement publié pour le moment." />
              ) : (
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((e) => (
                    <article key={e.id} className="card flex flex-col overflow-hidden">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-brand-700 to-brand-500 p-5 text-white">
                        <IconCalendar size={22} />
                        <div>
                          <p className="text-sm font-semibold">{formatDate(e.startsAt, dateLocale)}</p>
                          <p className="text-xs text-white/75">{e.category}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display font-bold text-ink-900">{e.title}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
                          <IconPin size={14} /> {e.venue ? `${e.venue}, ` : ''}{e.city}
                        </p>
                        <p className="prose-unigo mt-3 flex-1">{e.description}</p>
                        <p className="mt-4 border-t border-ink-100 pt-3 text-sm font-semibold text-ink-800">
                          {e.priceFcfa ? formatFcfa(e.priceFcfa) : 'Entrée libre'}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {venues.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-ink-900">Lieux de loisirs</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {venues.map((v) => (
                    <article key={v.id} className="card p-6">
                      <span className="badge-sand">{v.category}</span>
                      <h3 className="mt-2 font-display font-bold text-ink-900">{v.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
                        <IconPin size={14} /> {v.city}
                      </p>
                      <p className="prose-unigo mt-3">{v.description}</p>
                      {v.priceRange && <p className="mt-3 text-sm font-medium text-ink-800">{v.priceRange}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {communities.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-ink-900">Communautés étudiantes</h2>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {communities.map((c) => (
                    <article key={c.id} className="card flex items-start gap-4 p-6">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                        <IconSparkles size={22} />
                      </span>
                      <div>
                        <h3 className="font-display font-bold text-ink-900">{c.name}</h3>
                        <span className="badge-muted mt-1">{c.kind}</span>
                        <p className="prose-unigo mt-2">{c.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
