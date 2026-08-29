/* ===================================================================
 * TÉMOIGNAGES d'anciens étudiants étrangers
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

/* GET /api/testimonials — les témoignages publiés (validés par un modérateur) */
router.get('/', async (req, res) => {
  try {
    const where = { isApproved: true };
    if (req.query.universityId) {
      where.universityId = Number(req.query.universityId);
    }

    const temoignages = await prisma.testimonial.findMany({
      where,
      include: { university: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ data: temoignages });
  } catch (erreur) {
    console.error('Erreur liste témoignages :', erreur);
    res.status(500).json({ error: 'Impossible de charger les témoignages.' });
  }
});

/* GET /api/testimonials/pending — en attente de modération (admin) */
router.get('/pending', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  try {
    const temoignages = await prisma.testimonial.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ data: temoignages });
  } catch (erreur) {
    console.error('Erreur témoignages en attente :', erreur);
    res.status(500).json({ error: 'Impossible de charger les témoignages en attente.' });
  }
});

/* -------------------------------------------------------------------
 * POST /api/testimonials — proposer un témoignage
 * optionalAuth : on accepte aussi les visiteurs non connectés,
 * mais si la personne est connectée on retient son identifiant.
 * ----------------------------------------------------------------- */

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { authorName, country, year, content, universityId } = req.body;

    if (!authorName || authorName.trim().length < 2) {
      return res.status(400).json({ error: 'Votre prénom ou pseudonyme est obligatoire.' });
    }
    if (!country || country.trim().length < 2) {
      return res.status(400).json({ error: "Le pays d'origine est obligatoire." });
    }
    if (!content || content.trim().length < 30) {
      return res.status(400).json({ error: 'Le témoignage doit contenir au moins 30 caractères.' });
    }

    const temoignage = await prisma.testimonial.create({
      data: {
        authorName: authorName.trim(),
        country: country.trim(),
        year: year ? Number(year) : null,
        content,
        universityId: universityId ? Number(universityId) : null,
        userId: req.user ? req.user.id : null,
        isApproved: false, // publié seulement après modération
      },
    });

    res.status(201).json({
      data: temoignage,
      message: 'Merci ! Votre témoignage sera publié après modération.',
    });
  } catch (erreur) {
    console.error('Erreur création témoignage :', erreur);
    res.status(500).json({ error: "Impossible d'enregistrer votre témoignage." });
  }
});

/* PATCH /api/testimonials/:id/approve — publier un témoignage (admin) */
router.patch('/:id/approve', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const temoignage = await prisma.testimonial.update({
      where: { id: Number(req.params.id) },
      data: { isApproved: true },
    });
    res.json({ data: temoignage });
  } catch (erreur) {
    console.error('Erreur approbation témoignage :', erreur);
    res.status(500).json({ error: "Impossible d'approuver ce témoignage." });
  }
});

/* DELETE /api/testimonials/:id — supprimer un témoignage (admin) */
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Témoignage supprimé.' });
  } catch (erreur) {
    console.error('Erreur suppression témoignage :', erreur);
    res.status(500).json({ error: 'Impossible de supprimer ce témoignage.' });
  }
});

export default router;
