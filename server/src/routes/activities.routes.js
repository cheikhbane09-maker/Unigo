import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { ah } from '../middleware/error.js';

/* ===============================================================
 * MODULE ACTIVITÉS & DIVERTISSEMENT — responsable : Maguette Niang
 * Branche de travail : feature/activites-maguette
 *
 * Ce fichier contient une base fonctionnelle (agenda, lieux,
 * communautés, proposition d'événement). À compléter avec :
 *  - TODO : filtres par catégorie, ville et période (agenda)
 *  - TODO : annuaire détaillé des lieux de loisirs (photos, horaires)
 *  - TODO : groupes/communautés par nationalité et centre d'intérêt
 *  - TODO : recommandations personnalisées selon le profil utilisateur
 *  - TODO : endpoints de modération (approbation des événements proposés)
 * =============================================================== */

const router = Router();

/** GET /api/activities/events — agenda des événements publiés */
router.get(
  '/events',
  ah(async (req, res) => {
    const { city, category, upcoming } = req.query;
    const rows = await prisma.event.findMany({
      where: {
        isApproved: true,
        ...(city ? { city: String(city) } : {}),
        ...(category ? { category: String(category) } : {}),
        ...(upcoming === 'true' ? { startsAt: { gte: new Date() } } : {}),
      },
      orderBy: { startsAt: 'asc' },
      take: 60,
    });
    res.json({ data: rows });
  })
);

/** GET /api/activities/venues — annuaire des lieux de loisirs */
router.get(
  '/venues',
  ah(async (req, res) => {
    const rows = await prisma.venue.findMany({
      where: {
        isPublished: true,
        ...(req.query.city ? { city: String(req.query.city) } : {}),
        ...(req.query.category ? { category: String(req.query.category) } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json({ data: rows });
  })
);

/** GET /api/activities/communities — groupes et communautés */
router.get(
  '/communities',
  ah(async (_req, res) => {
    res.json({ data: await prisma.community.findMany({ orderBy: { name: 'asc' } }) });
  })
);

/** POST /api/activities/events — proposer un événement (soumis à modération) */
router.post(
  '/events',
  requireAuth,
  ah(async (req, res) => {
    // TODO (Maguette) : valider les champs avec zod comme dans auth.routes.js
    const { title, description, city, startsAt, venue, category } = req.body;
    if (!title || !description || !city || !startsAt) {
      return res.status(400).json({ error: 'Titre, description, ville et date sont requis.' });
    }

    const slug =
      String(title)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const created = await prisma.event.create({
      data: {
        slug,
        title,
        description,
        city,
        venue: venue || null,
        category: category || 'CULTUREL',
        startsAt: new Date(startsAt),
        createdById: req.user.id,
        isApproved: false,
      },
    });

    res.status(201).json({
      data: created,
      message: 'Événement proposé. Il sera publié après validation par un modérateur.',
    });
  })
);

export default router;
