/* ===================================================================
 * FAVORIS — les établissements enregistrés par un utilisateur
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/* GET /api/favorites — la liste complète de mes favoris */
router.get('/', requireAuth, async (req, res) => {
  try {
    const favoris = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        university: {
          include: { programs: { select: { id: true, field: true, tuitionFcfa: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: favoris });
  } catch (erreur) {
    console.error('Erreur liste favoris :', erreur);
    res.status(500).json({ error: 'Impossible de charger vos favoris.' });
  }
});

/* GET /api/favorites/ids — juste les numéros, pour colorer les cœurs sur les cartes */
router.get('/ids', requireAuth, async (req, res) => {
  try {
    const favoris = await prisma.favorite.findMany({
      where: { userId: req.user.id, type: 'UNIVERSITY' },
      select: { universityId: true },
    });
    res.json({ data: favoris.map((f) => f.universityId).filter(Boolean) });
  } catch (erreur) {
    console.error('Erreur identifiants favoris :', erreur);
    res.status(500).json({ error: 'Impossible de charger vos favoris.' });
  }
});

/* -------------------------------------------------------------------
 * POST /api/favorites/toggle
 * « toggle » = bascule : si l'établissement est déjà en favori on
 * l'enlève, sinon on l'ajoute. C'est le clic sur le petit cœur.
 * ----------------------------------------------------------------- */

router.post('/toggle', requireAuth, async (req, res) => {
  try {
    const universityId = Number(req.body.universityId);

    if (!universityId) {
      return res.status(400).json({ error: "L'établissement est obligatoire." });
    }

    const dejaFavori = await prisma.favorite.findFirst({
      where: { userId: req.user.id, type: 'UNIVERSITY', universityId },
    });

    if (dejaFavori) {
      await prisma.favorite.delete({ where: { id: dejaFavori.id } });
      return res.json({ favorited: false }); // le cœur redevient vide
    }

    await prisma.favorite.create({
      data: { userId: req.user.id, type: 'UNIVERSITY', universityId },
    });
    res.json({ favorited: true }); // le cœur se remplit
  } catch (erreur) {
    console.error('Erreur favori :', erreur);
    res.status(500).json({ error: 'Impossible de modifier vos favoris.' });
  }
});

export default router;
