/* ===================================================================
 * SERVEUR UNIGO — le point d'entrée de l'API
 * -------------------------------------------------------------------
 * Lancé par « npm run dev:server » depuis la racine du projet.
 *
 * Rien à installer : pas de MySQL, pas de XAMPP. Les données sont
 * dans le fichier server/donnees.json, créé automatiquement au
 * premier démarrage.
 * =================================================================== */

import express from 'express';
import cors from 'cors';

import { lireBase } from './base.js';
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

// Adresse de test : ouvrez http://localhost:4000/api/sante
app.get('/api/sante', (_req, res) => {
  res.json({ statut: 'ok', service: 'API UNIGO' });
});

app.use('/api/auth', authRoutes); // inscription, connexion, mot de passe
app.use('/api', contenuRoutes); // universites, transport, activites

// Si aucune route ne correspond
app.use((_req, res) => {
  res.status(404).json({ error: "Cette adresse n'existe pas sur l'API." });
});

/* ------------------------------ Démarrage ----------------------------- */

// On lit la base une fois au démarrage : ça crée le fichier s'il manque
// et ça permet d'afficher un petit résumé.
const base = lireBase();

app.listen(PORT, () => {
  console.log('\n  ════════════════════════════════════════');
  console.log(`   API UNIGO démarrée sur http://localhost:${PORT}`);
  console.log('  ════════════════════════════════════════');
  console.log(`   ${base.universites.length} établissements`);
  console.log(`   ${base.moyensTransport.length} moyens de transport`);
  console.log(`   ${base.categoriesActivites.length} familles d'activités`);
  console.log(`   ${base.utilisateurs.length} compte(s) inscrit(s)`);
  console.log('\n   Test : http://localhost:4000/api/sante');
  console.log('   Site React attendu sur http://localhost:5173\n');
});
