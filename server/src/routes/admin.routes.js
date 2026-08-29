/* ===================================================================
 * BACK-OFFICE — statistiques et gestion des utilisateurs
 * -------------------------------------------------------------------
 * router.use(...) applique les deux vérifications à TOUTES les routes
 * de ce fichier : il faut être connecté ET avoir le rôle ADMIN.
 * =================================================================== */

import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole, publicUser } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

/* GET /api/admin/stats — les chiffres affichés sur le tableau de bord */
router.get('/stats', async (_req, res) => {
  try {
    // count() compte les lignes d'une table.
    const users = await prisma.user.count();
    const universities = await prisma.university.count();
    const programs = await prisma.program.count();
    const reviews = await prisma.review.count();
    const pendingReviews = await prisma.review.count({ where: { isApproved: false } });
    const pendingTestimonials = await prisma.testimonial.count({ where: { isApproved: false } });
    const procedures = await prisma.procedure.count();

    // Répartition des établissements par ville (pour le petit graphique).
    const parVille = await prisma.university.groupBy({
      by: ['city'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 8,
    });

    // Répartition des inscrits par pays d'origine.
    const parPays = await prisma.user.groupBy({
      by: ['countryOrigin'],
      where: { countryOrigin: { not: null } },
      _count: { countryOrigin: true },
      orderBy: { _count: { countryOrigin: 'desc' } },
      take: 8,
    });

    res.json({
      totals: { users, universities, programs, reviews, pendingReviews, pendingTestimonials, procedures },
      byCity: parVille.map((v) => ({ label: v.city, value: v._count.city })),
      byCountry: parPays.map((p) => ({ label: p.countryOrigin, value: p._count.countryOrigin })),
    });
  } catch (erreur) {
    console.error('Erreur statistiques :', erreur);
    res.status(500).json({ error: 'Impossible de charger les statistiques.' });
  }
});

/* GET /api/admin/users — la liste des comptes, avec une recherche facultative */
router.get('/users', async (req, res) => {
  try {
    const where = {};
    if (req.query.q) {
      where.OR = [
        { fullName: { contains: req.query.q } },
        { email: { contains: req.query.q } },
      ];
    }

    const utilisateurs = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // publicUser retire le mot de passe haché de chaque utilisateur.
    res.json({ data: utilisateurs.map(publicUser) });
  } catch (erreur) {
    console.error('Erreur liste utilisateurs :', erreur);
    res.status(500).json({ error: 'Impossible de charger les utilisateurs.' });
  }
});

/* PATCH /api/admin/users/:id — changer le rôle ou activer/désactiver un compte */
router.patch('/users/:id', async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const rolesAutorises = ['VISITOR', 'STUDENT', 'PARTNER', 'ADMIN'];

    const data = {};
    if (role !== undefined) {
      if (!rolesAutorises.includes(role)) {
        return res.status(400).json({ error: 'Rôle inconnu.' });
      }
      data.role = role;
    }
    if (isActive !== undefined) {
      data.isActive = isActive === true;
    }

    const utilisateur = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data,
    });

    res.json({ data: publicUser(utilisateur) });
  } catch (erreur) {
    console.error('Erreur modification utilisateur :', erreur);
    res.status(500).json({ error: 'Impossible de modifier cet utilisateur.' });
  }
});

export default router;
