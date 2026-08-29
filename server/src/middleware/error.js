/* ===================================================================
 * GESTION DES ERREURS
 * -------------------------------------------------------------------
 * Ces deux fonctions sont branchées tout à la fin de src/index.js.
 * =================================================================== */

/** Appelée quand aucune route ne correspond à l'adresse demandée. */
export function notFound(_req, res) {
  res.status(404).json({ error: 'Cette adresse n\'existe pas sur l\'API.' });
}

/**
 * Filet de sécurité : attrape les erreurs qui n'auraient pas été
 * gérées par un try / catch dans une route.
 */
export function errorHandler(erreur, _req, res, _next) {
  // Codes d'erreur renvoyés par Prisma, traduits en messages compréhensibles.
  if (erreur?.code === 'P2002') {
    return res.status(409).json({ error: 'Cette valeur existe déjà.' });
  }
  if (erreur?.code === 'P2025') {
    return res.status(404).json({ error: 'Élément introuvable.' });
  }

  console.error('[UNIGO] Erreur serveur :', erreur);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
}
