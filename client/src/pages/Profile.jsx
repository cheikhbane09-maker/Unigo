import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post, del, formatDate } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import { FormError, FormSuccess } from '../components/AuthShell.jsx';
import StarRating from '../components/StarRating.jsx';

export default function Profile() {
  const { t, locale } = useI18n();
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    fullName: user.fullName,
    countryOrigin: user.countryOrigin || '',
    targetCity: user.targetCity || '',
    studyField: user.studyField || '',
    interests: user.interests || '',
  });
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdErr, setPwdErr] = useState(null);

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    get('/reviews/mine').then((r) => setReviews(r.data)).catch(() => setReviews([]));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSaved(null);
    try {
      await updateProfile(form);
      setSaved(t('profile.saved'));
    } catch (err) {
      setError(err.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdErr(null);
    setPwdMsg(null);
    try {
      const res = await post('/auth/change-password', pwd);
      setPwdMsg(res.message);
      setPwd({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwdErr(err.message);
    }
  };

  const removeReview = async (id) => {
    await del(`/reviews/${id}`);
    setReviews((r) => r.filter((x) => x.id !== id));
  };

  return (
    <>
      <PageHeader title={t('profile.title')} subtitle={user.email} />

      <div className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">{t('profile.info')}</h2>
            <FormError message={error} />
            <FormSuccess message={saved} />

            <div>
              <label className="label" htmlFor="fullName">{t('auth.fullName')}</label>
              <input id="fullName" className="input" value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="countryOrigin">{t('auth.country')}</label>
                <input id="countryOrigin" className="input" value={form.countryOrigin} onChange={set('countryOrigin')} />
              </div>
              <div>
                <label className="label" htmlFor="targetCity">{t('auth.targetCity')}</label>
                <input id="targetCity" className="input" value={form.targetCity} onChange={set('targetCity')} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="studyField">{t('auth.studyField')}</label>
              <input id="studyField" className="input" value={form.studyField} onChange={set('studyField')} />
            </div>
            <div>
              <label className="label" htmlFor="interests">{t('profile.interests')}</label>
              <input id="interests" className="input" value={form.interests} onChange={set('interests')} />
              <p className="mt-1 text-xs text-ink-400">{t('profile.interestsHint')}</p>
            </div>

            <button type="submit" className="btn-primary">{t('profile.save')}</button>
          </form>

          <div className="space-y-6">
            <form onSubmit={changePassword} className="card space-y-4 p-6">
              <h2 className="font-display text-lg font-bold text-ink-900">{t('profile.security')}</h2>
              <FormError message={pwdErr} />
              <FormSuccess message={pwdMsg} />

              <div>
                <label className="label" htmlFor="cur">{t('profile.currentPassword')}</label>
                <input
                  id="cur"
                  type="password"
                  className="input"
                  value={pwd.currentPassword}
                  onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="new">{t('profile.newPassword')}</label>
                <input
                  id="new"
                  type="password"
                  className="input"
                  value={pwd.newPassword}
                  onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
                <p className="mt-1 text-xs text-ink-400">{t('auth.passwordHint')}</p>
              </div>

              <button type="submit" className="btn-secondary">{t('profile.changePassword')}</button>
            </form>

            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink-900">{t('profile.myReviews')}</h2>
              {reviews.length === 0 ? (
                <p className="prose-unigo mt-3">{t('uni.detail.noreviews')}</p>
              ) : (
                <ul className="mt-4 divide-y divide-ink-100">
                  {reviews.map((r) => (
                    <li key={r.id} className="py-3 first:pt-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/universites/${r.university.slug}`} className="font-semibold text-ink-800 hover:text-brand-700">
                            {r.university.name}
                          </Link>
                          <div className="mt-1 flex items-center gap-2">
                            <StarRating value={r.rating} size={14} />
                            <span className="text-xs text-ink-400">
                              {formatDate(r.createdAt, locale === 'en' ? 'en-GB' : 'fr-FR')}
                            </span>
                            {!r.isApproved && <span className="badge-sand">en modération</span>}
                          </div>
                          <p className="prose-unigo mt-1 line-clamp-2">{r.comment}</p>
                        </div>
                        <button type="button" onClick={() => removeReview(r.id)} className="btn-ghost shrink-0 !px-2 text-xs">
                          {t('admin.reject')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
