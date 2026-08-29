import { useEffect, useState } from 'react';
import { get, post } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import { FormError, FormSuccess } from '../components/AuthShell.jsx';

export default function Testimonials() {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({ authorName: '', country: '', year: '', content: '', universityId: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([get('/testimonials'), get('/universities?limit=50')])
      .then(([tRes, uRes]) => {
        setRows(tRes.data);
        setUniversities(uRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : null,
        universityId: form.universityId ? Number(form.universityId) : null,
      };
      const res = await post('/testimonials', payload);
      setMessage(res.message);
      setForm({ authorName: '', country: '', year: '', content: '', universityId: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={t('test.title')} subtitle={t('test.subtitle')}>
        <button type="button" onClick={() => setOpen((v) => !v)} className="btn-primary">
          {open ? t('common.close') : t('test.share')}
        </button>
      </PageHeader>

      <div className="container-page py-10">
        {open && (
          <form onSubmit={submit} className="card mb-10 grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormError message={error} />
              <FormSuccess message={message} />
            </div>
            <div>
              <label className="label" htmlFor="authorName">{t('test.form.name')}</label>
              <input id="authorName" className="input" value={form.authorName} onChange={set('authorName')} required />
            </div>
            <div>
              <label className="label" htmlFor="country">{t('test.form.country')}</label>
              <input id="country" className="input" value={form.country} onChange={set('country')} required />
            </div>
            <div>
              <label className="label" htmlFor="year">{t('test.form.year')}</label>
              <input id="year" type="number" min="2000" max="2100" className="input" value={form.year} onChange={set('year')} />
            </div>
            <div>
              <label className="label" htmlFor="universityId">{t('test.form.university')}</label>
              <select id="universityId" className="input" value={form.universityId} onChange={set('universityId')}>
                <option value="">—</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="content">{t('test.form.content')}</label>
              <textarea id="content" className="input min-h-[130px]" value={form.content} onChange={set('content')} required minLength={30} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? t('common.loading') : t('test.form.submit')}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState title={t('uni.empty')} />
        ) : (
          <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
            {rows.map((tm) => (
              <figure key={tm.id} className="card mb-5 break-inside-avoid p-6">
                <span className="font-display text-3xl leading-none text-brand-200">“</span>
                <blockquote className="prose-unigo mt-2">{tm.content}</blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5 border-t border-ink-100 pt-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                    {tm.authorName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold text-ink-800">{tm.authorName}</span>
                    <span className="block text-xs text-ink-400">
                      {tm.country}
                      {tm.year ? ` · ${tm.year}` : ''}
                      {tm.university?.name ? ` · ${tm.university.name}` : ''}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
