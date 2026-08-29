import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { ah } from '../middleware/error.js';

const router = Router();

/**
 * GET /api/search?q=...
 * Moteur de recherche global multi-modules (exigence 4.4 du cahier des charges).
 * Les blocs Transport et Activités sont branchés sur les modèles préparés :
 * ils se rempliront automatiquement quand Binta et Maguette auront saisi leurs données.
 */
router.get(
  '/',
  ah(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ universities: [], programs: [], procedures: [], transport: [], events: [] });
    }

    const [universities, programs, procedures, transport, events] = await Promise.all([
      prisma.university.findMany({
        where: {
          isPublished: true,
          OR: [{ name: { contains: q } }, { acronym: { contains: q } }, { city: { contains: q } }],
        },
        select: { id: true, name: true, slug: true, city: true, type: true },
        take: 6,
      }),
      prisma.program.findMany({
        where: { OR: [{ name: { contains: q } }, { field: { contains: q } }] },
        select: {
          id: true,
          name: true,
          field: true,
          degree: true,
          university: { select: { name: true, slug: true } },
        },
        take: 6,
      }),
      prisma.procedure.findMany({
        where: { OR: [{ title: { contains: q } }, { summary: { contains: q } }] },
        select: { id: true, title: true, slug: true, category: true },
        take: 5,
      }),
      prisma.transportOption.findMany({
        where: { isPublished: true, OR: [{ name: { contains: q } }, { description: { contains: q } }] },
        select: { id: true, name: true, slug: true, mode: true },
        take: 5,
      }),
      prisma.event.findMany({
        where: { isApproved: true, OR: [{ title: { contains: q } }, { city: { contains: q } }] },
        select: { id: true, title: true, slug: true, city: true, startsAt: true },
        take: 5,
      }),
    ]);

    res.json({ universities, programs, procedures, transport, events });
  })
);

export default router;
