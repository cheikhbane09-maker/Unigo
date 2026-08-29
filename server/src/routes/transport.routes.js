/* ===================================================================
 * MODULE TRANSPORT — responsable : Binta Comé
 * Branche de travail : feature/transport-binta
 * -------------------------------------------------------------------
 * Toutes les routes suivent le même modèle, facile à recopier :
 *
 *   router.get('/adresse', async (req, res) => {
 *     try {
 *       const donnees = await prisma.maTable.findMany({ ... });
 *       res.json({ data: donnees });
 *     } catch (erreur) {
 *       console.error(erreur);
 *       res.status(500).json({ error: 'message pour l\'utilisateur' });
 *     }
 *   });
 *
 * À FAIRE :
 *  - TODO : filtres par mode et par zone
 *  - TODO : routes d'administration (POST / PUT / DELETE) protégées par
 *           requireAuth, requireRole('ADMIN') — voir universities.routes.js
 *  - TODO : annuaire des prestataires + liens utiles
 *  - TODO : coordonnées GPS pour la carte interactive
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

/* GET /api/transport — la liste des moyens de transport */
router.get('/', async (req, res) => {
  try {
    const { mode, q } = req.query;

    const where = { isPublished: true };
    if (mode) where.mode = mode;
    if (q) where.OR = [{ name: { contains: q } }, { description: { contains: q } }];

    const moyens = await prisma.transportOption.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ data: moyens });
  } catch (erreur) {
    console.error('Erreur liste transports :', erreur);
    res.status(500).json({ error: 'Impossible de charger les moyens de transport.' });
  }
});

/* GET /api/transport/routes — les trajets fréquents */
router.get('/routes', async (_req, res) => {
  try {
    const trajets = await prisma.route.findMany({
      include: { option: { select: { name: true, mode: true } } },
      orderBy: { fromLabel: 'asc' },
    });

    res.json({ data: trajets });
  } catch (erreur) {
    console.error('Erreur liste trajets :', erreur);
    res.status(500).json({ error: 'Impossible de charger les trajets.' });
  }
});

/* GET /api/transport/:slug — la fiche d'un moyen de transport */
router.get('/:slug', async (req, res) => {
  try {
    const moyen = await prisma.transportOption.findUnique({
      where: { slug: req.params.slug },
      include: { routes: true },
    });

    if (!moyen) {
      return res.status(404).json({ error: 'Moyen de transport introuvable.' });
    }

    res.json({ data: moyen });
  } catch (erreur) {
    console.error('Erreur fiche transport :', erreur);
    res.status(500).json({ error: 'Impossible de charger cette fiche.' });
  }
});

export default router;
