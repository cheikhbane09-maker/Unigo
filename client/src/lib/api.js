/* ===================================================================
 * APPELS À L'API
 * -------------------------------------------------------------------
 * Toutes les communications entre le site React et le serveur Node
 * passent par ce fichier. Ça évite de répéter partout la même chose.
 *
 * Utilisation dans une page :
 *   import { get, post } from '../lib/api.js';
 *   const reponse = await get('/universities');
 *   const reponse = await post('/reviews', { universityId: 1, rating: 5 });
 * =================================================================== */

const BASE = '/api'; // Vite redirige /api vers http://localhost:4000 (voir vite.config.js)
const CLE_JETON = 'unigo_token'; // le nom sous lequel on range le jeton

/** Lit le jeton rangé dans le navigateur (null si personne n'est connecté). */
export function getToken() {
  try {
    return localStorage.getItem(CLE_JETON);
  } catch {
    return null; // navigation privée : le stockage peut être bloqué
  }
}

/** Range le jeton, ou l'efface si on passe null (déconnexion). */
export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(CLE_JETON, token);
    } else {
      localStorage.removeItem(CLE_JETON);
    }
  } catch {
    // stockage indisponible : on ignore
  }
}

/**
 * Fonction centrale : envoie une requête à l'API et renvoie la réponse.
 * Si le serveur répond une erreur, on lève une exception avec son message,
 * ce qui permet d'écrire try / catch dans les pages.
 */
export async function api(chemin, options = {}) {
  const { method = 'GET', body } = options;
  const token = getToken();

  const entetes = {};
  if (body) entetes['Content-Type'] = 'application/json';
  // Si l'utilisateur est connecté, on joint son jeton à la requête.
  if (token) entetes.Authorization = `Bearer ${token}`;

  const reponse = await fetch(BASE + chemin, {
    method,
    headers: entetes,
    body: body ? JSON.stringify(body) : undefined,
  });

  // On tente de lire le JSON renvoyé (il peut être vide).
  let donnees = null;
  const texte = await reponse.text();
  if (texte) {
    try {
      donnees = JSON.parse(texte);
    } catch {
      donnees = { error: texte };
    }
  }

  // reponse.ok est vrai pour les codes 200-299.
  if (!reponse.ok) {
    const erreur = new Error(donnees?.error || `Erreur ${reponse.status}`);
    erreur.status = reponse.status;
    throw erreur;
  }

  return donnees;
}

/* Quatre raccourcis pour les quatre usages courants. */
export const get = (chemin) => api(chemin);
export const post = (chemin, body) => api(chemin, { method: 'POST', body });
export const patch = (chemin, body) => api(chemin, { method: 'PATCH', body });
export const put = (chemin, body) => api(chemin, { method: 'PUT', body });
export const del = (chemin) => api(chemin, { method: 'DELETE' });

/* ------------------------ Petits utilitaires ------------------------ */

/** Transforme 250000 en « 250 000 FCFA ». */
export function formatFcfa(montant) {
  if (montant === null || montant === undefined) return '—';
  if (montant === 0) return 'Gratuit / non communiqué';
  return `${new Intl.NumberFormat('fr-FR').format(montant)} FCFA`;
}

/** Transforme une date de la base en « 15 octobre 2026 ». */
export function formatDate(date, langue = 'fr-FR') {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(langue, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
