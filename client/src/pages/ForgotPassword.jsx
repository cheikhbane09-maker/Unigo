import { useState } from 'react';
import { Link } from 'react-router-dom';
import { post } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import AuthShell, { FormError, FormSuccess } from '../components/AuthShell.jsx';

export default function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post('/auth/forgot-password', { email });
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      footer={<Link to="/connexion" className="link font-semibold">← {t('nav.login')}</Link>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <FormSuccess message={message} />

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

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? t('common.loading') : t('auth.forgot.submit')}
        </button>
      </form>

      <p className="mt-6 rounded-xl bg-ink-50 p-3 text-xs text-ink-400">
        En développement (MAIL_ENABLED=false), le lien de réinitialisation s'affiche dans la
        console du serveur Node : copiez-le dans votre navigateur.
      </p>
    </AuthShell>
  );
}
