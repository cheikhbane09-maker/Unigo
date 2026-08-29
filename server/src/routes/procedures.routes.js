/* ===================================================================
 * GUIDE DES DÉMARCHES ADMINISTRATIVES
 * (visa, carte de séjour, équivalence de diplôme, inscription…)
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/* GET /api/procedures — la liste, avec un filtre facultatif par catégorie */
router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;

    const where = {};
    if (category) where.category = category;
    if (q) where.OR = [{ title: { contains: q } }, { summary: { contains: q } }];

    const demarches = await prisma.procedure.findMany({
      where,
      orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
    });

    res.json({ data: demarches });
  } catch (erreur) {
    console.error('Erreur liste démarches :', erreur);
    res.status(500).json({ error: 'Impossible de charger les démarches.' });
  }
});

/* GET /api/procedures/:slug — le détail d'une démarche */
router.get('/:slug', async (req, res) => {
  try {
    const demarche = await prisma.procedure.findUnique({ where: { slug: req.params.slug } });

    if (!demarche) {
      return res.status(404).json({ error: 'Démarche introuvable.' });
    }

    res.json({ data: demarche });
  } catch (erreur) {
    console.error('Erreur détail démarche :', erreur);
    res.status(500).json({ error: 'Impossible de charger cette démarche.' });
  }
});

/* ------------------------- Administration ------------------------- */

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { slug, title, category, summary, content } = req.body;

    if (!slug || !title || !category || !summary || !content) {
      return res.status(400).json({ error: 'Tous les champs principaux sont obligatoires.' });
    }

    const demarche = await prisma.procedure.create({
      data: {
        slug: slug.trim(),
        title: title.trim(),
        category: category.trim(),
        summary,
        content,
        documents: req.body.documents || null,
        estimatedCostFcfa: req.body.estimatedCostFcfa ? Number(req.body.estimatedCostFcfa) : null,
        estimatedDelay: req.body.estimatedDelay || null,
        officialLink: req.body.officialLink || null,
        orderIndex: Number(req.body.orderIndex) || 0,
      },
    });

    res.status(201).json({ data: demarche });
  } catch (erreur) {
    console.error('Erreur création démarche :', erreur);
    res.status(500).json({ error: 'Impossible de créer la démarche.' });
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const champs = ['slug', 'title', 'category', 'summary', 'content', 'documents',
      'estimatedDelay', 'officialLink'];

    const data = {};
    champs.forEach((champ) => {
      if (req.body[champ] !== undefined) data[champ] = req.body[champ];
    });

    const demarche = await prisma.procedure.update({
      where: { id: Number(req.params.id) },
      data,
    });

    res.json({ data: demarche });
  } catch (erreur) {
    console.error('Erreur modification démarche :', erreur);
    res.status(500).json({ error: 'Impossible de modifier la démarche.' });
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.procedure.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Démarche supprimée.' });
  } catch (erreur) {
    console.error('Erreur suppression démarche :', erreur);
    res.status(500).json({ error: 'Impossible de supprimer la démarche.' });
  }
});

export default router;
