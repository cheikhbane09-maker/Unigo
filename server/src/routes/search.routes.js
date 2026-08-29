/* ===================================================================
 * RECHERCHE GLOBALE — cherche dans les trois modules à la fois
 * (exigence 4.4 du cahier des charges)
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

/* GET /api/search?q=informatique */
router.get('/', async (req, res) => {
  try {
    const recherche = String(req.query.q || '').trim();

    // En dessous de 2 lettres, on ne cherche rien (trop de résultats).
    if (recherche.length < 2) {
      return res.json({ universities: [], programs: [], procedures: [], transport: [], events: [] });
    }

    // Module Université
    const universities = await prisma.university.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: recherche } },
          { acronym: { contains: recherche } },
          { city: { contains: recherche } },
        ],
      },
      select: { id: true, name: true, slug: true, city: true, type: true },
      take: 6,
    });

    // Filières
    const programs = await prisma.program.findMany({
      where: {
        OR: [{ name: { contains: recherche } }, { field: { contains: recherche } }],
      },
      select: {
        id: true,
        name: true,
        field: true,
        degree: true,
        university: { select: { name: true, slug: true } },
      },
      take: 6,
    });

    // Démarches administratives
    const procedures = await prisma.procedure.findMany({
      where: {
        OR: [{ title: { contains: recherche } }, { summary: { contains: recherche } }],
      },
      select: { id: true, title: true, slug: true, category: true },
      take: 5,
    });

    // Module Transport (Binta)
    const transport = await prisma.transportOption.findMany({
      where: {
        isPublished: true,
        OR: [{ name: { contains: recherche } }, { description: { contains: recherche } }],
      },
      select: { id: true, name: true, slug: true, mode: true },
      take: 5,
    });

    // Module Activités (Maguette)
    const events = await prisma.event.findMany({
      where: {
        isApproved: true,
        OR: [{ title: { contains: recherche } }, { city: { contains: recherche } }],
      },
      select: { id: true, title: true, slug: true, city: true, startsAt: true },
      take: 5,
    });

    res.json({ universities, programs, procedures, transport, events });
  } catch (erreur) {
    console.error('Erreur recherche :', erreur);
    res.status(500).json({ error: 'La recherche a échoué.' });
  }
});

export default router;
