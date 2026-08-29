import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ah } from '../middleware/error.js';

const router = Router();

const reviewSchema = z.object({
  universityId: z.coerce.number().int(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  comment: z.string().min(10, 'Votre avis doit contenir au moins 10 caractères.'),
});

/** POST /api/reviews — deposer ou mettre a jour son avis (1 avis par universite) */
router.post(
  '/',
  requireAuth,
  ah(async (req, res) => {
    const data = reviewSchema.parse(req.body);

    const review = await prisma.review.upsert({
      where: { userId_universityId: { userId: req.user.id, universityId: data.universityId } },
      create: { ...data, userId: req.user.id, isApproved: false },
      update: { rating: data.rating, title: data.title, comment: data.comment, isApproved: false },
    });

    res.status(201).json({
      data: review,
      message: 'Merci ! Votre avis sera publié après validation par un modérateur.',
    });
  })
);

/** GET /api/reviews/mine — mes avis */
router.get(
  '/mine',
  requireAuth,
  ah(async (req, res) => {
    const rows = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: { university: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: rows });
  })
);

/** DELETE /api/reviews/:id — supprimer son avis (ou n'importe lequel si admin) */
router.delete(
  '/:id',
  requireAuth,
  ah(async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: Number(req.params.id) } });
    if (!review) return res.status(404).json({ error: 'Avis introuvable.' });
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Action non autorisée.' });
    }
    await prisma.review.delete({ where: { id: review.id } });
    res.json({ message: 'Avis supprimé.' });
  })
);

/* ----------------------------- Moderation ----------------------------- */

router.get(
  '/pending',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (_req, res) => {
    const rows = await prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { fullName: true, email: true } },
        university: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ data: rows });
  })
);

router.patch(
  '/:id/approve',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    const updated = await prisma.review.update({
      where: { id: Number(req.params.id) },
      data: { isApproved: true },
    });
    res.json({ data: updated });
  })
);

export default router;
