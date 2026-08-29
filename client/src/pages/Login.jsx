/* ===================================================================
 * PAGE DE CONNEXION      adresse : /connexion
 * -------------------------------------------------------------------
 * Comment fonctionne un formulaire en React :
 *   1. useState garde ce que l'utilisateur tape (email, password)
 *   2. chaque <input> affiche cette valeur et la met à jour (onChange)
 *   3. au clic sur le bouton, onSubmit envoie tout à l'API
 * =================================================================== */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import AuthShell, { FormError } from '../components/AuthShell.jsx';

export default function Login() {
  const { t } = useI18n(); // t('cle') = le texte traduit en FR ou EN
  const { login } = useAuth(); // la fonction qui appelle l'API de connexion
  const navigate = useNavigate(); // pour changer de page après la connexion
  const location = useLocation();

  // Les trois informations que la page doit retenir.
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false); // pour désactiver le bouton pendant l'envoi

  // Appelée quand on valide le formulaire.
  async function envoyer(event) {
    event.preventDefault(); // empêche le navigateur de recharger la page
    setErreur(null);
    setEnCours(true);

    try {
      // login() envoie l'e-mail et le mot de passe à POST /api/auth/login
      await login(email, motDePasse);

      // Si l'utilisateur voulait aller sur une page protégée, on l'y renvoie.
      navigate(location.state?.from || '/', { replace: true });
    } catch (e) {
      // L'API a répondu une erreur (mauvais mot de passe, trop d'essais…)
      setErreur(e.message);
    } finally {
      setEnCours(false);
    }
  }

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
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        {/* Affiche le message d'erreur renvoyé par l'API, s'il y en a un */}
        <FormError message={erreur} />

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
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={enCours}>
          {enCours ? t('common.loading') : t('auth.submit.login')}
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
