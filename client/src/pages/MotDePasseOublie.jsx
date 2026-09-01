/* ===================================================================
 * PAGE « MOT DE PASSE OUBLIÉ »    adresse : /mot-de-passe-oublie
 * -------------------------------------------------------------------
 * Étape 1 sur 2 : l'utilisateur donne son e-mail, le serveur lui
 * enverra un lien. Étape 2 = la page NouveauMotDePasse.jsx.
 * =================================================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import CadreAuth, { Erreur, Succes } from '../components/CadreAuth.jsx';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  function envoyer(event) {
    event.preventDefault();
    setErreur(null);
    setSucces(null);

    if (!email.includes('@')) {
      setErreur("L'adresse e-mail n'est pas valide.");
      return;
    }

    // ÉTAPE SUIVANTE : appeler POST /api/auth/forgot-password
    // Le serveur répond toujours la même chose, que le compte existe ou non :
    // c'est volontaire, pour ne pas révéler qui est inscrit sur le site.
    setSucces(
      "Si un compte est associé à cette adresse, un e-mail de réinitialisation vient d'être envoyé."
    );
  }

  return (
    <CadreAuth
      titre="Mot de passe oublié"
      sousTitre="Saisis ton adresse e-mail : tu recevras un lien valable 30 minutes."
      bas={
        <Link to="/connexion" className="font-semibold text-brand-700 hover:underline">
          ← Retour à la connexion
        </Link>
      }
    >
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <Erreur message={erreur} />
        <Succes message={succes} />

        <div>
          <label className="etiquette" htmlFor="email">Adresse e-mail</label>
          <input
            id="email"
            type="email"
            className="champ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <button type="submit" className="bouton-principal w-full">
          Envoyer le lien
        </button>
      </form>

      <p className="mt-6 rounded-xl bg-ardoise-100 p-3 text-xs text-ardoise-600">
        Pour voir la page suivante sans e-mail, va directement sur{' '}
        <Link to="/nouveau-mot-de-passe" className="font-semibold text-brand-700 hover:underline">
          /nouveau-mot-de-passe
        </Link>.
      </p>
    </CadreAuth>
  );
}
