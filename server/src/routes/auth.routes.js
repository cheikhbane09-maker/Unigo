/* ===================================================================
 * COMPTES UTILISATEURS
 * -------------------------------------------------------------------
 * Chaque route suit toujours le même plan :
 *   1. on récupère ce que le formulaire a envoyé (req.body)
 *   2. on vérifie que c'est correct        → sinon res.status(400)
 *   3. on interroge ou on modifie MySQL
 *   4. on renvoie une réponse en JSON      → res.json(...)
 *
 * ⚠ Les requêtes SQL utilisent des « ? » : c'est mysql2 qui insère
 * les valeurs, jamais nous. C'est ce qui protège de l'injection SQL.
 * =================================================================== */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../base.js';
import { fabriquerJeton, utilisateurPublic, exigeConnexion } from '../auth.js';

const router = Router();

/* Vérifie qu'une adresse ressemble à un e-mail : quelquechose@domaine.truc */
function emailValide(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Le mot de passe doit faire 8 caractères, avec une lettre et un chiffre.
   Renvoie null si tout va bien, sinon le message à afficher. */
function erreurMotDePasse(motDePasse) {
  if (typeof motDePasse !== 'string' || motDePasse.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }
  if (!/[a-zA-Z]/.test(motDePasse)) return 'Le mot de passe doit contenir au moins une lettre.';
  if (!/[0-9]/.test(motDePasse)) return 'Le mot de passe doit contenir au moins un chiffre.';
  return null;
}

/* ===================================================================
 * POST /api/auth/inscription
 * =================================================================== */

router.post('/inscription', async (req, res) => {
  try {
    const { nomComplet, email, motDePasse, pays, domaine } = req.body;

    // 1. Vérifications
    if (!nomComplet || nomComplet.trim().length < 2) {
      return res.status(400).json({ error: 'Le nom complet est obligatoire.' });
    }
    if (!emailValide(email)) {
      return res.status(400).json({ error: "L'adresse e-mail n'est pas valide." });
    }
    const probleme = erreurMotDePasse(motDePasse);
    if (probleme) {
      return res.status(400).json({ error: probleme });
    }

    const emailPropre = email.toLowerCase().trim();

    // 2. Le compte existe-t-il déjà ?
    const [existants] = await pool.query('SELECT id FROM utilisateurs WHERE email = ?', [
      emailPropre,
    ]);
    if (existants.length > 0) {
      return res.status(409).json({ error: 'Cette adresse e-mail est déjà utilisée.' });
    }

    // 3. SÉCURITÉ : on ne stocke jamais le mot de passe en clair.
    //    bcrypt le transforme en empreinte impossible à inverser.
    const motDePasseHache = await bcrypt.hash(motDePasse, 10);

    const [resultat] = await pool.query(
      `INSERT INTO utilisateurs (nomComplet, email, motDePasseHache, pays, domaine)
       VALUES (?,?,?,?,?)`,
      [nomComplet.trim(), emailPropre, motDePasseHache, pays || '', domaine || '']
    );

    // 4. On relit la ligne créée pour renvoyer le profil complet.
    const [lignes] = await pool.query('SELECT * FROM utilisateurs WHERE id = ?', [
      resultat.insertId,
    ]);
    const utilisateur = lignes[0];

    res.status(201).json({
      jeton: fabriquerJeton(utilisateur),
      utilisateur: utilisateurPublic(utilisateur),
    });
  } catch (erreur) {
    console.error('Erreur inscription :', erreur);
    res.status(500).json({ error: 'Impossible de créer le compte.' });
  }
});

/* ===================================================================
 * POST /api/auth/connexion
 * =================================================================== */

router.post('/connexion', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!emailValide(email) || !motDePasse) {
      return res.status(400).json({ error: 'E-mail et mot de passe sont obligatoires.' });
    }

    const [lignes] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [
      email.toLowerCase().trim(),
    ]);
    const utilisateur = lignes[0];

    // bcrypt.compare re-hache ce qui est saisi et compare les empreintes.
    // On ne peut jamais retrouver le mot de passe d'origine.
    let correct = false;
    if (utilisateur) {
      correct = await bcrypt.compare(motDePasse, utilisateur.motDePasseHache);
    }

    // SÉCURITÉ : même message que l'e-mail existe ou non, sinon un pirate
    // pourrait deviner quelles adresses sont inscrites sur le site.
    if (!correct) {
      return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' });
    }

    res.json({
      jeton: fabriquerJeton(utilisateur),
      utilisateur: utilisateurPublic(utilisateur),
    });
  } catch (erreur) {
    console.error('Erreur connexion :', erreur);
    res.status(500).json({ error: 'Impossible de se connecter.' });
  }
});

/* ===================================================================
 * GET /api/auth/moi — qui est connecté ?
 * exigeConnexion s'exécute avant : il lit le jeton et remplit req.utilisateur.
 * =================================================================== */

router.get('/moi', exigeConnexion, (req, res) => {
  res.json({ utilisateur: utilisateurPublic(req.utilisateur) });
});

/* ===================================================================
 * POST /api/auth/nouveau-mot-de-passe
 * =================================================================== */

router.post('/nouveau-mot-de-passe', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const probleme = erreurMotDePasse(motDePasse);
    if (probleme) return res.status(400).json({ error: probleme });

    const emailPropre = String(email || '').toLowerCase().trim();

    const [lignes] = await pool.query('SELECT id FROM utilisateurs WHERE email = ?', [emailPropre]);
    if (lignes.length === 0) {
      return res.status(404).json({ error: "Aucun compte n'existe avec cette adresse." });
    }

    const motDePasseHache = await bcrypt.hash(motDePasse, 10);
    await pool.query('UPDATE utilisateurs SET motDePasseHache = ? WHERE id = ?', [
      motDePasseHache,
      lignes[0].id,
    ]);

    res.json({ message: 'Mot de passe modifié. Vous pouvez vous connecter.' });
  } catch (erreur) {
    console.error('Erreur changement de mot de passe :', erreur);
    res.status(500).json({ error: 'Impossible de changer le mot de passe.' });
  }
});

export default router;
