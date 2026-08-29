import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';
import { sendMail, resetPasswordEmail } from '../lib/mailer.js';
import { signToken, requireAuth, publicUser } from '../middleware/auth.js';
import { ah } from '../middleware/error.js';

const router = Router();

/* ---------------------------------------------------------------
 * Limitation des tentatives abusives (exigence securite du cahier
 * des charges : protection contre le bruteforce sur /login).
 * ------------------------------------------------------------- */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de demandes de réinitialisation. Réessayez plus tard.' },
});

/* ------------------------------- Schemas ------------------------------- */

const passwordRule = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
  .regex(/[A-Za-z]/, 'Le mot de passe doit contenir au moins une lettre.')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.');

const registerSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis.'),
  email: z.string().email('Adresse e-mail invalide.'),
  password: passwordRule,
  countryOrigin: z.string().optional(),
  targetCity: z.string().optional(),
  studyField: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

/* ------------------------------- Routes -------------------------------- */

// POST /api/auth/register — inscription
router.post(
  '/register',
  ah(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Cette adresse e-mail est déjà utilisée.' });
    }

    // Hachage bcrypt : le mot de passe n'est jamais stocke en clair.
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName.trim(),
        email,
        passwordHash,
        countryOrigin: data.countryOrigin || null,
        targetCity: data.targetCity || null,
        studyField: data.studyField || null,
      },
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  })
);

// POST /api/auth/login — connexion
router.post(
  '/login',
  loginLimiter,
  ah(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const normalized = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;

    await prisma.loginAttempt.create({
      data: { email: normalized, ip: req.ip, success: ok },
    });

    // Message volontairement generique : on n'indique pas si l'e-mail existe.
    if (!ok) {
      return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Ce compte a été désactivé.' });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  })
);

// GET /api/auth/me — profil de l'utilisateur connecte
router.get(
  '/me',
  requireAuth,
  ah(async (req, res) => {
    res.json({ user: publicUser(req.user) });
  })
);

// PATCH /api/auth/me — mise a jour du profil
router.patch(
  '/me',
  requireAuth,
  ah(async (req, res) => {
    const schema = z.object({
      fullName: z.string().min(2).optional(),
      countryOrigin: z.string().optional().nullable(),
      targetCity: z.string().optional().nullable(),
      studyField: z.string().optional().nullable(),
      interests: z.string().optional().nullable(),
      locale: z.enum(['fr', 'en']).optional(),
    });
    const data = schema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ user: publicUser(user) });
  })
);

// POST /api/auth/change-password — changement depuis le profil
router.post(
  '/change-password',
  requireAuth,
  ah(async (req, res) => {
    const { currentPassword, newPassword } = z
      .object({ currentPassword: z.string().min(1), newPassword: passwordRule })
      .parse(req.body);

    const ok = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ message: 'Mot de passe mis à jour.' });
  })
);

// POST /api/auth/forgot-password — envoi du lien de reinitialisation
router.post(
  '/forgot-password',
  forgotLimiter,
  ah(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const normalized = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    // Reponse identique que le compte existe ou non (evite l'enumeration d'e-mails).
    const genericResponse = {
      message:
        "Si un compte est associé à cette adresse, un e-mail de réinitialisation vient d'être envoyé.",
    };

    if (!user) return res.json(genericResponse);

    // Jeton a usage unique : seul son hash est stocke en base.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + env.resetTokenTtlMinutes * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt } });

    const link = `${env.clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalized)}`;
    const mail = resetPasswordEmail({
      fullName: user.fullName,
      link,
      ttlMinutes: env.resetTokenTtlMinutes,
    });
    await sendMail({ to: user.email, ...mail });

    res.json(genericResponse);
  })
);

// POST /api/auth/reset-password — definition du nouveau mot de passe
router.post(
  '/reset-password',
  ah(async (req, res) => {
    const { token, password } = z
      .object({ token: z.string().min(10), password: passwordRule })
      .parse(req.body);

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: 'Ce lien de réinitialisation est invalide ou expiré.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    res.json({ message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' });
  })
);

export default router;
