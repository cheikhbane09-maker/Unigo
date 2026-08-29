/* ===================================================================
 * PAGE « NOUVEAU MOT DE PASSE »    adresse : /reset-password?token=...
 * -------------------------------------------------------------------
 * Étape 2 sur 2. La clé secrète se trouve dans l'adresse de la page :
 *   http://localhost:5173/reset-password?token=a1b2c3...
 * useSearchParams sert justement à lire ce qui suit le « ? ».
 * =================================================================== */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import AuthShell, { FormError, FormSuccess } from '../components/AuthShell.jsx';

export default function ResetPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();

  // On récupère la clé secrète présente dans l'adresse.
  const [parametres] = useSearchParams();
  const token = parametres.get('token') || '';

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false);

  async function envoyer(event) {
    event.preventDefault();
    setErreur(null);

    if (motDePasse !== confirmation) {
      setErreur(t('auth.passwordMismatch'));
      return;
    }

    setEnCours(true);
    try {
      // Le serveur vérifie que la clé existe, qu'elle n'a pas déjà servi
      // et qu'elle n'a pas plus de 30 minutes.
      const reponse = await post('/auth/reset-password', { token, password: motDePasse });
      setMessage(reponse.message);

      // Petite pause pour laisser lire le message, puis retour à la connexion.
      setTimeout(() => navigate('/connexion'), 1800);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <AuthShell
      title={t('auth.reset.title')}
      subtitle={t('auth.reset.subtitle')}
      footer={<Link to="/connexion" className="link font-semibold">← {t('nav.login')}</Link>}
    >
      {!token ? (
        // Cas où l'on arrive sur la page sans clé dans l'adresse.
        <FormError message="Lien invalide : la clé de réinitialisation est absente de l'adresse." />
      ) : (
        <form onSubmit={envoyer} className="space-y-4" noValidate>
          <FormError message={erreur} />
          <FormSuccess message={message} />

          <div>
            <label className="label" htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              className="input"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="confirmation">{t('auth.confirmPassword')}</label>
            <input
              id="confirmation"
              type="password"
              className="input"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <p className="text-xs text-ink-400">{t('auth.passwordHint')}</p>

          <button type="submit" className="btn-primary w-full" disabled={enCours}>
            {enCours ? t('common.loading') : t('auth.reset.submit')}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
