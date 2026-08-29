import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../lib/prisma.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.unigo_token) return req.cookies.unigo_token;
  return null;
}

/** Attache req.user si un jeton valide est present, sans bloquer la requete. */
export async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user?.isActive) req.user = user;
  } catch {
    /* jeton invalide : on continue en visiteur */
  }
  next();
}

/** Exige un utilisateur connecte. */
export async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Compte introuvable ou désactivé.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter.' });
  }
}

/** Exige un role precis (ex. requireRole('ADMIN')). */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentification requise.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    next();
  };
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}
