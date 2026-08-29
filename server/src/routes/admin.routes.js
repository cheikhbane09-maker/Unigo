import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole, publicUser } from '../middleware/auth.js';
import { ah } from '../middleware/error.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

/** GET /api/admin/stats — tableau de bord */
router.get(
  '/stats',
  ah(async (_req, res) => {
    const [users, universities, programs, reviews, pendingReviews, pendingTestimonials, procedures] =
      await Promise.all([
        prisma.user.count(),
        prisma.university.count(),
        prisma.program.count(),
        prisma.review.count(),
        prisma.review.count({ where: { isApproved: false } }),
        prisma.testimonial.count({ where: { isApproved: false } }),
        prisma.procedure.count(),
      ]);

    const byCity = await prisma.university.groupBy({
      by: ['city'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 8,
    });

    const byCountry = await prisma.user.groupBy({
      by: ['countryOrigin'],
      _count: { countryOrigin: true },
      where: { countryOrigin: { not: null } },
      orderBy: { _count: { countryOrigin: 'desc' } },
      take: 8,
    });

    res.json({
      totals: { users, universities, programs, reviews, pendingReviews, pendingTestimonials, procedures },
      byCity: byCity.map((c) => ({ label: c.city, value: c._count.city })),
      byCountry: byCountry.map((c) => ({ label: c.countryOrigin, value: c._count.countryOrigin })),
    });
  })
);

/** GET /api/admin/users */
router.get(
  '/users',
  ah(async (req, res) => {
    const q = req.query.q ? String(req.query.q) : undefined;
    const rows = await prisma.user.findMany({
      where: q
        ? { OR: [{ fullName: { contains: q } }, { email: { contains: q } }] }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ data: rows.map(publicUser) });
  })
);

/** PATCH /api/admin/users/:id — rôle / activation */
router.patch(
  '/users/:id',
  ah(async (req, res) => {
    const data = z
      .object({
        role: z.enum(['VISITOR', 'STUDENT', 'PARTNER', 'ADMIN']).optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body);

    const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data });
    res.json({ data: publicUser(user) });
  })
);

export default router;
