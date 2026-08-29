import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { ah } from '../middleware/error.js';

/* ===============================================================
 * MODULE TRANSPORT — responsable : Binta Comé
 * Branche de travail : feature/transport-binta
 *
 * Ce fichier contient une base fonctionnelle (lecture des moyens de
 * transport et des trajets). À compléter avec :
 *  - TODO : filtres par mode (BUS, BRT, TER, TAXI, VTC, INTERURBAIN)
 *  - TODO : fiches trajets fréquents (aéroport AIBD ↔ campus, etc.)
 *  - TODO : annuaire des prestataires + liens utiles
 *  - TODO : endpoints d'administration (création / édition / suppression)
 *  - TODO : coordonnées GPS pour la carte interactive (Leaflet + OpenStreetMap)
 * =============================================================== */

const router = Router();

/** GET /api/transport — liste des moyens de transport */
router.get(
  '/',
  ah(async (req, res) => {
    const { mode, q } = req.query;
    const rows = await prisma.transportOption.findMany({
      where: {
        isPublished: true,
        ...(mode ? { mode: String(mode) } : {}),
        ...(q ? { OR: [{ name: { contains: String(q) } }, { description: { contains: String(q) } }] } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json({ data: rows });
  })
);

/** GET /api/transport/routes — trajets fréquents */
router.get(
  '/routes',
  ah(async (_req, res) => {
    const rows = await prisma.route.findMany({
      include: { option: { select: { name: true, mode: true } } },
      orderBy: { fromLabel: 'asc' },
    });
    res.json({ data: rows });
  })
);

/** GET /api/transport/:slug — fiche d'un moyen de transport */
router.get(
  '/:slug',
  ah(async (req, res) => {
    const row = await prisma.transportOption.findUnique({
      where: { slug: req.params.slug },
      include: { routes: true },
    });
    if (!row) return res.status(404).json({ error: 'Moyen de transport introuvable.' });
    res.json({ data: row });
  })
);

export default router;
