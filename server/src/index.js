/* ===================================================================
 * SERVEUR UNIGO — le point d'entrée de l'API
 * -------------------------------------------------------------------
 * Lancé par « npm run dev:server » depuis la racine du projet.
 *
 * ⚠ MySQL doit tourner AVANT de lancer ce serveur :
 *   ouvre le XAMPP Control Panel et clique sur Start en face de MySQL.
 *   La base « unigo » et ses tables sont créées automatiquement.
 * =================================================================== */

import 'dotenv/config'; // charge server/.env
import express from 'express';
import cors from 'cors';

import { initialiserBase, pool } from './base.js';
import authRoutes from './routes/auth.routes.js';
import contenuRoutes from './routes/contenu.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

/* ------------------------------ Réglages ------------------------------ */

// Autorise le site React (port 5173) à appeler cette API.
app.use(cors());

// Permet de lire le JSON envoyé par les formulaires (req.body).
app.use(express.json());

// Affiche chaque requête dans la console : très pratique pour déboguer.
app.use((req, _res, suite) => {
  console.log(`  ${req.method} ${req.url}`);
  suite();
});

/* ------------------------------- Routes ------------------------------- */

// Adresse de test : ouvre http://localhost:4000/api/sante
app.get('/api/sante', (_req, res) => {
  res.json({ statut: 'ok', service: 'API UNIGO', base: 'MySQL' });
});

app.use('/api/auth', authRoutes); // inscription, connexion, mot de passe
app.use('/api', contenuRoutes); // universites, transport, activites

// Si aucune route ne correspond
app.use((_req, res) => {
  res.status(404).json({ error: "Cette adresse n'existe pas sur l'API." });
});

/* ------------------------------ Démarrage ----------------------------- */

// On attend que la base soit prête AVANT d'ouvrir le serveur : sinon les
// premières requêtes arriveraient sur des tables qui n'existent pas encore.
try {
  const nomBase = await initialiserBase();

  const [[u]] = await pool.query('SELECT COUNT(*) AS n FROM universites');
  const [[t]] = await pool.query('SELECT COUNT(*) AS n FROM transports');
  const [[a]] = await pool.query('SELECT COUNT(*) AS n FROM activites');
  const [[c]] = await pool.query('SELECT COUNT(*) AS n FROM utilisateurs');

  app.listen(PORT, () => {
    console.log('\n  ════════════════════════════════════════');
    console.log(`   API UNIGO démarrée sur http://localhost:${PORT}`);
    console.log('  ════════════════════════════════════════');
    console.log(`   Base MySQL « ${nomBase} » connectée`);
    console.log(`   ${u.n} établissements · ${t.n} transports · ${a.n} familles d'activités`);
    console.log(`   ${c.n} compte(s) inscrit(s)`);
    console.log('\n   Test  : http://localhost:4000/api/sante');
    console.log('   Base  : http://localhost/phpmyadmin');
    console.log('   Site  : http://localhost:5173\n');
  });
} catch (erreur) {
  // Le message le plus utile du projet : sans ça, on cherche pendant une heure.
  console.error('\n  ✖ IMPOSSIBLE DE SE CONNECTER À MYSQL\n');

  if (erreur.code === 'ECONNREFUSED') {
    console.error('   MySQL ne tourne pas.');
    console.error('   → Ouvre le XAMPP Control Panel et clique sur Start en face de MySQL.\n');
  } else if (erreur.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error("   Identifiants refusés par MySQL.");
    console.error('   → Vérifie DB_USER et DB_PASSWORD dans server/.env\n');
  } else {
    console.error(`   ${erreur.message}\n`);
  }

  process.exit(1);
}
