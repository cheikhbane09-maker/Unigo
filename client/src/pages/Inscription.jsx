/* ===================================================================
 * PAGE D'INSCRIPTION      adresse : /inscription
 * -------------------------------------------------------------------
 * Ici il y a plusieurs champs. Au lieu d'un useState par champ, on en
 * utilise UN SEUL qui contient un objet avec tous les champs.
 * =================================================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import CadreAuth, { Erreur, Succes } from '../components/CadreAuth.jsx';

export default function Inscription() {
  const [champs, setChamps] = useState({
    nomComplet: '',
    email: '',
    motDePasse: '',
    confirmation: '',
    pays: '',
    domaine: '',
  });

  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  // Met à jour un seul champ sans effacer les autres.
  // Le « ...ancien » recopie tout l'objet, puis on remplace une seule clé.
  function modifier(nomDuChamp) {
    return (event) => {
      const valeur = event.target.value;
      setChamps((ancien) => ({ ...ancien, [nomDuChamp]: valeur }));
    };
  }

  function envoyer(event) {
    event.preventDefault();
    setErreur(null);
    setSucces(null);

    if (champs.nomComplet.trim().length < 2) {
      setErreur('Le nom complet est obligatoire.');
      return;
    }
    if (!champs.email.includes('@')) {
      setErreur("L'adresse e-mail n'est pas valide.");
      return;
    }
    if (champs.motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/[0-9]/.test(champs.motDePasse)) {
      setErreur('Le mot de passe doit contenir au moins un chiffre.');
      return;
    }
    if (champs.motDePasse !== champs.confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }

    // ÉTAPE SUIVANTE : appeler POST /api/auth/register avec ces champs.
    setSucces(`Formulaire valide. Bienvenue ${champs.nomComplet} !`);
  }

  return (
    <CadreAuth
      titre="Créer un compte"
      sousTitre="Un seul compte pour les trois modules de la plateforme."
      bas={
        <>
          Tu as déjà un compte ?{' '}
          <Link to="/connexion" className="font-semibold text-brand-700 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <Erreur message={erreur} />
        <Succes message={succes} />

        <div>
          <label className="etiquette" htmlFor="nom">Nom complet</label>
          <input id="nom" className="champ" value={champs.nomComplet} onChange={modifier('nomComplet')} autoComplete="name" />
        </div>

        <div>
          <label className="etiquette" htmlFor="email">Adresse e-mail</label>
          <input id="email" type="email" className="champ" value={champs.email} onChange={modifier('email')} autoComplete="email" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiquette" htmlFor="mdp">Mot de passe</label>
            <input id="mdp" type="password" className="champ" value={champs.motDePasse} onChange={modifier('motDePasse')} autoComplete="new-password" />
          </div>
          <div>
            <label className="etiquette" htmlFor="confirmation">Confirmer</label>
            <input id="confirmation" type="password" className="champ" value={champs.confirmation} onChange={modifier('confirmation')} autoComplete="new-password" />
          </div>
        </div>
        <p className="text-xs text-ardoise-400">
          8 caractères minimum, avec au moins une lettre et un chiffre.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiquette" htmlFor="pays">Pays d'origine</label>
            <input id="pays" className="champ" value={champs.pays} onChange={modifier('pays')} placeholder="Mali, Cameroun…" />
          </div>
          <div>
            <label className="etiquette" htmlFor="domaine">Domaine d'études</label>
            <input id="domaine" className="champ" value={champs.domaine} onChange={modifier('domaine')} placeholder="Informatique…" />
          </div>
        </div>

        <button type="submit" className="bouton-principal w-full">
          Créer mon compte
        </button>
      </form>
    </CadreAuth>
  );
}
