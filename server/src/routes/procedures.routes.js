import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ah } from '../middleware/error.js';

const router = Router();

/** GET /api/procedures — guide des démarches administratives */
router.get(
  '/',
  ah(async (req, res) => {
    const { category, q } = req.query;
    const rows = await prisma.procedure.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(q
          ? { OR: [{ title: { contains: String(q) } }, { summary: { contains: String(q) } }] }
          : {}),
      },
      orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
    });
    res.json({ data: rows });
  })
);

router.get(
  '/:slug',
  ah(async (req, res) => {
    const row = await prisma.procedure.findUnique({ where: { slug: req.params.slug } });
    if (!row) return res.status(404).json({ error: 'Démarche introuvable.' });
    res.json({ data: row });
  })
);

const procedureSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(3),
  category: z.string().min(2),
  summary: z.string().min(10),
  content: z.string().min(10),
  documents: z.string().optional().nullable(),
  estimatedCostFcfa: z.coerce.number().optional().nullable(),
  estimatedDelay: z.string().optional().nullable(),
  officialLink: z.string().optional().nullable(),
  orderIndex: z.coerce.number().default(0),
});

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    const data = procedureSchema.parse(req.body);
    res.status(201).json({ data: await prisma.procedure.create({ data }) });
  })
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    const data = procedureSchema.partial().parse(req.body);
    res.json({
      data: await prisma.procedure.update({ where: { id: Number(req.params.id) }, data }),
    });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    await prisma.procedure.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Démarche supprimée.' });
  })
);

export default router;
