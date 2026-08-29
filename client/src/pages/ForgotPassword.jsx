/* ===================================================================
 * PAGE « MOT DE PASSE OUBLIÉ »    adresse : /mot-de-passe-oublie
 * -------------------------------------------------------------------
 * Étape 1 sur 2 : l'utilisateur donne son e-mail, le serveur lui envoie
 * un lien. Étape 2 = la page ResetPassword.jsx, atteinte via ce lien.
 * =================================================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { post } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import AuthShell, { FormError, FormSuccess } from '../components/AuthShell.jsx';

export default function ForgotPassword() {
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false);

  async function envoyer(event) {
    event.preventDefault();
    setErreur(null);
    setMessage(null);
    setEnCours(true);

    try {
      // post() est notre petit raccourci pour fetch (voir src/lib/api.js)
      const reponse = await post('/auth/forgot-password', { email });

      // Le serveur répond toujours la même chose, que le compte existe ou non :
      // c'est volontaire, pour ne pas révéler qui est inscrit sur le site.
      setMessage(reponse.message);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <AuthShell
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      footer={<Link to="/connexion" className="link font-semibold">← {t('nav.login')}</Link>}
    >
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <FormError message={erreur} />
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

        <button type="submit" className="btn-primary w-full" disabled={enCours}>
          {enCours ? t('common.loading') : t('auth.forgot.submit')}
        </button>
      </form>

      <p className="mt-6 rounded-xl bg-ink-50 p-3 text-xs text-ink-400">
        En développement (MAIL_ENABLED=false dans server/.env), aucun e-mail n'est réellement
        envoyé : le lien de réinitialisation s'affiche dans la console du serveur Node.
        Copiez-le et collez-le dans votre navigateur pour tester.
      </p>
    </AuthShell>
  );
}
