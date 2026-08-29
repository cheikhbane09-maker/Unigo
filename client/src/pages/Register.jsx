/* ===================================================================
 * PAGE D'INSCRIPTION      adresse : /inscription
 * -------------------------------------------------------------------
 * Ici il y a plusieurs champs. Plutôt qu'un useState par champ, on
 * en utilise UN SEUL qui contient un objet avec tous les champs.
 * La fonction modifier('email') fabrique le gestionnaire du champ email.
 * =================================================================== */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import AuthShell, { FormError } from '../components/AuthShell.jsx';

export default function Register() {
  const { t } = useI18n();
  const { register } = useAuth();
  const navigate = useNavigate();

  // Tous les champs du formulaire dans un seul objet.
  const [champs, setChamps] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmation: '',
    countryOrigin: '',
    targetCity: '',
    studyField: '',
  });

  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false);

  // Met à jour un seul champ sans effacer les autres (grâce à « ...ancien »).
  function modifier(nomDuChamp) {
    return (event) => {
      const valeur = event.target.value;
      setChamps((ancien) => ({ ...ancien, [nomDuChamp]: valeur }));
    };
  }

  async function envoyer(event) {
    event.preventDefault();
    setErreur(null);

    // Vérification faite côté navigateur, pour un message immédiat.
    // ATTENTION : le serveur revérifie tout de son côté — on ne fait jamais
    // confiance à ce qui vient du navigateur (voir server/src/routes/auth.routes.js).
    if (champs.password !== champs.confirmation) {
      setErreur(t('auth.passwordMismatch'));
      return;
    }

    setEnCours(true);
    try {
      // On n'envoie pas le champ « confirmation » au serveur, il ne sert qu'ici.
      await register({
        fullName: champs.fullName,
        email: champs.email,
        password: champs.password,
        countryOrigin: champs.countryOrigin,
        targetCity: champs.targetCity,
        studyField: champs.studyField,
      });

      navigate('/', { replace: true }); // inscription réussie : on va sur l'accueil
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(false);
    }
  }

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
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <FormError message={erreur} />

        <div>
          <label className="label" htmlFor="fullName">{t('auth.fullName')}</label>
          <input id="fullName" className="input" value={champs.fullName} onChange={modifier('fullName')} autoComplete="name" required />
        </div>

        <div>
          <label className="label" htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" className="input" value={champs.email} onChange={modifier('email')} autoComplete="email" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" className="input" value={champs.password} onChange={modifier('password')} autoComplete="new-password" required />
          </div>
          <div>
            <label className="label" htmlFor="confirmation">{t('auth.confirmPassword')}</label>
            <input id="confirmation" type="password" className="input" value={champs.confirmation} onChange={modifier('confirmation')} autoComplete="new-password" required />
          </div>
        </div>
        <p className="text-xs text-ink-400">{t('auth.passwordHint')}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="countryOrigin">{t('auth.country')}</label>
            <input id="countryOrigin" className="input" value={champs.countryOrigin} onChange={modifier('countryOrigin')} placeholder="Mali, Cameroun…" />
          </div>
          <div>
            <label className="label" htmlFor="targetCity">{t('auth.targetCity')}</label>
            <input id="targetCity" className="input" value={champs.targetCity} onChange={modifier('targetCity')} placeholder="Dakar…" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="studyField">{t('auth.studyField')}</label>
          <input id="studyField" className="input" value={champs.studyField} onChange={modifier('studyField')} placeholder="Informatique, Droit…" />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={enCours}>
          {enCours ? t('common.loading') : t('auth.submit.register')}
        </button>
      </form>
    </AuthShell>
  );
}
