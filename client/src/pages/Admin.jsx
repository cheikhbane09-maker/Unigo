import { useEffect, useState } from 'react';
import { get, post, del, patch } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import StarRating from '../components/StarRating.jsx';
import { FormError, FormSuccess } from '../components/AuthShell.jsx';
import { IconCheck, IconX } from '../components/Icons.jsx';

/* ------------------------------ Tableau de bord ------------------------------ */
function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    get('/admin/stats').then(setStats).catch(() => setStats(null));
  }, []);

  if (!stats) return <Spinner />;

  const tiles = [
    { label: 'Utilisateurs', value: stats.totals.users },
    { label: 'Universités', value: stats.totals.universities },
    { label: 'Filières', value: stats.totals.programs },
    { label: 'Avis', value: stats.totals.reviews },
    { label: 'Avis en attente', value: stats.totals.pendingReviews, warn: true },
    { label: 'Témoignages en attente', value: stats.totals.pendingTestimonials, warn: true },
  ];

  const Bars = ({ title, rows }) => {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return (
      <div className="card p-6">
        <h3 className="font-display font-bold text-ink-900">{title}</h3>
        {rows.length === 0 ? (
          <p className="prose-unigo mt-3">—</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((r) => (
              <li key={r.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-600">{r.label}</span>
                  <span className="font-semibold text-ink-800">{r.value}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${(r.value / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tl) => (
          <div key={tl.label} className={`card p-5 ${tl.warn && tl.value > 0 ? 'ring-2 ring-sand-300' : ''}`}>
            <p className="font-display text-2xl font-extrabold text-ink-900">{tl.value}</p>
            <p className="mt-1 text-xs text-ink-400">{tl.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Bars title="Universités par ville" rows={stats.byCity} />
        <Bars title="Utilisateurs par pays d'origine" rows={stats.byCountry} />
      </div>
    </div>
  );
}

/* ------------------------------- Universités -------------------------------- */
function UniversitiesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    slug: '', name: '', acronym: '', type: 'PUBLIQUE', city: '', description: '',
    website: '', languages: 'Francais', hasCampusHousing: false,
  });

  const load = () => {
    setLoading(true);
    get('/universities?limit=50')
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    try {
      await post('/universities', form);
      setMsg('Établissement créé.');
      setForm({ slug: '', name: '', acronym: '', type: 'PUBLIQUE', city: '', description: '', website: '', languages: 'Francais', hasCampusHousing: false });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    await del(`/universities/${id}`);
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="card overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                <th className="p-4">Nom</th>
                <th className="p-4">Ville</th>
                <th className="p-4">Type</th>
                <th className="p-4">Filières</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="p-4 font-medium text-ink-800">{u.name}</td>
                  <td className="p-4 text-ink-600">{u.city}</td>
                  <td className="p-4"><span className="badge-muted">{u.type}</span></td>
                  <td className="p-4 text-ink-600">{u.programs?.length ?? 0}</td>
                  <td className="p-4 text-right">
                    <button type="button" onClick={() => remove(u.id)} className="btn-ghost !px-2 text-xs text-red-600">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form onSubmit={create} className="card space-y-3 p-6">
        <h3 className="font-display font-bold text-ink-900">Ajouter un établissement</h3>
        <FormError message={error} />
        <FormSuccess message={msg} />

        <input className="input" placeholder="Nom complet" value={form.name} onChange={set('name')} required />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Sigle (UCAD)" value={form.acronym} onChange={set('acronym')} />
          <input className="input" placeholder="slug-url" value={form.slug} onChange={set('slug')} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Ville" value={form.city} onChange={set('city')} required />
          <select className="input" value={form.type} onChange={set('type')}>
            <option value="PUBLIQUE">Publique</option>
            <option value="PRIVEE">Privée</option>
          </select>
        </div>
        <textarea className="input min-h-[100px]" placeholder="Description (10 caractères minimum)" value={form.description} onChange={set('description')} required />
        <input className="input" placeholder="Site web" value={form.website} onChange={set('website')} />
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={form.hasCampusHousing} onChange={set('hasCampusHousing')} className="h-4 w-4 rounded text-brand-600" />
          Logement sur le campus
        </label>
        <button type="submit" className="btn-primary w-full">Créer</button>
      </form>
    </div>
  );
}

/* -------------------------------- Modération -------------------------------- */
function Moderation() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([get('/reviews/pending'), get('/testimonials/pending')])
      .then(([r, tm]) => {
        setReviews(r.data);
        setTestimonials(tm.data);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <Spinner />;

  const nothing = reviews.length === 0 && testimonials.length === 0;

  return (
    <div className="space-y-8">
      {nothing && <p className="card p-8 text-center text-sm text-ink-400">{t('admin.noPending')}</p>}

      {reviews.length > 0 && (
        <section>
          <h3 className="font-display font-bold text-ink-900">{t('admin.pendingReviews')} ({reviews.length})</h3>
          <ul className="mt-4 space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-start gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-800">
                    {r.university.name} — {r.user.fullName}
                  </p>
                  <StarRating value={r.rating} size={14} />
                  {r.title && <p className="mt-2 font-medium text-ink-800">{r.title}</p>}
                  <p className="prose-unigo mt-1">{r.comment}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => { await patch(`/reviews/${r.id}/approve`); load(); }}
                    className="btn-primary !px-3"
                  >
                    <IconCheck size={16} /> {t('admin.approve')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => { await del(`/reviews/${r.id}`); load(); }}
                    className="btn-secondary !px-3 text-red-600"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {testimonials.length > 0 && (
        <section>
          <h3 className="font-display font-bold text-ink-900">
            {t('admin.pendingTestimonials')} ({testimonials.length})
          </h3>
          <ul className="mt-4 space-y-3">
            {testimonials.map((tm) => (
              <li key={tm.id} className="card flex flex-wrap items-start gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-800">{tm.authorName} — {tm.country}</p>
                  <p className="prose-unigo mt-1">{tm.content}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => { await patch(`/testimonials/${tm.id}/approve`); load(); }}
                    className="btn-primary !px-3"
                  >
                    <IconCheck size={16} /> {t('admin.approve')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => { await del(`/testimonials/${tm.id}`); load(); }}
                    className="btn-secondary !px-3 text-red-600"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* -------------------------------- Utilisateurs ------------------------------- */
function Users() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (search = '') => {
    setLoading(true);
    get(`/admin/users${search ? `?q=${encodeURIComponent(search)}` : ''}`)
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const changeRole = async (id, role) => {
    await patch(`/admin/users/${id}`, { role });
    load(q);
  };

  const toggleActive = async (u) => {
    await patch(`/admin/users/${u.id}`, { isActive: !u.isActive });
    load(q);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => { e.preventDefault(); load(q); }}
        className="flex gap-2"
      >
        <input className="input max-w-sm" placeholder="Rechercher un nom ou un e-mail" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn-secondary">Rechercher</button>
      </form>

      <div className="card overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                <th className="p-4">Nom</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Pays</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Actif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="p-4 font-medium text-ink-800">{u.fullName}</td>
                  <td className="p-4 text-ink-600">{u.email}</td>
                  <td className="p-4 text-ink-600">{u.countryOrigin || '—'}</td>
                  <td className="p-4">
                    <select
                      className="input !py-1.5 !text-xs"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      {['STUDENT', 'PARTNER', 'ADMIN', 'VISITOR'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(u)}
                      className={u.isActive ? 'badge-brand' : 'badge-muted'}
                    >
                      {u.isActive ? 'Actif' : 'Désactivé'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Page ------------------------------------ */
export default function Admin() {
  const { t } = useI18n();
  const [tab, setTab] = useState('dashboard');

  const tabs = [
    { key: 'dashboard', label: t('admin.tab.dashboard'), render: <Dashboard /> },
    { key: 'universities', label: t('admin.tab.universities'), render: <UniversitiesAdmin /> },
    { key: 'moderation', label: t('admin.tab.moderation'), render: <Moderation /> },
    { key: 'users', label: t('admin.tab.users'), render: <Users /> },
  ];

  return (
    <>
      <PageHeader title={t('admin.title')} subtitle={t('admin.subtitle')}>
        <div className="flex flex-wrap gap-2" role="tablist">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              role="tab"
              aria-selected={tab === tb.key}
              onClick={() => setTab(tb.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === tb.key ? 'bg-brand-700 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-100 hover:bg-ink-50'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="container-page py-10">{tabs.find((tb) => tb.key === tab)?.render}</div>
    </>
  );
}
