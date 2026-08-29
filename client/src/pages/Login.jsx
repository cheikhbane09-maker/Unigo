import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import AuthShell, { FormError } from '../components/AuthShell.jsx';

export default function Login() {
  const { t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to="/inscription" className="link font-semibold">{t('nav.register')}</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />

        <div>
          <label className="label" htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">{t('auth.password')}</label>
            <Link to="/mot-de-passe-oublie" className="mb-1.5 text-xs font-medium text-brand-700 hover:underline">
              {t('auth.forgot')}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? t('common.loading') : t('auth.submit.login')}
        </button>
      </form>

      <p className="mt-6 rounded-xl bg-ink-50 p-3 text-xs text-ink-400">
        Comptes de démonstration créés par le seed :<br />
        <span className="font-mono">admin@unigo.sn / Admin1234!</span> ·{' '}
        <span className="font-mono">etudiant@unigo.sn / Etudiant1234!</span>
      </p>
    </AuthShell>
  );
}
