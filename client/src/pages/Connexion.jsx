/* ===================================================================
 * PAGE DE CONNEXION      adresse : /connexion
 * -------------------------------------------------------------------
 * Un formulaire React fonctionne toujours pareil :
 *   1. useState retient ce que l'utilisateur tape
 *   2. chaque <input> affiche cette valeur (value) et la met à jour (onChange)
 *   3. onSubmit récupère le tout au moment de valider
 *
 * La connexion elle-même est gérée par useAuth() (src/context/AuthContext.jsx).
 * =================================================================== */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CadreAuth, { Erreur, Info } from '../components/CadreAuth.jsx';

export default function Connexion() {
  const { connecter } = useAuth();
  const navigate = useNavigate();
  const emplacement = useLocation();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false);

  // async / await : connecter() parle au serveur, ça prend un instant.
  async function envoyer(event) {
    event.preventDefault(); // empêche le rechargement de la page
    setErreur(null);

    if (!email.includes('@')) {
      setErreur("L'adresse e-mail n'est pas valide.");
      return;
    }

    setEnCours(true);
    try {
      await connecter(email, motDePasse);

      // Si la personne voulait aller sur une page protégée, on l'y renvoie.
      // Sinon, direction l'annuaire des universités.
      const destination = emplacement.state?.depuis || '/universites';
      navigate(destination, { replace: true });
    } catch (e) {
      setErreur(e.message); // message renvoyé par l'API
    } finally {
      setEnCours(false);
    }
  }

  return (
    <CadreAuth
      titre="Connexion"
      sousTitre="Connecte-toi pour accéder aux universités, aux transports et aux activités."
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
        {/* Message envoye par RouteProtegee quand on a cliqué sur un onglet
            reserve aux membres : il explique pourquoi on est ici. */}
        <Info message={emplacement.state?.message} />
        <Erreur message={erreur} />

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

        <button type="submit" className="bouton-principal w-full" disabled={enCours}>
          {enCours ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      {/* Bouton pratique pendant le développement : remplit le compte de démo. */}
      <button
        type="button"
        onClick={() => {
          setEmail('etudiant@unigo.sn');
          setMotDePasse('Etudiant1234!');
        }}
        className="mt-6 w-full rounded-xl bg-ardoise-100 p-3 text-xs text-ardoise-600 hover:bg-ardoise-50"
      >
        Compte de démonstration : <strong>etudiant@unigo.sn</strong> / <strong>Etudiant1234!</strong>
        <br />
        <span className="text-brand-700">Cliquer ici pour remplir automatiquement</span>
      </button>
    </CadreAuth>
  );
}
