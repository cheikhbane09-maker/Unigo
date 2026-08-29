import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env, isProd } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import { optionalAuth } from './middleware/auth.js';

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

app.set('trust proxy', 1);

// Securite : en-tetes HTTP, CORS restreint au front, parsing JSON limite.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: [env.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(isProd ? 'combined' : 'dev'));

// Limitation globale des requetes (anti-abus).
app.use(
  '/api',
  rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', service: 'UNIGO API', time: new Date().toISOString() })
);

app.use(optionalAuth);

app.use('/api/auth', authRoutes);
app.use('/api/universities', universitiesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/procedures', proceduresRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/transport', transportRoutes); // module Binta
app.use('/api/activities', activitiesRoutes); // module Maguette

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`\n  UNIGO API démarrée sur http://localhost:${env.port}`);
  console.log(`  Front-end attendu sur ${env.clientUrl}`);
  console.log(`  Environnement : ${env.nodeEnv}\n`);
});
