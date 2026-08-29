/* ===================================================================
 * MIDDLEWARE D'AUTHENTIFICATION
 * -------------------------------------------------------------------
 * Un « middleware » est simplement une fonction qui s'exécute AVANT
 * une route. Elle reçoit (req, res, next) et doit soit répondre
 * (res.status(...).json(...)), soit appeler next() pour laisser
 * la route continuer.
 *
 * Exemple d'utilisation dans un fichier de routes :
 *   router.get('/favoris', requireAuth, (req, res) => { ... })
 *   → requireAuth s'exécute d'abord ; s'il laisse passer,
 *     req.user contient l'utilisateur connecté.
 * =================================================================== */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../lib/prisma.js';

/**
 * Fabrique le jeton (token) envoyé au navigateur après une connexion réussie.
 * Le jeton contient l'identifiant de l'utilisateur et son rôle, le tout
 * signé avec la clé secrète JWT_SECRET : impossible de le modifier sans elle.
 */
export function signToken(utilisateur) {
  return jwt.sign({ sub: utilisateur.id, role: utilisateur.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/** Récupère le jeton envoyé par le navigateur dans l'en-tête « Authorization ». */
function lireToken(req) {
  const entete = req.headers.authorization || '';
  if (entete.startsWith('Bearer ')) {
    return entete.slice(7); // on enlève le mot « Bearer » et l'espace
  }
  return null;
}

/**
 * OBLIGE l'utilisateur à être connecté.
 * Si le jeton est absent ou invalide, on répond 401 et la route n'est pas exécutée.
 */
export async function requireAuth(req, res, next) {
  const token = lireToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Vous devez être connecté.' });
  }

  try {
    // jwt.verify vérifie la signature ET la date d'expiration.
    const contenu = jwt.verify(token, env.jwtSecret);

    // On recharge l'utilisateur depuis la base : son rôle a pu changer entre-temps.
    const utilisateur = await prisma.user.findUnique({ where: { id: contenu.sub } });

    if (!utilisateur || !utilisateur.isActive) {
      return res.status(401).json({ error: 'Compte introuvable ou désactivé.' });
    }

    req.user = utilisateur; // disponible ensuite dans la route
    next();
  } catch {
    return res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter.' });
  }
}

/**
 * Version souple : si un jeton valide est présent, on remplit req.user ;
 * sinon on laisse passer quand même (l'utilisateur est un simple visiteur).
 * Utile pour les pages publiques qui affichent un petit plus aux membres.
 */
export async function optionalAuth(req, _res, next) {
  const token = lireToken(req);
  if (!token) return next();

  try {
    const contenu = jwt.verify(token, env.jwtSecret);
    const utilisateur = await prisma.user.findUnique({ where: { id: contenu.sub } });
    if (utilisateur && utilisateur.isActive) {
      req.user = utilisateur;
    }
  } catch {
    // Jeton invalide : ce n'est pas grave ici, on continue en visiteur.
  }
  next();
}

/**
 * Réserve une route à certains rôles.
 * Exemple : router.delete('/:id', requireAuth, requireRole('ADMIN'), ...)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Vous devez être connecté.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    next();
  };
}

/**
 * Retire le mot de passe haché avant d'envoyer un utilisateur au navigateur.
 * À utiliser SYSTÉMATIQUEMENT : on ne renvoie jamais passwordHash au client.
 */
export function publicUser(utilisateur) {
  if (!utilisateur) return null;
  const { passwordHash, ...reste } = utilisateur;
  return reste;
}
