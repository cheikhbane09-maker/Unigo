/* ===================================================================
 * MODULE UNIVERSITÉ — annuaire, filtres, comparateur, filières
 * Responsable : Kaiju
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * Calcule la note moyenne et le nombre d'avis pour une liste d'universités,
 * puis ajoute ces deux informations à chaque université.
 */
async function ajouterLesNotes(universites) {
  if (universites.length === 0) return universites;

  const ids = universites.map((u) => u.id);

  // groupBy = « regroupe les avis par université et fais la moyenne des notes »
  const groupes = await prisma.review.groupBy({
    by: ['universityId'],
    where: { universityId: { in: ids }, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return universites.map((u) => {
    const groupe = groupes.find((g) => g.universityId === u.id);
    return {
      ...u,
      rating: groupe ? Number(groupe._avg.rating.toFixed(2)) : 0,
      reviewCount: groupe ? groupe._count.rating : 0,
    };
  });
}

/* ===================================================================
 * GET /api/universities
 * Liste des établissements, avec filtres et pagination.
 * Exemple : /api/universities?city=Dakar&degree=MASTER&page=2
 * =================================================================== */

router.get('/', async (req, res) => {
  try {
    const { q, city, type, field, degree, language, budgetMax, housing, sort, page, limit } = req.query;

    // Pagination : 12 résultats par page par défaut, 50 au maximum.
    const parPage = Math.min(Number(limit) || 12, 50);
    const pageActuelle = Math.max(Number(page) || 1, 1);
    const aSauter = (pageActuelle - 1) * parPage;

    // Filtres qui portent sur les filières (un objet vide = pas de filtre).
    const filtreFilieres = {};
    if (field) filtreFilieres.field = field;
    if (degree) filtreFilieres.degree = degree;
    if (language) filtreFilieres.language = { contains: language };
    if (budgetMax) filtreFilieres.tuitionFcfa = { lte: Number(budgetMax) };

    // Filtres qui portent sur l'établissement lui-même.
    const where = { isPublished: true };
    if (city) where.city = city;
    if (type) where.type = type;
    if (housing === 'true') where.hasCampusHousing = true;
    if (q) {
      // OR = « le texte cherché est dans le nom OU le sigle OU la ville OU la description »
      where.OR = [
        { name: { contains: q } },
        { acronym: { contains: q } },
        { city: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (Object.keys(filtreFilieres).length > 0) {
      where.programs = { some: filtreFilieres }; // au moins une filière correspond
    }

    // Tri
    let orderBy = { name: 'asc' };
    if (sort === 'city') orderBy = { city: 'asc' };
    if (sort === 'recent') orderBy = { createdAt: 'desc' };

    const universites = await prisma.university.findMany({
      where,
      orderBy,
      skip: aSauter,
      take: parPage,
      include: {
        programs: { select: { id: true, name: true, field: true, degree: true, tuitionFcfa: true } },
      },
    });

    const total = await prisma.university.count({ where });

    res.json({
      data: await ajouterLesNotes(universites),
      pagination: {
        total,
        page: pageActuelle,
        limit: parPage,
        pages: Math.ceil(total / parPage),
      },
    });
  } catch (erreur) {
    console.error('Erreur liste universités :', erreur);
    res.status(500).json({ error: 'Impossible de charger les établissements.' });
  }
});

/* ===================================================================
 * GET /api/universities/filters
 * Renvoie les valeurs possibles pour remplir les listes déroulantes
 * de la page de recherche (villes, domaines, langues…).
 * =================================================================== */

router.get('/filters', async (_req, res) => {
  try {
    const villes = await prisma.university.findMany({
      where: { isPublished: true },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });

    const domaines = await prisma.program.findMany({
      select: { field: true },
      distinct: ['field'],
      orderBy: { field: 'asc' },
    });

    const langues = await prisma.program.findMany({
      select: { language: true },
      distinct: ['language'],
    });

    const fraisMax = await prisma.program.aggregate({ _max: { tuitionFcfa: true } });

    // « Francais/Anglais » compte pour deux langues : on découpe et on dédoublonne.
    const listeLangues = [];
    langues.forEach((l) => {
      l.language.split('/').forEach((langue) => {
        const propre = langue.trim();
        if (propre && !listeLangues.includes(propre)) listeLangues.push(propre);
      });
    });

    res.json({
      cities: villes.map((v) => v.city),
      fields: domaines.map((d) => d.field),
      languages: listeLangues,
      degrees: ['LICENCE', 'MASTER', 'DOCTORAT', 'BTS', 'DUT', 'AUTRE'],
      types: ['PUBLIQUE', 'PRIVEE'],
      maxTuition: fraisMax._max.tuitionFcfa || 0,
    });
  } catch (erreur) {
    console.error('Erreur filtres :', erreur);
    res.status(500).json({ error: 'Impossible de charger les filtres.' });
  }
});

/* ===================================================================
 * GET /api/universities/compare?ids=1,2,3
 * Comparateur : renvoie les établissements demandés (4 maximum).
 * =================================================================== */

router.get('/compare', async (req, res) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map((n) => Number(n.trim()))
      .filter((n) => !isNaN(n) && n > 0)
      .slice(0, 4);

    if (ids.length === 0) {
      return res.json({ data: [] });
    }

    const universites = await prisma.university.findMany({
      where: { id: { in: ids } },
      include: { programs: true },
    });

    res.json({ data: await ajouterLesNotes(universites) });
  } catch (erreur) {
    console.error('Erreur comparateur :', erreur);
    res.status(500).json({ error: 'Impossible de charger le comparateur.' });
  }
});

/* ===================================================================
 * GET /api/universities/:slug
 * Fiche détaillée d'un établissement (avec ses filières et ses avis).
 * =================================================================== */

router.get('/:slug', async (req, res) => {
  try {
    const universite = await prisma.university.findUnique({
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

    if (!universite) {
      return res.status(404).json({ error: 'Université introuvable.' });
    }

    const [avecNote] = await ajouterLesNotes([universite]);
    res.json({ data: avecNote });
  } catch (erreur) {
    console.error('Erreur fiche université :', erreur);
    res.status(500).json({ error: "Impossible de charger la fiche de l'établissement." });
  }
});

/* ===================================================================
 * ADMINISTRATION — réservé aux comptes ADMIN
 * =================================================================== */

// Ajouter un établissement
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { slug, name, city, description } = req.body;

    if (!slug || !name || !city || !description) {
      return res.status(400).json({ error: 'Nom, slug, ville et description sont obligatoires.' });
    }

    const universite = await prisma.university.create({
      data: {
        slug: slug.trim(),
        name: name.trim(),
        acronym: req.body.acronym || null,
        type: req.body.type === 'PRIVEE' ? 'PRIVEE' : 'PUBLIQUE',
        city: city.trim(),
        region: req.body.region || null,
        address: req.body.address || null,
        description,
        website: req.body.website || null,
        email: req.body.email || null,
        phone: req.body.phone || null,
        latitude: req.body.latitude ? Number(req.body.latitude) : null,
        longitude: req.body.longitude ? Number(req.body.longitude) : null,
        foundedYear: req.body.foundedYear ? Number(req.body.foundedYear) : null,
        studentCount: req.body.studentCount ? Number(req.body.studentCount) : null,
        languages: req.body.languages || 'Francais',
        admissionInfo: req.body.admissionInfo || null,
        scholarships: req.body.scholarships || null,
        hasCampusHousing: req.body.hasCampusHousing === true,
      },
    });

    res.status(201).json({ data: universite });
  } catch (erreur) {
    if (erreur.code === 'P2002') {
      return res.status(409).json({ error: 'Ce slug est déjà utilisé par un autre établissement.' });
    }
    console.error('Erreur création université :', erreur);
    res.status(500).json({ error: "Impossible de créer l'établissement." });
  }
});

// Modifier un établissement
router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const champsModifiables = [
      'slug', 'name', 'acronym', 'type', 'city', 'region', 'address', 'description',
      'website', 'email', 'phone', 'languages', 'admissionInfo', 'scholarships',
      'hasCampusHousing', 'isPublished',
    ];

    const data = {};
    champsModifiables.forEach((champ) => {
      if (req.body[champ] !== undefined) data[champ] = req.body[champ];
    });

    const universite = await prisma.university.update({
      where: { id: Number(req.params.id) },
      data,
    });

    res.json({ data: universite });
  } catch (erreur) {
    console.error('Erreur modification université :', erreur);
    res.status(500).json({ error: "Impossible de modifier l'établissement." });
  }
});

