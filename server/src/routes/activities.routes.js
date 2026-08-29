/* ===================================================================
 * MODULE ACTIVITÉS & DIVERTISSEMENT — responsable : Maguette Niang
 * Branche de travail : feature/activites-maguette
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
 *  - TODO : filtres par catégorie, ville et période
 *  - TODO : routes de modération (approuver / supprimer un événement)
 *           — voir testimonials.routes.js
 *  - TODO : recommandations selon les centres d'intérêt (req.user.interests)
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/* GET /api/activities/events — l'agenda des événements publiés */
router.get('/events', async (req, res) => {
  try {
    const { city, category, upcoming } = req.query;

    const where = { isApproved: true };
    if (city) where.city = city;
    if (category) where.category = category;
    if (upcoming === 'true') where.startsAt = { gte: new Date() }; // gte = à partir d'aujourd'hui

    const evenements = await prisma.event.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      take: 60,
    });

    res.json({ data: evenements });
  } catch (erreur) {
    console.error('Erreur agenda :', erreur);
    res.status(500).json({ error: "Impossible de charger l'agenda." });
  }
});

/* GET /api/activities/venues — l'annuaire des lieux de loisirs */
router.get('/venues', async (req, res) => {
  try {
    const where = { isPublished: true };
    if (req.query.city) where.city = req.query.city;
    if (req.query.category) where.category = req.query.category;

    const lieux = await prisma.venue.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ data: lieux });
  } catch (erreur) {
    console.error('Erreur liste lieux :', erreur);
    res.status(500).json({ error: 'Impossible de charger les lieux.' });
  }
});

/* GET /api/activities/communities — les groupes et communautés étudiantes */
router.get('/communities', async (_req, res) => {
  try {
    const communautes = await prisma.community.findMany({ orderBy: { name: 'asc' } });
    res.json({ data: communautes });
  } catch (erreur) {
    console.error('Erreur liste communautés :', erreur);
    res.status(500).json({ error: 'Impossible de charger les communautés.' });
  }
});

/* -------------------------------------------------------------------
 * POST /api/activities/events — proposer un événement
 * Réservé aux utilisateurs connectés ; l'événement passe en modération.
 * ----------------------------------------------------------------- */

router.post('/events', requireAuth, async (req, res) => {
  try {
    const { title, description, city, startsAt, venue, category } = req.body;

    if (!title || !description || !city || !startsAt) {
      return res.status(400).json({ error: 'Titre, description, ville et date sont obligatoires.' });
    }

    // Le « slug » est l'adresse lisible de l'événement dans l'URL.
    // On transforme « Concert à Dakar ! » en « concert-a-dakar-lx3f9 ».
    const slug =
      title
        .toLowerCase()
        .normalize('NFD') // sépare les lettres de leurs accents
        .replace(/[\u0300-\u036f]/g, '') // supprime les accents
        .replace(/[^a-z0-9]+/g, '-') // remplace tout le reste par des tirets
        .replace(/^-|-$/g, '') + // enlève les tirets au début et à la fin
      '-' +
      Date.now().toString(36); // un petit code unique pour éviter les doublons

    const evenement = await prisma.event.create({
      data: {
        slug,
        title: title.trim(),
        description,
        city: city.trim(),
        venue: venue || null,
        category: category || 'CULTUREL',
        startsAt: new Date(startsAt),
        createdById: req.user.id,
        isApproved: false,
      },
    });

    res.status(201).json({
      data: evenement,
      message: 'Événement proposé. Il sera publié après validation par un modérateur.',
    });
  } catch (erreur) {
    console.error('Erreur création événement :', erreur);
    res.status(500).json({ error: "Impossible d'enregistrer cet événement." });
  }
});

export default router;
