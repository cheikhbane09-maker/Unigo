/* ===================================================================
 * COMPTES UTILISATEURS — branché sur l'API
 * -------------------------------------------------------------------
 * Un « contexte » React sert à partager une information dans TOUT le
 * site sans avoir à la passer de composant en composant.
 * Ici on partage : qui est connecté, et les fonctions de connexion.
 *
 * Dans n'importe quelle page :
 *   const { utilisateur, connecter, deconnecter } = useAuth();
 *
 * Comment ça marche :
 *   - à la connexion, le serveur renvoie un « jeton » (JWT)
 *   - on range ce jeton dans le navigateur
 *   - api.js le rajoute automatiquement à chaque appel suivant
 *   - le serveur vérifie ce jeton avant de répondre
 *
 * Le mot de passe, lui, ne quitte jamais le formulaire : il part une
 * seule fois vers le serveur, qui le hache avec bcrypt et l'oublie.
 * =================================================================== */

import { createContext, useContext, useEffect, useState } from 'react';
import { get, post, lireJeton, rangerJeton } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  /* Au premier chargement du site : si un jeton est déjà rangé dans le
     navigateur, on demande au serveur à qui il appartient. C'est ce qui
     permet de rester connecté après avoir fermé l'onglet. */
  useEffect(() => {
    async function restaurerLaSession() {
      if (!lireJeton()) {
        setChargement(false);
        return;
      }
      try {
        const reponse = await get('/auth/moi');
        setUtilisateur(reponse.utilisateur);
      } catch {
        rangerJeton(null); // jeton expiré, invalide, ou serveur éteint
      } finally {
        setChargement(false);
      }
    }
    restaurerLaSession();
  }, []);

  /* ----------------------- Les actions ---------------------------- */

  /** Connecte quelqu'un. Lève une exception si ça échoue. */
  async function connecter(email, motDePasse) {
    const reponse = await post('/auth/connexion', { email, motDePasse });
    rangerJeton(reponse.jeton);
    setUtilisateur(reponse.utilisateur);
    return reponse.utilisateur;
  }

  /** Crée un compte. La personne est connectée dans la foulée. */
  async function inscrire(donnees) {
    const reponse = await post('/auth/inscription', donnees);
    rangerJeton(reponse.jeton);
    setUtilisateur(reponse.utilisateur);
    return reponse.utilisateur;
  }

  function deconnecter() {
    rangerJeton(null);
    setUtilisateur(null);
  }

  /** Change le mot de passe d'un compte. */
  async function changerMotDePasse(email, motDePasse) {
    return post('/auth/nouveau-mot-de-passe', { email, motDePasse });
  }

  const valeurPartagee = {
    utilisateur,
    chargement,
    estConnecte: utilisateur !== null,
    connecter,
    inscrire,
    deconnecter,
    changerMotDePasse,
  };

  return <AuthContext.Provider value={valeurPartagee}>{children}</AuthContext.Provider>;
}

/** Raccourci utilisé dans les pages : const { utilisateur } = useAuth(); */
export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }
  return contexte;
}
