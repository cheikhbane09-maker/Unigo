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
 *
 * ⚠ Toutes les requêtes SQL utilisent des « ? » remplacés par
 * mysql2. C'est ce qui protège de l'injection SQL : on ne colle
 * JAMAIS une valeur venue du navigateur directement dans la requête.
 * =================================================================== */

import { Router } from 'express';
import { pool, universiteDepuisBase, activiteDepuisBase, lieuDepuisBase } from '../base.js';
import { exigeConnexion } from '../auth.js';

const router = Router();

/* -------------------------------------------------------------------
 * GET /api/statistiques — PUBLIQUE (pas de exigeConnexion)
 * Les trois chiffres de la page d'accueil. On ne renvoie que des
 * nombres : aucune donnée sensible ne fuit.
 * ----------------------------------------------------------------- */
router.get('/statistiques', async (_req, res) => {
  try {
    const [[universites]] = await pool.query('SELECT COUNT(*) AS n FROM universites');
    const [[transports]] = await pool.query('SELECT COUNT(*) AS n FROM transports');
    const [[lieux]] = await pool.query('SELECT COUNT(*) AS n FROM lieux');

    res.json({
      data: { universites: universites.n, transports: transports.n, activites: lieux.n },
    });
  } catch (erreur) {
    console.error('Erreur statistiques :', erreur);
    res.status(500).json({ error: 'Impossible de charger les statistiques.' });
  }
});

/* GET /api/universites — l'annuaire, avec recherche et filtre facultatifs */
router.get('/universites', exigeConnexion, async (req, res) => {
  try {
    let requete = 'SELECT * FROM universites';
    const valeurs = [];

    // ?recherche=cesag → cherche dans le nom, le quartier, la description
    const recherche = String(req.query.recherche || '').trim();
    if (recherche) {
      requete += ` WHERE (nom LIKE ? OR nomComplet LIKE ? OR quartier LIKE ? OR description LIKE ?)`;
      const motif = `%${recherche}%`;
      valeurs.push(motif, motif, motif, motif);
    }

    requete += ' ORDER BY nom';

    const [lignes] = await pool.query(requete, valeurs);
    let universites = lignes.map(universiteDepuisBase);

    // ?domaine=Informatique — filtré en JavaScript, car les domaines
    // sont enregistrés sous forme de liste JSON dans une colonne texte.
    if (req.query.domaine) {
      universites = universites.filter((u) => u.domaines.includes(req.query.domaine));
    }

    res.json({ data: universites });
  } catch (erreur) {
    console.error('Erreur universites :', erreur);
    res.status(500).json({ error: 'Impossible de charger les établissements.' });
  }
});

/* GET /api/universites/cesag — la fiche d'un établissement */
router.get('/universites/:id', exigeConnexion, async (req, res) => {
  try {
    const [lignes] = await pool.query('SELECT * FROM universites WHERE id = ?', [req.params.id]);

    if (lignes.length === 0) {
      return res.status(404).json({ error: 'Établissement introuvable.' });
    }

    res.json({ data: universiteDepuisBase(lignes[0]) });
  } catch (erreur) {
    console.error('Erreur fiche universite :', erreur);
    res.status(500).json({ error: 'Impossible de charger la fiche.' });
  }
});

/* GET /api/transport — module de Binta */
router.get('/transport', exigeConnexion, async (_req, res) => {
  try {
    const [lignes] = await pool.query('SELECT * FROM transports ORDER BY prixMin');
    res.json({ data: lignes });
  } catch (erreur) {
    console.error('Erreur transport :', erreur);
    res.status(500).json({ error: 'Impossible de charger les transports.' });
  }
});

/* GET /api/activites — module de Maguette */
router.get('/activites', exigeConnexion, async (_req, res) => {
  try {
    const [lignes] = await pool.query('SELECT * FROM activites ORDER BY ordre');
    res.json({ data: lignes.map(activiteDepuisBase) });
  } catch (erreur) {
    console.error('Erreur activites :', erreur);
    res.status(500).json({ error: 'Impossible de charger les activités.' });
  }
});

/* GET /api/lieux — les vrais lieux du module de Maguette
   ?categorie=restauration  → seulement cette famille
   ?recherche=loutcha       → cherche dans le nom */
router.get('/lieux', exigeConnexion, async (req, res) => {
  try {
    let requete = 'SELECT * FROM lieux';
    const conditions = [];
    const valeurs = [];

    if (req.query.categorie) {
      conditions.push('categorie = ?'); // le « ? » : jamais de valeur collée dans le SQL
      valeurs.push(req.query.categorie);
    }

    const recherche = String(req.query.recherche || '').trim();
    if (recherche) {
      conditions.push('(nom LIKE ? OR sousCategorie LIKE ? OR ville LIKE ?)');
      const motif = `%${recherche}%`;
      valeurs.push(motif, motif, motif);
    }

    if (conditions.length > 0) requete += ' WHERE ' + conditions.join(' AND ');
    requete += ' ORDER BY ordre'; // l'ordre voulu dans donnees-activites.js

    const [lignes] = await pool.query(requete, valeurs);
    res.json({ data: lignes.map(lieuDepuisBase) });
  } catch (erreur) {
    console.error('Erreur lieux :', erreur);
    res.status(500).json({ error: 'Impossible de charger les lieux.' });
  }
});

export default router;
