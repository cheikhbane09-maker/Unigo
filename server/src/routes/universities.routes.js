import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ah } from '../middleware/error.js';

const router = Router();

/* Calcule note moyenne + nombre d'avis approuves pour une liste d'universites. */
async function attachRatings(universities) {
  if (universities.length === 0) return universities;
  const ids = universities.map((u) => u.id);
  const grouped = await prisma.review.groupBy({
    by: ['universityId'],
    where: { universityId: { in: ids }, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const map = new Map(grouped.map((g) => [g.universityId, g]));
  return universities.map((u) => ({
    ...u,
    rating: Number((map.get(u.id)?._avg.rating || 0).toFixed(2)),
    reviewCount: map.get(u.id)?._count.rating || 0,
  }));
}

/**
 * GET /api/universities
 * Filtres : q, city, type, field, degree, language, budgetMax, housing, page, limit, sort
 */
router.get(
  '/',
  ah(async (req, res) => {
    const {
      q,
      city,
      type,
      field,
      degree,
      language,
      budgetMax,
      housing,
      sort = 'name',
      page = '1',
      limit = '12',
    } = req.query;

    const take = Math.min(Number(limit) || 12, 50);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const programFilter = {};
    if (field) programFilter.field = { equals: String(field) };
    if (degree) programFilter.degree = String(degree);
    if (language) programFilter.language = { contains: String(language) };
    if (budgetMax) programFilter.tuitionFcfa = { lte: Number(budgetMax) };

    const where = {
      isPublished: true,
      ...(city ? { city: { equals: String(city) } } : {}),
      ...(type ? { type: String(type) } : {}),
      ...(housing === 'true' ? { hasCampusHousing: true } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: String(q) } },
              { acronym: { contains: String(q) } },
              { city: { contains: String(q) } },
              { description: { contains: String(q) } },
            ],
          }
        : {}),
      ...(Object.keys(programFilter).length ? { programs: { some: programFilter } } : {}),
    };

    const orderBy =
      sort === 'city' ? { city: 'asc' } : sort === 'recent' ? { createdAt: 'desc' } : { name: 'asc' };

    const [rows, total] = await Promise.all([
      prisma.university.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          programs: {
            select: { id: true, name: true, field: true, degree: true, tuitionFcfa: true },
          },
        },
      }),
      prisma.university.count({ where }),
    ]);

    res.json({
      data: await attachRatings(rows),
      pagination: { total, page: Number(page) || 1, limit: take, pages: Math.ceil(total / take) },
    });
  })
);

/** GET /api/universities/filters — valeurs disponibles pour alimenter les filtres */
router.get(
  '/filters',
  ah(async (_req, res) => {
    const [cities, fields, languages, maxTuition] = await Promise.all([
      prisma.university.findMany({
        where: { isPublished: true },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
      }),
      prisma.program.findMany({ select: { field: true }, distinct: ['field'], orderBy: { field: 'asc' } }),
      prisma.program.findMany({ select: { language: true }, distinct: ['language'] }),
      prisma.program.aggregate({ _max: { tuitionFcfa: true } }),
    ]);

    res.json({
      cities: cities.map((c) => c.city),
      fields: fields.map((f) => f.field),
      languages: [...new Set(languages.flatMap((l) => l.language.split('/').map((s) => s.trim())))],
      degrees: ['LICENCE', 'MASTER', 'DOCTORAT', 'BTS', 'DUT', 'AUTRE'],
      types: ['PUBLIQUE', 'PRIVEE'],
      maxTuition: maxTuition._max.tuitionFcfa || 0,
    });
  })
);

/** GET /api/universities/compare?ids=1,2,3 — comparateur */
router.get(
  '/compare',
  ah(async (req, res) => {
    const ids = String(req.query.ids || '')
      .split(',')
      .map((n) => Number(n.trim()))
      .filter(Boolean)
      .slice(0, 4);

    if (ids.length === 0) return res.json({ data: [] });

    const rows = await prisma.university.findMany({
      where: { id: { in: ids } },
      include: { programs: true },
    });
    res.json({ data: await attachRatings(rows) });
  })
);

/** GET /api/universities/:slug — fiche detaillee */
router.get(
  '/:slug',
  ah(async (req, res) => {
    const university = await prisma.university.findUnique({
      where: { slug: req.params.slug },
      include: {
        programs: { orderBy: [{ degree: 'asc' }, { name: 'asc' }] },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { fullName: true, countryOrigin: true } } },
        },
        testimonials: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!university) return res.status(404).json({ error: 'Université introuvable.' });

    const [withRating] = await attachRatings([university]);
    res.json({ data: withRating });
  })
);

/* --------------------------- Administration --------------------------- */

const universitySchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  acronym: z.string().optional().nullable(),
  type: z.enum(['PUBLIQUE', 'PRIVEE']).default('PUBLIQUE'),
  city: z.string().min(2),
  region: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  description: z.string().min(10),
  website: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  foundedYear: z.coerce.number().optional().nullable(),
  studentCount: z.coerce.number().optional().nullable(),
  languages: z.string().default('Francais'),
  admissionInfo: z.string().optional().nullable(),
  scholarships: z.string().optional().nullable(),
  hasCampusHousing: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    const data = universitySchema.parse(req.body);
    const created = await prisma.university.create({ data });
    res.status(201).json({ data: created });
  })
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    const data = universitySchema.partial().parse(req.body);
    const updated = await prisma.university.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json({ data: updated });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    await prisma.university.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Université supprimée.' });
  })
);

/* ----------------------------- Filieres ------------------------------- */

const programSchema = z.object({
  name: z.string().min(2),
  field: z.string().min(2),
  degree: z.enum(['LICENCE', 'MASTER', 'DOCTORAT', 'BTS', 'DUT', 'AUTRE']).default('LICENCE'),
  durationYears: z.coerce.number().int().min(1).max(8).default(3),
  tuitionFcfa: z.coerce.number().int().min(0).default(0),
  language: z.string().default('Francais'),
  description: z.string().optional().nullable(),
  admissionReq: z.string().optional().nullable(),
  universityId: z.coerce.number().int(),
});

router.post(
  '/programs',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    const data = programSchema.parse(req.body);
    const created = await prisma.program.create({ data });
    res.status(201).json({ data: created });
  })
);

router.delete(
  '/programs/:id',
  requireAuth,
  requireRole('ADMIN'),
  ah(async (req, res) => {
    await prisma.program.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Filière supprimée.' });
  })
);

export default router;
