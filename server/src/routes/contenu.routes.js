/* ===================================================================
 * LE CONTENU DU SITE — universités, transport, activités
 * -------------------------------------------------------------------
 * Ces routes sont réservées aux personnes connectées : c'est
 * exigeConnexion qui l'impose, exactement comme <RouteProtegee>
 * côté React. Les deux protections vont ensemble :
 *
 *   - React empêche d'AFFICHER la page sans compte
 *   - l'API empêche de RÉCUPÉRER les données sans compte
 *
 * La deuxième est la vraie : on peut contourner React en tapant
 * l'adresse de l'API à la main, jamais le contrôle du serveur.
 * =================================================================== */

import { Router } from 'express';
import { lireBase } from '../base.js';
import { exigeConnexion } from '../auth.js';

const router = Router();

/* -------------------------------------------------------------------
 * GET /api/statistiques — PUBLIQUE (pas de exigeConnexion)
 * Sert les trois chiffres affiches sur la page d'accueil. On ne
 * renvoie que des nombres : aucune donnee sensible ne fuit.
 * ----------------------------------------------------------------- */
router.get('/statistiques', (_req, res) => {
  try {
    const base = lireBase();
    res.json({
      data: {
        universites: base.universites.length,
        transports: base.moyensTransport.length,
        activites: base.categoriesActivites.reduce(
          (total, c) => total + c.sousCategories.length,
          0
        ),
      },
    });
  } catch (erreur) {
    console.error('Erreur statistiques :', erreur);
    res.status(500).json({ error: 'Impossible de charger les statistiques.' });
  }
});

/* GET /api/universites — l'annuaire complet, avec recherche facultative */
router.get('/universites', exigeConnexion, (req, res) => {
  try {
    let universites = lireBase().universites;

    // ?recherche=cesag  → filtre sur le nom, le quartier, la description
    const recherche = String(req.query.recherche || '').toLowerCase().trim();
    if (recherche) {
      universites = universites.filter((u) =>
        `${u.nom} ${u.nomComplet} ${u.quartier} ${u.description}`.toLowerCase().includes(recherche)
      );
    }

    // ?domaine=Informatique
    const domaine = req.query.domaine;
    if (domaine) {
      universites = universites.filter((u) => u.domaines.includes(domaine));
    }

    res.json({ data: universites });
  } catch (erreur) {
    console.error('Erreur universites :', erreur);
    res.status(500).json({ error: 'Impossible de charger les établissements.' });
  }
});

/* GET /api/universites/cesag — la fiche d'un établissement */
router.get('/universites/:id', exigeConnexion, (req, res) => {
  try {
    const universite = lireBase().universites.find((u) => u.id === req.params.id);

    if (!universite) {
      return res.status(404).json({ error: 'Établissement introuvable.' });
    }

    res.json({ data: universite });
  } catch (erreur) {
    console.error('Erreur fiche universite :', erreur);
    res.status(500).json({ error: 'Impossible de charger la fiche.' });
  }
});

/* GET /api/transport — module de Binta */
router.get('/transport', exigeConnexion, (req, res) => {
  try {
    res.json({ data: lireBase().moyensTransport });
  } catch (erreur) {
    console.error('Erreur transport :', erreur);
    res.status(500).json({ error: 'Impossible de charger les transports.' });
  }
});

/* GET /api/activites — module de Maguette */
router.get('/activites', exigeConnexion, (req, res) => {
  try {
    res.json({ data: lireBase().categoriesActivites });
  } catch (erreur) {
    console.error('Erreur activites :', erreur);
    res.status(500).json({ error: 'Impossible de charger les activités.' });
  }
});

export default router;
