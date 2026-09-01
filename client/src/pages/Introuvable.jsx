/* Page affichée quand l'adresse demandée n'existe pas (erreur 404). */

import { Link } from 'react-router-dom';

export default function Introuvable() {
  return (
    <div className="conteneur flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ardoise-900">Page introuvable</h1>
      <p className="mt-2 max-w-md text-ardoise-600">
        La page que tu cherches n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="bouton-principal mt-7">
        Retour à l'accueil
      </Link>
    </div>
  );
}
