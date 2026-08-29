import { ZodError } from 'zod';

export function notFound(_req, res) {
  res.status(404).json({ error: 'Ressource introuvable.' });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Données invalides.',
      details: err.errors.map((e) => ({ champ: e.path.join('.'), message: e.message })),
    });
  }
  if (err?.code === 'P2002') {
    return res.status(409).json({ error: 'Cette valeur existe déjà.' });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Ressource introuvable.' });
  }
  console.error('[UNIGO] Erreur serveur :', err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur interne du serveur.' });
}

/** Enveloppe un handler async pour propager les erreurs vers errorHandler. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
