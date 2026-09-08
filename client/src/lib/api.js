/* ===================================================================
 * APPELS À L'API
 * -------------------------------------------------------------------
 * Toutes les communications entre le site React et le serveur passent
 * par ce fichier. Ça évite de répéter partout la même chose.
 *
 * Utilisation dans une page :
 *   import { get, post } from '../lib/api.js';
 *   const reponse = await get('/universites');
 *   const reponse = await post('/auth/connexion', { email, motDePasse });
 * =================================================================== */

const BASE = '/api'; // Vite redirige /api vers http://localhost:4000
const CLE_JETON = 'unigo_jeton';

/** Lit le jeton rangé dans le navigateur (null si personne n'est connecté). */
export function lireJeton() {
  try {
    return localStorage.getItem(CLE_JETON);
  } catch {
    return null; // navigation privée : le stockage peut être bloqué
  }
}

/** Range le jeton, ou l'efface si on passe null (déconnexion). */
export function rangerJeton(jeton) {
  try {
    if (jeton) localStorage.setItem(CLE_JETON, jeton);
    else localStorage.removeItem(CLE_JETON);
  } catch {
    /* stockage indisponible : on ignore */
  }
}

/**
 * Fonction centrale : envoie une requête et renvoie la réponse.
 * Si le serveur répond une erreur, on lève une exception avec son
 * message — ce qui permet d'écrire try / catch dans les pages.
 */
export async function api(chemin, options = {}) {
  const { method = 'GET', body } = options;
  const jeton = lireJeton();

  const entetes = {};
  if (body) entetes['Content-Type'] = 'application/json';
  // Si on est connecté, on joint le jeton : c'est lui qui prouve qui on est.
  if (jeton) entetes.Authorization = `Bearer ${jeton}`;

  let reponse;
  try {
    reponse = await fetch(BASE + chemin, {
      method,
      headers: entetes,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch échoue quand le serveur ne répond pas du tout.
    throw new Error(
      "Le serveur ne répond pas. Vérifie qu'il est bien lancé (npm run dev:server)."
    );
  }

  const texte = await reponse.text();
  let donnees = null;
  if (texte) {
    try {
      donnees = JSON.parse(texte);
    } catch {
      donnees = { error: texte };
    }
  }

  // reponse.ok est vrai pour les codes 200 à 299.
  if (!reponse.ok) {
    const erreur = new Error(donnees?.error || `Erreur ${reponse.status}`);
    erreur.status = reponse.status;
    throw erreur;
  }

  return donnees;
}

/* Raccourcis pour les usages courants. */
export const get = (chemin) => api(chemin);
export const post = (chemin, body) => api(chemin, { method: 'POST', body });

/** Transforme 250000 en « 250 000 FCFA ». */
export function formaterFcfa(montant) {
  if (montant === null || montant === undefined) return '—';
  return `${new Intl.NumberFormat('fr-FR').format(montant)} FCFA`;
}
