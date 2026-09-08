/* ===================================================================
 * SÉCURITÉ — jetons et vérification des comptes
 * -------------------------------------------------------------------
 * Deux bibliothèques font le travail :
 *
 *   bcryptjs      transforme le mot de passe en une empreinte
 *                 impossible à inverser. On ne stocke JAMAIS le mot
 *                 de passe lui-même en base.
 *
 *   jsonwebtoken  fabrique un « jeton » signé qui prouve l'identité
 *                 de la personne à chaque requête suivante.
 * =================================================================== */

import jwt from 'jsonwebtoken';
import { pool } from './base.js';

// En production, cette clé doit être longue, aléatoire, et rangée
// dans le fichier .env — jamais écrite en dur dans le code.
export const CLE_SECRETE = process.env.JWT_SECRET || 'unigo-cle-de-developpement-a-changer';

/** Fabrique le jeton renvoyé au navigateur après une connexion réussie. */
export function fabriquerJeton(utilisateur) {
  return jwt.sign({ id: utilisateur.id, email: utilisateur.email }, CLE_SECRETE, {
    expiresIn: '7d', // le jeton expire au bout de 7 jours
  });
}

/** Retire le mot de passe haché avant d'envoyer un utilisateur au navigateur. */
export function utilisateurPublic(utilisateur) {
  const { motDePasseHache, ...reste } = utilisateur;
  return reste;
}

/**
 * Middleware : réserve une route aux personnes connectées.
 * Le navigateur envoie son jeton dans l'en-tête « Authorization ».
 *
 * Utilisation :  router.get('/mes-favoris', exigeConnexion, ...)
 */
export async function exigeConnexion(req, res, next) {
  const entete = req.headers.authorization || '';

  if (!entete.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Vous devez être connecté.' });
  }

  const jeton = entete.slice(7); // on enlève le mot « Bearer » et l'espace

  try {
    // jwt.verify vérifie la signature ET la date d'expiration.
    const contenu = jwt.verify(jeton, CLE_SECRETE);

    // On recharge l'utilisateur depuis la base : son compte a pu être
    // supprimé entre-temps.
    const [lignes] = await pool.query('SELECT * FROM utilisateurs WHERE id = ?', [contenu.id]);

    if (lignes.length === 0) {
      return res.status(401).json({ error: 'Compte introuvable.' });
    }

    req.utilisateur = lignes[0]; // disponible ensuite dans la route
    next();
  } catch {
    return res.status(401).json({ error: 'Session expirée, reconnectez-vous.' });
  }
}
