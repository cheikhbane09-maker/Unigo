import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import AuthShell, { FormError, FormSuccess } from '../components/AuthShell.jsx';

export default function ResetPassword() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setDetails(null);
    if (password !== confirm) return setError(t('auth.passwordMismatch'));

    setBusy(true);
    try {
      const res = await post('/auth/reset-password', { token, password });
      setMessage(res.message);
      setTimeout(() => navigate('/connexion'), 1800);
    } catch (err) {
      setError(err.message);
      setDetails(err.details);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.reset.title')}
      subtitle={t('auth.reset.subtitle')}
      footer={<Link to="/connexion" className="link font-semibold">← {t('nav.login')}</Link>}
    >
      {!token ? (
        <FormError message="Lien invalide : le jeton de réinitialisation est absent de l'adresse." />
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <FormError message={error} details={details} />
          <FormSuccess message={message} />

          <div>
            <label className="label" htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="confirm">{t('auth.confirmPassword')}</label>
            <input
              id="confirm"
              type="password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <p className="text-xs text-ink-400">{t('auth.passwordHint')}</p>

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? t('common.loading') : t('auth.reset.submit')}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
