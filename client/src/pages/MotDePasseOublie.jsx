/* ===================================================================
 * PAGE « MOT DE PASSE OUBLIÉ »    adresse : /mot-de-passe-oublie
 * -------------------------------------------------------------------
 * Étape 1 sur 2 : on saisit son adresse e-mail.
 *
 * Sur un vrai site, le serveur enverrait ici un e-mail contenant un
 * lien secret. Tant qu'il n'y a pas de serveur, on passe directement
 * à l'étape 2 en emportant l'adresse dans l'URL.
 * =================================================================== */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CadreAuth, { Erreur } from '../components/CadreAuth.jsx';

export default function MotDePasseOublie() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState(null);

  function envoyer(event) {
    event.preventDefault();
    setErreur(null);

    if (!email.includes('@')) {
      setErreur("L'adresse e-mail n'est pas valide.");
      return;
    }

    // encodeURIComponent protège les caractères spéciaux (@, +, espaces…)
    navigate(`/nouveau-mot-de-passe?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <CadreAuth
      titre="Mot de passe oublié"
      sousTitre="Saisis l'adresse e-mail de ton compte pour choisir un nouveau mot de passe."
      bas={
        <Link to="/connexion" className="font-semibold text-brand-700 hover:underline">
          ← Retour à la connexion
        </Link>
      }
    >
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <Erreur message={erreur} />

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
          Continuer
        </button>
      </form>

      <p className="mt-6 rounded-xl bg-ardoise-100 p-3 text-xs text-ardoise-600">
        Quand le serveur sera branché, cette page enverra un vrai e-mail avec un lien
        valable 30 minutes, au lieu de passer directement à l'étape suivante.
      </p>
    </CadreAuth>
  );
}
