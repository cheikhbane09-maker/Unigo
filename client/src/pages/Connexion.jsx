/* ===================================================================
 * PAGE DE CONNEXION      adresse : /connexion
 * -------------------------------------------------------------------
 * Un formulaire React fonctionne toujours pareil :
 *   1. useState retient ce que l'utilisateur tape
 *   2. chaque <input> affiche cette valeur (value) et la met à jour (onChange)
 *   3. onSubmit récupère le tout au moment de valider
 * =================================================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import CadreAuth, { Erreur, Succes } from '../components/CadreAuth.jsx';

export default function Connexion() {
  // La mémoire de la page
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  function envoyer(event) {
    event.preventDefault(); // empêche le rechargement de la page
    setErreur(null);
    setSucces(null);

    // Vérifications simples côté navigateur
    if (!email.includes('@')) {
      setErreur("L'adresse e-mail n'est pas valide.");
      return;
    }
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    // ÉTAPE SUIVANTE (quand le backend sera prêt) :
    // remplacer les deux lignes ci-dessous par un appel à l'API :
    //   const reponse = await post('/auth/login', { email, motDePasse });
    setSucces(`Formulaire valide. Connexion de ${email} dès que l'API sera branchée.`);
  }

  return (
    <CadreAuth
      titre="Connexion"
      sousTitre="Accède à ton profil, tes favoris et tes avis."
      bas={
        <>
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-semibold text-brand-700 hover:underline">
            Créer un compte
          </Link>
        </>
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
            placeholder="prenom@exemple.com"
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="etiquette" htmlFor="motdepasse">Mot de passe</label>
            <Link
              to="/mot-de-passe-oublie"
              className="mb-1.5 text-xs font-medium text-brand-700 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            id="motdepasse"
            type="password"
            className="champ"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="bouton-principal w-full">
          Se connecter
        </button>
      </form>
    </CadreAuth>
  );
}
