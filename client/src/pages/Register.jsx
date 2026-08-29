import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import AuthShell, { FormError } from '../components/AuthShell.jsx';

export default function Register() {
  const { t } = useI18n();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirm: '',
    countryOrigin: '',
    targetCity: '',
    studyField: '',
  });
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setDetails(null);

    if (form.password !== form.confirm) return setError(t('auth.passwordMismatch'));

    setBusy(true);
    try {
      const { confirm, ...payload } = form;
      await register(payload);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setDetails(err.details);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footer={
        <>
          {t('auth.hasAccount')}{' '}
          <Link to="/connexion" className="link font-semibold">{t('nav.login')}</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} details={details} />

        <div>
          <label className="label" htmlFor="fullName">{t('auth.fullName')}</label>
          <input id="fullName" className="input" value={form.fullName} onChange={set('fullName')} autoComplete="name" required />
        </div>

        <div>
          <label className="label" htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" className="input" value={form.password} onChange={set('password')} autoComplete="new-password" required />
          </div>
          <div>
            <label className="label" htmlFor="confirm">{t('auth.confirmPassword')}</label>
            <input id="confirm" type="password" className="input" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required />
          </div>
        </div>
        <p className="text-xs text-ink-400">{t('auth.passwordHint')}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="countryOrigin">{t('auth.country')}</label>
            <input id="countryOrigin" className="input" value={form.countryOrigin} onChange={set('countryOrigin')} placeholder="Mali, Cameroun…" />
          </div>
          <div>
            <label className="label" htmlFor="targetCity">{t('auth.targetCity')}</label>
            <input id="targetCity" className="input" value={form.targetCity} onChange={set('targetCity')} placeholder="Dakar…" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="studyField">{t('auth.studyField')}</label>
          <input id="studyField" className="input" value={form.studyField} onChange={set('studyField')} placeholder="Informatique, Droit…" />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? t('common.loading') : t('auth.submit.register')}
        </button>
      </form>
    </AuthShell>
  );
}
