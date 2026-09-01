/* ===================================================================
 * POINT D'ENTRÉE DE L'API UNIGO
 * -------------------------------------------------------------------
 * C'est le fichier lancé par « npm run dev ».
 * Il fait quatre choses, dans l'ordre :
 *   1. il active les protections de sécurité
 *   2. il branche les fichiers de routes (une adresse = un fichier)
 *   3. il sert le site React quand celui-ci a été construit (production)
 *   4. il démarre le serveur sur le port 4000
 * =================================================================== */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import { optionalAuth } from './middleware/auth.js';

// Un fichier de routes par grande partie du site
import authRoutes from './routes/auth.routes.js';
import universitiesRoutes from './routes/universities.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import proceduresRoutes from './routes/procedures.routes.js';
import testimonialsRoutes from './routes/testimonials.routes.js';
import adminRoutes from './routes/admin.routes.js';
import searchRoutes from './routes/search.routes.js';
import transportRoutes from './routes/transport.routes.js';
import activitiesRoutes from './routes/activities.routes.js';

const app = express();

/* ------------------------- 1. SÉCURITÉ ---------------------------- */

// helmet ajoute des en-têtes de sécurité recommandés sur chaque réponse.
// La « Content Security Policy » dit au navigateur d'où il a le droit de
// charger les fichiers : ici notre propre serveur, plus les polices Google
// et les images de la carte OpenStreetMap.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://*.tile.openstreetmap.org'],
        connectSrc: ["'self'"],
      },
    },
  })
);

// cors autorise notre site React à appeler l'API quand les deux sont
// hébergés séparément. En production sur le même serveur, ça ne sert pas.
app.use(cors({ origin: env.clientUrl }));

// Permet de lire le JSON envoyé par les formulaires (req.body), limité à 1 Mo.
app.use(express.json({ limit: '1mb' }));

// morgan affiche chaque requête dans la console : pratique pour déboguer.
app.use(morgan('dev'));

// Limite générale : 300 requêtes par minute et par visiteur.
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 300 }));

/* ------------------------- 2. LES ROUTES -------------------------- */

// Petite adresse de test : ouvrez http://localhost:4000/api/health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'UNIGO API' });
});

// Si un jeton valide est présent, req.user sera rempli pour toutes les routes.
app.use(optionalAuth);

app.use('/api/auth', authRoutes); // inscription, connexion, mot de passe
app.use('/api/universities', universitiesRoutes); // module Université
app.use('/api/reviews', reviewsRoutes); // avis
app.use('/api/favorites', favoritesRoutes); // favoris
app.use('/api/procedures', proceduresRoutes); // guide des démarches
app.use('/api/testimonials', testimonialsRoutes); // témoignages
app.use('/api/admin', adminRoutes); // back-office
app.use('/api/search', searchRoutes); // recherche globale
app.use('/api/transport', transportRoutes); // module Transport — Binta
app.use('/api/activities', activitiesRoutes); // module Activités — Maguette

/* ------------------- 3. LE SITE REACT (production) ------------------
 * En développement, le site tourne à part sur le port 5173 et Vite
 * redirige /api vers ici (voir client/vite.config.js) : rien à faire.
 *
 * En production, on construit le site avec « npm run build ». Cela crée
 * le dossier client/dist. Si ce dossier existe, Express le sert
 * directement : le site ET l'API sont alors à la même adresse, sur le
 * port 4000. Plus besoin de proxy ni de CORS.
 * ------------------------------------------------------------------ */

const dossierActuel = path.dirname(fileURLToPath(import.meta.url));
const dossierSite = path.join(dossierActuel, '..', '..', 'client', 'dist');
const siteConstruit = fs.existsSync(path.join(dossierSite, 'index.html'));

if (siteConstruit) {
  // Sert les fichiers du site (HTML, CSS, JS, images).
  app.use(express.static(dossierSite));

  // React gère lui-même ses adresses (/connexion, /universites/ucad…).
  // Le serveur renvoie donc index.html pour toute adresse inconnue,
  // SAUF celles qui commencent par /api : elles doivent rester en 404 JSON.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(dossierSite, 'index.html'));
  });
}

// Si aucune route ne correspond, puis filet de sécurité pour les erreurs.
app.use(notFound);
app.use(errorHandler);

/* ------------------------- 4. DÉMARRAGE --------------------------- */

app.listen(env.port, () => {
  console.log(`\n  API UNIGO démarrée sur http://localhost:${env.port}`);
  if (siteConstruit) {
    console.log(`  Site React servi depuis le même serveur (mode production)`);
  } else {
    console.log(`  Site React attendu sur ${env.clientUrl} (mode développement)`);
  }
  console.log('');
});
