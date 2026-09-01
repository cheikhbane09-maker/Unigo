/* ===================================================================
 * PAGE « NOUVEAU MOT DE PASSE »   adresse : /nouveau-mot-de-passe
 * -------------------------------------------------------------------
 * Étape 2 sur 2. L'utilisateur arrive ici en cliquant sur le lien
 * reçu par e-mail. Ce lien contient une clé secrète :
 *   /nouveau-mot-de-passe?cle=a1b2c3...
 * useSearchParams sert à lire ce qui suit le « ? » dans l'adresse.
 * =================================================================== */

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CadreAuth, { Erreur, Succes } from '../components/CadreAuth.jsx';

export default function NouveauMotDePasse() {
  const [parametres] = useSearchParams();
  const cle = parametres.get('cle'); // null si absente

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  function envoyer(event) {
    event.preventDefault();
    setErreur(null);
    setSucces(null);

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

    // ÉTAPE SUIVANTE : appeler POST /api/auth/reset-password
    // en envoyant { cle, motDePasse }. Le serveur vérifiera que la clé
    // existe, qu'elle n'a pas déjà servi et qu'elle n'est pas expirée.
    setSucces('Mot de passe modifié. Tu peux maintenant te connecter.');
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

        {!cle && (
          <p className="rounded-xl bg-sable-50 p-3 text-xs text-sable-700">
            Aucune clé de réinitialisation dans l'adresse. En vrai, l'utilisateur arrive ici
            depuis le lien reçu par e-mail. Le formulaire reste utilisable pour la démonstration.
          </p>
        )}

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
