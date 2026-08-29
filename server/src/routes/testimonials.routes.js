import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';
import { ah } from '../middleware/error.js';

const router = Router();

/** GET /api/testimonials — témoignages publiés */
router.get(
  '/',
  ah(async (req, res) => {
    const rows = await prisma.testimonial.findMany({
      where: {
        isApproved: true,
        ...(req.query.universityId ? { universityId: Number(req.query.universityId) } : {}),
      },
      include: { university: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ data: rows });
  })
);

/** POST /api/testimonials — soumettre un témoignage (modéré) */
router.post(
  '/',
  optionalAuth,
  ah(async (req, res) => {
    const data = z
      .object({
        authorName: z.string().min(2),
        country: z.string().min(2),
        year: z.coerce.number().optional().nullable(),
        content: z.string().min(30, 'Le témoignage doit contenir au moins 30 caractères.'),
        universityId: z.coerce.number().optional().nullable(),
      })
      .parse(req.body);

    const created = await prisma.testimonial.create({
      data: { ...data, userId: req.user?.id ?? null, isApproved: false },
    });

    res.status(201).json({
      data: created,
      message: 'Merci ! Votre témoignage sera publié après modération.',
    });
  })
);

router.get(
  '/pending',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (_req, res) => {
    const rows = await prisma.testimonial.findMany({
      where: { isApproved: false },
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
    res.json({
      data: await prisma.testimonial.update({
        where: { id: Number(req.params.id) },
        data: { isApproved: true },
      }),
    });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    await prisma.testimonial.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Témoignage supprimé.' });
  })
);

export default router;
