/* ===================================================================
 * AUTHENTIFICATION CÔTÉ NAVIGATEUR
 * -------------------------------------------------------------------
 * Un « contexte » React sert à partager une information dans TOUT le
 * site sans avoir à la passer de composant en composant.
 * Ici on partage : qui est connecté, et les fonctions login / logout.
 *
 * Dans n'importe quelle page, on écrit simplement :
 *   const { user, login, logout } = useAuth();
 *
 * Comment ça marche :
 *   - à la connexion, le serveur renvoie un « jeton » (token)
 *   - on range ce jeton dans le navigateur (localStorage)
 *   - api.js le rajoute automatiquement à chaque appel à l'API
 *   - à la déconnexion, on efface le jeton
 * =================================================================== */

import { createContext, useContext, useEffect, useState } from 'react';
import { get, post, patch, setToken, getToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = personne n'est connecté
  const [loading, setLoading] = useState(true); // true tant qu'on n'a pas vérifié
  const [favoriteIds, setFavoriteIds] = useState([]); // numéros des universités en favori

  // Recharge la liste des favoris depuis l'API.
  async function chargerFavoris() {
    if (!getToken()) {
      setFavoriteIds([]);
      return;
    }
    try {
      const reponse = await get('/favorites/ids');
      setFavoriteIds(reponse.data || []);
    } catch {
      setFavoriteIds([]);
    }
  }

  /* Au premier chargement du site : si un jeton est déjà rangé dans le
     navigateur, on demande au serveur à qui il appartient. Cela permet
     de rester connecté après avoir fermé l'onglet. */
  useEffect(() => {
    async function restaurerLaSession() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const reponse = await get('/auth/me');
        setUser(reponse.user);
        await chargerFavoris();
      } catch {
        setToken(null); // jeton expiré ou invalide : on l'efface
      } finally {
        setLoading(false);
      }
    }
    restaurerLaSession();
  }, []);

  /* ----------------------- Les actions ---------------------------- */

  async function login(email, password) {
    const reponse = await post('/auth/login', { email, password });
    setToken(reponse.token); // on range le jeton
    setUser(reponse.user); // on retient le profil
    await chargerFavoris();
    return reponse.user;
  }

  async function register(donnees) {
    const reponse = await post('/auth/register', donnees);
    setToken(reponse.token);
    setUser(reponse.user);
    return reponse.user;
  }

  function logout() {
    setToken(null); // on efface le jeton
    setUser(null);
    setFavoriteIds([]);
  }

  async function updateProfile(donnees) {
    const reponse = await patch('/auth/me', donnees);
    setUser(reponse.user);
    return reponse.user;
  }

  // Ajoute ou retire une université des favoris (clic sur le cœur).
  async function toggleFavorite(universityId) {
    const reponse = await post('/favorites/toggle', { universityId });

    if (reponse.favorited) {
      setFavoriteIds((ancien) => [...ancien, universityId]);
    } else {
      setFavoriteIds((ancien) => ancien.filter((id) => id !== universityId));
    }
    return reponse.favorited;
  }

  // Tout ce que les autres composants pourront récupérer avec useAuth().
  const valeurPartagee = {
    user,
    loading,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'ADMIN',
    favoriteIds,
    login,
    register,
    logout,
    updateProfile,
    toggleFavorite,
  };

  return <AuthContext.Provider value={valeurPartagee}>{children}</AuthContext.Provider>;
}

/** Raccourci utilisé dans les pages : const { user, login } = useAuth(); */
export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }
  return contexte;
}
