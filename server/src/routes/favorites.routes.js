import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { ah } from '../middleware/error.js';

const router = Router();

/** GET /api/favorites — mes favoris (universites pour la phase 1) */
router.get(
  '/',
  requireAuth,
  ah(async (req, res) => {
    const rows = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        university: {
          include: { programs: { select: { id: true, field: true, tuitionFcfa: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: rows });
  })
);

/** POST /api/favorites/toggle — ajoute ou retire un favori */
router.post(
  '/toggle',
  requireAuth,
  ah(async (req, res) => {
    const { universityId } = z
      .object({ universityId: z.coerce.number().int() })
      .parse(req.body);

    const existing = await prisma.favorite.findFirst({
      where: { userId: req.user.id, type: 'UNIVERSITY', universityId },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: { userId: req.user.id, type: 'UNIVERSITY', universityId },
    });
    res.json({ favorited: true });
  })
);

/** GET /api/favorites/ids — identifiants des universites mises en favori */
router.get(
  '/ids',
  requireAuth,
  ah(async (req, res) => {
    const rows = await prisma.favorite.findMany({
      where: { userId: req.user.id, type: 'UNIVERSITY' },
      select: { universityId: true },
    });
    res.json({ data: rows.map((r) => r.universityId).filter(Boolean) });
  })
);

export default router;
