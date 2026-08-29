/* ===================================================================
 * POINT D'ENTRÉE DE L'API UNIGO
 * -------------------------------------------------------------------
 * C'est le fichier lancé par « npm run dev ».
 * Il fait trois choses, dans l'ordre :
 *   1. il active les protections de sécurité
 *   2. il branche les fichiers de routes (une adresse = un fichier)
 *   3. il démarre le serveur sur le port 4000
 * =================================================================== */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

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
app.use(helmet());

// cors autorise uniquement notre site React à appeler l'API.
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

// Si aucune route ne correspond, puis filet de sécurité pour les erreurs.
app.use(notFound);
app.use(errorHandler);

/* ------------------------- 3. DÉMARRAGE --------------------------- */

app.listen(env.port, () => {
  console.log(`\n  API UNIGO démarrée sur http://localhost:${env.port}`);
  console.log(`  Site React attendu sur ${env.clientUrl}\n`);
});
