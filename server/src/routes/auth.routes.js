/* ===================================================================
 * AUTHENTIFICATION — inscription, connexion, mot de passe oublié
 * -------------------------------------------------------------------
 * Ce fichier contient TOUT ce qui concerne les comptes utilisateurs.
 * Chaque route suit toujours le même plan, facile à recopier :
 *
 *   1. on récupère les données envoyées par le formulaire (req.body)
 *   2. on vérifie qu'elles sont correctes  → sinon res.status(400)
 *   3. on parle à la base de données avec Prisma
 *   4. on renvoie une réponse en JSON      → res.json(...)
 *
 * Le tout est entouré d'un try / catch : si quelque chose casse,
 * on affiche l'erreur dans la console et on renvoie une erreur 500.
 * =================================================================== */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';
import { sendMail, resetPasswordEmail } from '../lib/mailer.js';
import { signToken, requireAuth, publicUser } from '../middleware/auth.js';

const router = Router();

/* -------------------------------------------------------------------
 * Deux petites fonctions de vérification, utilisées par les routes.
 * ----------------------------------------------------------------- */

// Vérifie qu'une adresse ressemble bien à un e-mail : quelquechose@domaine.truc
function emailValide(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Le mot de passe doit faire 8 caractères minimum, avec au moins une lettre et un chiffre.
// La fonction renvoie null si tout va bien, sinon le message d'erreur à afficher.
function erreurMotDePasse(motDePasse) {
  if (typeof motDePasse !== 'string' || motDePasse.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }
  if (!/[a-zA-Z]/.test(motDePasse)) {
    return 'Le mot de passe doit contenir au moins une lettre.';
  }
  if (!/[0-9]/.test(motDePasse)) {
    return 'Le mot de passe doit contenir au moins un chiffre.';
  }
  return null;
}

/* -------------------------------------------------------------------
 * SÉCURITÉ : on limite le nombre d'essais pour empêcher quelqu'un
 * de tester des milliers de mots de passe à la suite.
 * ----------------------------------------------------------------- */

const limiteConnexion = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 10, // 10 tentatives maximum pendant cette fenêtre
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

const limiteMotDePasseOublie = rateLimit({
  windowMs: 60 * 60 * 1000, // fenêtre d'une heure
  max: 5,
  message: { error: 'Trop de demandes de réinitialisation. Réessayez plus tard.' },
});

/* ===================================================================
 * 1) INSCRIPTION        POST /api/auth/register
 * =================================================================== */

router.post('/register', async (req, res) => {
  try {
    // 1. On récupère les champs du formulaire d'inscription.
    const { fullName, email, password, countryOrigin, targetCity, studyField } = req.body;

    // 2. On vérifie que tout est correct avant d'aller plus loin.
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Le nom complet est obligatoire.' });
    }
    if (!emailValide(email)) {
      return res.status(400).json({ error: "L'adresse e-mail n'est pas valide." });
    }
    const erreurMdp = erreurMotDePasse(password);
    if (erreurMdp) {
      return res.status(400).json({ error: erreurMdp });
    }

    // On met l'e-mail en minuscules : « Ali@Mail.com » et « ali@mail.com » sont le même compte.
    const emailPropre = email.toLowerCase().trim();

    // 3. Est-ce que ce compte existe déjà ?
    const dejaInscrit = await prisma.user.findUnique({ where: { email: emailPropre } });
    if (dejaInscrit) {
      return res.status(409).json({ error: 'Cette adresse e-mail est déjà utilisée.' });
    }

    // 4. SÉCURITÉ : on ne stocke JAMAIS le mot de passe en clair.
    //    bcrypt le transforme en une longue suite de caractères impossible à inverser.
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. On crée l'utilisateur dans la base de données.
    const utilisateur = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: emailPropre,
        passwordHash,
        countryOrigin: countryOrigin || null,
        targetCity: targetCity || null,
        studyField: studyField || null,
      },
    });

    // 6. On le connecte directement : on lui donne son jeton (token).
    const token = signToken(utilisateur);
    res.status(201).json({ token, user: publicUser(utilisateur) });
  } catch (erreur) {
    console.error('Erreur inscription :', erreur);
    res.status(500).json({ error: "Impossible de créer le compte pour le moment." });
  }
});

