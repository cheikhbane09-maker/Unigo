import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import GlobalSearch from '../components/GlobalSearch.jsx';
import UniversityCard from '../components/UniversityCard.jsx';
import { IconCap, IconBus, IconSparkles, IconArrow, IconCheck } from '../components/Icons.jsx';

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15 backdrop-blur">
      <p className="font-display text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-white/70">{label}</p>
    </div>
  );
}

function ModuleCard({ icon: Icon, title, description, to, tone, cta }) {
  return (
    <Link
      to={to}
      className="card group relative flex flex-col overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-lift"
    >
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}>
        <Icon size={24} />
      </span>
      <h3 className="mt-5 font-display text-lg font-bold text-ink-900">{title}</h3>
      <p className="prose-unigo mt-2 flex-1">{description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
        {cta} <IconArrow size={16} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function Home() {
  const { t } = useI18n();
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ universities: 0, programs: 0, procedures: 0 });
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [uni, proc, test] = await Promise.all([
          get('/universities?limit=6&sort=name'),
          get('/procedures'),
          get('/testimonials'),
        ]);
        setFeatured(uni.data || []);
        setStats({
          universities: uni.pagination?.total || 0,
          programs: (uni.data || []).reduce((n, u) => n + (u.programs?.length || 0), 0),
          procedures: (proc.data || []).length,
        });
        setTestimonials((test.data || []).slice(0, 3));
      } catch {
        /* l'accueil reste affichable même si l'API ne répond pas */
      }
    })();
  }, []);

  const steps = [
    { title: t('home.step1.title'), desc: t('home.step1.desc') },
    { title: t('home.step2.title'), desc: t('home.step2.desc') },
    { title: t('home.step3.title'), desc: t('home.step3.desc') },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_20%,white_1.5px,transparent_1.5px)] [background-size:26px_26px]" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sand-400/25 blur-3xl" />
        <div className="container-page relative py-20 sm:py-28">
          <div className="max-w-3xl animate-fade-up">
            <span className="badge bg-white/15 text-white ring-1 ring-inset ring-white/25">
              {t('home.badge')}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-white sm:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{t('home.subtitle')}</p>

            <div className="mt-8 max-w-xl">
              <GlobalSearch variant="hero" />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/universites" className="btn bg-white text-brand-800 hover:bg-brand-50">
                {t('home.cta.explore')} <IconArrow size={17} />
              </Link>
              <Link to="/demarches" className="btn bg-white/10 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20">
                {t('home.cta.procedures')}
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              <StatCard value={stats.universities} label={t('home.stats.universities')} />
              <StatCard value={`${stats.programs}+`} label={t('home.stats.programs')} />
              <StatCard value={stats.procedures} label={t('home.stats.procedures')} />
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="container-page py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            {t('home.modules.title')}
          </h2>
          <p className="prose-unigo mt-3">{t('home.modules.subtitle')}</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <ModuleCard
            icon={IconCap}
            tone="bg-brand-50 text-brand-700"
            title={t('home.module.university.title')}
            description={t('home.module.university.desc')}
            to="/universites"
            cta={t('home.discover')}
          />
          <ModuleCard
            icon={IconBus}
            tone="bg-sand-50 text-sand-700"
            title={t('home.module.transport.title')}
            description={t('home.module.transport.desc')}
            to="/transport"
            cta={t('home.discover')}
          />
          <ModuleCard
            icon={IconSparkles}
            tone="bg-ink-100 text-ink-800"
            title={t('home.module.activities.title')}
            description={t('home.module.activities.desc')}
            to="/activites"
            cta={t('home.discover')}
          />
        </div>
      </section>

      {/* Étapes */}
      <section className="border-y border-ink-100 bg-white py-16">
        <div className="container-page">
          <h2 className="font-display text-2xl font-extrabold text-ink-900">{t('home.steps.title')}</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="relative pl-14">
                <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-xl bg-brand-700 font-display font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="font-display text-base font-bold text-ink-900">{s.title}</h3>
                <p className="prose-unigo mt-1.5">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Universités mises en avant */}
      {featured.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">{t('uni.title')}</h2>
            <Link to="/universites" className="btn-secondary shrink-0">
              {t('home.cta.explore')}
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((u) => (
              <UniversityCard key={u.id} university={u} />
            ))}
          </div>
        </section>
      )}

      {/* Témoignages */}
      {testimonials.length > 0 && (
        <section className="border-t border-ink-100 bg-white py-16">
          <div className="container-page">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">
              {t('home.testimonials.title')}
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {testimonials.map((tm) => (
                <figure key={tm.id} className="card p-6">
                  <span className="font-display text-3xl leading-none text-brand-200">“</span>
                  <blockquote className="prose-unigo mt-2">{tm.content}</blockquote>
                  <figcaption className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-4 text-sm">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                      {tm.authorName.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <span className="block font-semibold text-ink-800">{tm.authorName}</span>
                      <span className="block text-xs text-ink-400">
                        {tm.country}
                        {tm.university?.name ? ` · ${tm.university.name}` : ''}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/temoignages" className="btn-secondary">
                {t('test.title')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Appel à l'action */}
      <section className="container-page py-16">
        <div className="overflow-hidden rounded-3xl bg-ink-900 px-8 py-12 sm:px-14">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              {t('home.step1.title')}
            </h2>
            <ul className="mt-5 space-y-2 text-sm text-white/75">
              {[t('nav.favorites'), t('nav.compare'), t('uni.detail.writeReview')].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <IconCheck size={16} className="text-brand-300" /> {item}
                </li>
              ))}
            </ul>
            <Link to="/inscription" className="btn mt-7 bg-white text-ink-900 hover:bg-brand-50">
              {t('auth.submit.register')} <IconArrow size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
