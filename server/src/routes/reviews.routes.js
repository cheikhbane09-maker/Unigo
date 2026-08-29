/* ===================================================================
 * AVIS ET NOTES sur les établissements
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/* -------------------------------------------------------------------
 * POST /api/reviews — déposer (ou modifier) son avis
 * Un utilisateur ne peut laisser qu'UN seul avis par établissement.
 * ----------------------------------------------------------------- */

router.post('/', requireAuth, async (req, res) => {
  try {
    const { universityId, rating, title, comment } = req.body;

    // Vérifications
    const note = Number(rating);
    if (!universityId) {
      return res.status(400).json({ error: "L'établissement est obligatoire." });
    }
    if (!note || note < 1 || note > 5) {
      return res.status(400).json({ error: 'La note doit être comprise entre 1 et 5.' });
    }
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ error: 'Votre avis doit contenir au moins 10 caractères.' });
    }

    // A-t-il déjà donné son avis sur cet établissement ?
    const avisExistant = await prisma.review.findFirst({
      where: { userId: req.user.id, universityId: Number(universityId) },
    });

    let avis;
    if (avisExistant) {
      // On met à jour l'ancien avis, qui repasse en modération.
      avis = await prisma.review.update({
        where: { id: avisExistant.id },
        data: { rating: note, title: title || null, comment, isApproved: false },
      });
    } else {
      avis = await prisma.review.create({
        data: {
          userId: req.user.id,
          universityId: Number(universityId),
          rating: note,
          title: title || null,
          comment,
          isApproved: false, // un modérateur devra le valider
        },
      });
    }

    res.status(201).json({
      data: avis,
      message: 'Merci ! Votre avis sera publié après validation par un modérateur.',
    });
  } catch (erreur) {
    console.error('Erreur dépôt avis :', erreur);
    res.status(500).json({ error: "Impossible d'enregistrer votre avis." });
  }
});

/* GET /api/reviews/mine — la liste de mes avis */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const avis = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: { university: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: avis });
  } catch (erreur) {
    console.error('Erreur liste de mes avis :', erreur);
    res.status(500).json({ error: 'Impossible de charger vos avis.' });
  }
});

/* GET /api/reviews/pending — avis en attente de modération (admin) */
router.get('/pending', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  try {
    const avis = await prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { fullName: true, email: true } },
        university: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ data: avis });
  } catch (erreur) {
    console.error('Erreur avis en attente :', erreur);
    res.status(500).json({ error: 'Impossible de charger les avis en attente.' });
  }
});

/* PATCH /api/reviews/:id/approve — publier un avis (admin) */
router.patch('/:id/approve', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const avis = await prisma.review.update({
      where: { id: Number(req.params.id) },
      data: { isApproved: true },
    });
    res.json({ data: avis });
  } catch (erreur) {
    console.error('Erreur approbation avis :', erreur);
    res.status(500).json({ error: "Impossible d'approuver cet avis." });
  }
});

/* DELETE /api/reviews/:id — supprimer son propre avis (ou n'importe lequel si admin) */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const avis = await prisma.review.findUnique({ where: { id: Number(req.params.id) } });

    if (!avis) {
      return res.status(404).json({ error: 'Avis introuvable.' });
    }

    // On vérifie que l'avis appartient bien à la personne connectée.
    if (avis.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres avis.' });
    }

    await prisma.review.delete({ where: { id: avis.id } });
    res.json({ message: 'Avis supprimé.' });
  } catch (erreur) {
    console.error('Erreur suppression avis :', erreur);
    res.status(500).json({ error: 'Impossible de supprimer cet avis.' });
  }
});

export default router;