/* ===================================================================
 * 2) CONNEXION          POST /api/auth/login
 * =================================================================== */

router.post('/login', limiteConnexion, async (req, res) => {
  try {
    // 1. On récupère l'e-mail et le mot de passe saisis.
    const { email, password } = req.body;

    if (!emailValide(email) || !password) {
      return res.status(400).json({ error: 'E-mail et mot de passe sont obligatoires.' });
    }

    const emailPropre = email.toLowerCase().trim();

    // 2. On cherche l'utilisateur dans la base.
    const utilisateur = await prisma.user.findUnique({ where: { email: emailPropre } });

    // 3. On compare le mot de passe saisi avec le mot de passe haché stocké.
    //    bcrypt.compare fait le travail : il re-hache et compare, sans jamais déchiffrer.
    let motDePasseCorrect = false;
    if (utilisateur) {
      motDePasseCorrect = await bcrypt.compare(password, utilisateur.passwordHash);
    }

    // 4. On garde une trace de la tentative (utile pour détecter les attaques).
    await prisma.loginAttempt.create({
      data: { email: emailPropre, ip: req.ip, success: motDePasseCorrect },
    });

    // 5. SÉCURITÉ : même message que l'e-mail existe ou non.
    //    Sinon un pirate pourrait deviner quelles adresses sont inscrites.
    if (!motDePasseCorrect) {
      return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' });
    }

    if (!utilisateur.isActive) {
      return res.status(403).json({ error: 'Ce compte a été désactivé.' });
    }

    // 6. Tout est bon : on renvoie le jeton et le profil (sans le mot de passe).
    const token = signToken(utilisateur);
    res.json({ token, user: publicUser(utilisateur) });
  } catch (erreur) {
    console.error('Erreur connexion :', erreur);
    res.status(500).json({ error: 'Impossible de se connecter pour le moment.' });
  }
});

/* ===================================================================
 * 3) MON PROFIL         GET /api/auth/me
 * -------------------------------------------------------------------
 * requireAuth s'exécute avant la route : il vérifie le jeton et
 * remplit req.user. Si le jeton est absent ou faux, la route
 * ci-dessous n'est même pas appelée.
 * =================================================================== */

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

/* ===================================================================
 * 4) MODIFIER SON PROFIL     PATCH /api/auth/me
 * =================================================================== */

router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { fullName, countryOrigin, targetCity, studyField, interests, locale } = req.body;

    if (fullName !== undefined && fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Le nom complet est obligatoire.' });
    }

    const utilisateur = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        // On ne met à jour que les champs réellement envoyés par le formulaire.
        ...(fullName !== undefined ? { fullName: fullName.trim() } : {}),
        ...(countryOrigin !== undefined ? { countryOrigin } : {}),
        ...(targetCity !== undefined ? { targetCity } : {}),
        ...(studyField !== undefined ? { studyField } : {}),
        ...(interests !== undefined ? { interests } : {}),
        ...(locale === 'fr' || locale === 'en' ? { locale } : {}),
      },
    });

    res.json({ user: publicUser(utilisateur) });
  } catch (erreur) {
    console.error('Erreur mise à jour profil :', erreur);
    res.status(500).json({ error: 'Impossible de mettre à jour le profil.' });
  }
});

/* ===================================================================
 * 5) CHANGER SON MOT DE PASSE    POST /api/auth/change-password
 *    (depuis la page profil, quand on connaît son ancien mot de passe)
 * =================================================================== */

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. On vérifie le nouveau mot de passe.
    const erreurMdp = erreurMotDePasse(newPassword);
    if (erreurMdp) {
      return res.status(400).json({ error: erreurMdp });
    }

    // 2. On vérifie que l'ancien mot de passe est le bon.
    const ancienCorrect = await bcrypt.compare(currentPassword || '', req.user.passwordHash);
    if (!ancienCorrect) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
    }

    // 3. On hache le nouveau et on l'enregistre.
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    res.json({ message: 'Mot de passe mis à jour.' });
  } catch (erreur) {
    console.error('Erreur changement de mot de passe :', erreur);
    res.status(500).json({ error: 'Impossible de changer le mot de passe.' });
  }
});

