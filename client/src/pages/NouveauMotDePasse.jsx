/* ===================================================================
 * PAGE « NOUVEAU MOT DE PASSE »   adresse : /nouveau-mot-de-passe
 * -------------------------------------------------------------------
 * Étape 2 sur 2. Sur un vrai site, on arrive ici en cliquant sur le
 * lien reçu par e-mail, qui contient une clé secrète :
 *   /nouveau-mot-de-passe?cle=a1b2c3...
 *
 * Tant qu'il n'y a pas de serveur d'e-mails, on passe simplement
 * l'adresse dans l'adresse de la page. useSearchParams sert à lire
 * ce qui suit le « ? ».
 * =================================================================== */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CadreAuth, { Erreur, Succes } from '../components/CadreAuth.jsx';

export default function NouveauMotDePasse() {
  const { changerMotDePasse } = useAuth();
  const navigate = useNavigate();
  const [parametres] = useSearchParams();

  // L'adresse arrive depuis la page précédente ; sinon on la demande.
  const [email, setEmail] = useState(parametres.get('email') || '');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  async function envoyer(event) {
    event.preventDefault();
    setErreur(null);

    if (!email.includes('@')) {
      setErreur("L'adresse e-mail n'est pas valide.");
      return;
    }
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/[0-9]/.test(motDePasse)) {
      setErreur('Le mot de passe doit contenir au moins un chiffre.');
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }

    try {
      const reponse = await changerMotDePasse(email, motDePasse);
      setSucces(reponse.message);
      setTimeout(() => navigate('/connexion'), 1800);
    } catch (e) {
      setErreur(e.message); // message renvoyé par l'API
    }
  }

  return (
    <CadreAuth
      titre="Nouveau mot de passe"
      sousTitre="Choisis un mot de passe d'au moins 8 caractères, avec une lettre et un chiffre."
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
          <label className="etiquette" htmlFor="email">Adresse e-mail du compte</label>
          <input
            id="email"
            type="email"
            className="champ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="etiquette" htmlFor="mdp">Nouveau mot de passe</label>
          <input
            id="mdp"
            type="password"
            className="champ"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="etiquette" htmlFor="confirmation">Confirmer le mot de passe</label>
          <input
            id="confirmation"
            type="password"
            className="champ"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="bouton-principal w-full">
          Enregistrer le nouveau mot de passe
        </button>
      </form>
    </CadreAuth>
  );
}