// Supprimer un établissement
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.university.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Établissement supprimé.' });
  } catch (erreur) {
    console.error('Erreur suppression université :', erreur);
    res.status(500).json({ error: "Impossible de supprimer l'établissement." });
  }
});

/* ------------------------------ Filières ------------------------------ */

router.post('/programs', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, field, universityId } = req.body;

    if (!name || !field || !universityId) {
      return res.status(400).json({ error: 'Nom, domaine et établissement sont obligatoires.' });
    }

    const filiere = await prisma.program.create({
      data: {
        name: name.trim(),
        field: field.trim(),
        degree: req.body.degree || 'LICENCE',
        durationYears: Number(req.body.durationYears) || 3,
        tuitionFcfa: Number(req.body.tuitionFcfa) || 0,
        language: req.body.language || 'Francais',
        description: req.body.description || null,
        admissionReq: req.body.admissionReq || null,
        universityId: Number(universityId),
      },
    });

    res.status(201).json({ data: filiere });
  } catch (erreur) {
    console.error('Erreur création filière :', erreur);
    res.status(500).json({ error: 'Impossible de créer la filière.' });
  }
});

router.delete('/programs/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.program.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Filière supprimée.' });
  } catch (erreur) {
    console.error('Erreur suppression filière :', erreur);
    res.status(500).json({ error: 'Impossible de supprimer la filière.' });
  }
});

export default router;