/* ===================================================================
 * 6) MOT DE PASSE OUBLIÉ     POST /api/auth/forgot-password
 * -------------------------------------------------------------------
 * Principe : on fabrique une clé secrète au hasard (le « token »),
 * on l'envoie par e-mail dans un lien, et on garde en base une
 * empreinte de cette clé avec une date d'expiration.
 * =================================================================== */

router.post('/forgot-password', limiteMotDePasseOublie, async (req, res) => {
  try {
    const { email } = req.body;

    if (!emailValide(email)) {
      return res.status(400).json({ error: "L'adresse e-mail n'est pas valide." });
    }

    const emailPropre = email.toLowerCase().trim();
    const utilisateur = await prisma.user.findUnique({ where: { email: emailPropre } });

    // SÉCURITÉ : on répond exactement la même chose que le compte existe ou non,
    // pour ne pas révéler quelles adresses sont inscrites sur le site.
    const reponse = {
      message:
        "Si un compte est associé à cette adresse, un e-mail de réinitialisation vient d'être envoyé.",
    };

    if (!utilisateur) {
      return res.json(reponse);
    }

    // 1. On fabrique une clé secrète au hasard (64 caractères).
    const cleSecrete = crypto.randomBytes(32).toString('hex');

    // 2. On ne stocke PAS la clé telle quelle, seulement son empreinte (hash).
    //    Ainsi, même si la base était volée, les liens ne seraient pas réutilisables.
    const tokenHash = crypto.createHash('sha256').update(cleSecrete).digest('hex');

    // 3. Le lien expire après 30 minutes (valeur réglable dans le fichier .env).
    const expiresAt = new Date(Date.now() + env.resetTokenTtlMinutes * 60 * 1000);

    // 4. On annule les anciennes demandes non utilisées, puis on enregistre la nouvelle.
    await prisma.passwordResetToken.deleteMany({ where: { userId: utilisateur.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: { tokenHash, userId: utilisateur.id, expiresAt },
    });

    // 5. On envoie l'e-mail contenant le lien.
    //    En développement (MAIL_ENABLED=false), le lien s'affiche dans la console du serveur.
    const lien = `${env.clientUrl}/reset-password?token=${cleSecrete}`;
    const message = resetPasswordEmail({
      fullName: utilisateur.fullName,
      link: lien,
      ttlMinutes: env.resetTokenTtlMinutes,
    });
    await sendMail({ to: utilisateur.email, ...message });

    res.json(reponse);
  } catch (erreur) {
    console.error('Erreur mot de passe oublié :', erreur);
    res.status(500).json({ error: "Impossible d'envoyer l'e-mail pour le moment." });
  }
});

/* ===================================================================
 * 7) NOUVEAU MOT DE PASSE    POST /api/auth/reset-password
 *    (page atteinte en cliquant sur le lien reçu par e-mail)
 * =================================================================== */

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // 1. On vérifie le nouveau mot de passe choisi.
    const erreurMdp = erreurMotDePasse(password);
    if (erreurMdp) {
      return res.status(400).json({ error: erreurMdp });
    }

    if (!token) {
      return res.status(400).json({ error: 'Lien de réinitialisation invalide.' });
    }

    // 2. On recalcule l'empreinte de la clé reçue pour la retrouver en base.
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const demande = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    // 3. Le lien doit exister, ne pas avoir déjà servi, et ne pas être expiré.
    if (!demande || demande.usedAt || demande.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Ce lien de réinitialisation est invalide ou expiré.' });
    }

    // 4. On enregistre le nouveau mot de passe (haché, comme toujours).
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: demande.userId }, data: { passwordHash } });

    // 5. On marque le lien comme utilisé : il ne fonctionnera plus une seconde fois.
    await prisma.passwordResetToken.update({
      where: { id: demande.id },
      data: { usedAt: new Date() },
    });

    res.json({ message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' });
  } catch (erreur) {
    console.error('Erreur réinitialisation :', erreur);
    res.status(500).json({ error: 'Impossible de réinitialiser le mot de passe.' });
  }
});

export default router;
