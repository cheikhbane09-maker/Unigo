/* ===================================================================
 * AFFICHAGES D'ATTENTE ET D'ERREUR
 * -------------------------------------------------------------------
 * Deux petits composants utilisés par toutes les pages qui chargent
 * des données depuis l'API.
 * =================================================================== */

export function Chargement({ texte = 'Chargement…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-ardoise-400" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ardoise-100 border-t-brand-600" />
      <span className="text-sm">{texte}</span>
    </div>
  );
}

export function ErreurChargement({ message }) {
  return (
    <div className="carte border border-red-100 bg-red-50 text-sm text-red-800" role="alert">
      <p className="font-semibold">Impossible de charger les données</p>
      <p className="mt-1">{message}</p>
      <p className="mt-3 text-xs text-red-700">
        Vérifie que le serveur tourne : dans un terminal, lance{' '}
        <code className="rounded bg-white px-1.5 py-0.5">npm run dev:server</code>
      </p>
    </div>
  );
}
