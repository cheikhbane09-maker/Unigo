/* ===================================================================
 * BARRE DE NAVIGATION
 * -------------------------------------------------------------------
 * NavLink est comme un lien classique, mais il sait s'il est actif :
 * on s'en sert pour colorer l'onglet de la page en cours.
 * useState sert à ouvrir/fermer le menu sur téléphone.
 * =================================================================== */

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

// Les onglets du menu. Pour en ajouter un, il suffit d'ajouter une ligne.
const liens = [
  { chemin: '/universites', libelle: 'Universités' },
  { chemin: '/transport', libelle: 'Transport' },
  { chemin: '/activites', libelle: 'Activités' },
];

export default function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Cette fonction reçoit { isActive } de la part de NavLink.
  const classeLien = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-ardoise-600 hover:bg-ardoise-100 hover:text-ardoise-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-ardoise-100 bg-white/90 backdrop-blur">
      <div className="conteneur flex h-16 items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-lg font-bold text-white">
            U
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ardoise-900">
            UNI<span className="text-brand-600">GO</span>
          </span>
        </Link>

        {/* Menu — masqué sur téléphone (hidden md:flex) */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {liens.map((lien) => (
            <NavLink key={lien.chemin} to={lien.chemin} className={classeLien}>
              {lien.libelle}
            </NavLink>
          ))}
        </nav>

        {/* Boutons de compte, à droite */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link to="/connexion" className="bouton-secondaire">
            Connexion
          </Link>
          <Link to="/inscription" className="bouton-principal">
            S'inscrire
          </Link>
        </div>

        {/* Bouton hamburger — visible uniquement sur téléphone */}
        <button
          type="button"
          onClick={() => setMenuOuvert(!menuOuvert)}
          className="ml-auto rounded-lg p-2 text-ardoise-600 hover:bg-ardoise-100 md:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOuvert}
        >
          {menuOuvert ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu déroulant sur téléphone */}
      {menuOuvert && (
        <div className="conteneur border-t border-ardoise-100 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {liens.map((lien) => (
              <NavLink
                key={lien.chemin}
                to={lien.chemin}
                className={classeLien}
                onClick={() => setMenuOuvert(false)}
              >
                {lien.libelle}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex gap-2 border-t border-ardoise-100 pt-4">
            <Link to="/connexion" className="bouton-secondaire" onClick={() => setMenuOuvert(false)}>
              Connexion
            </Link>
            <Link to="/inscription" className="bouton-principal" onClick={() => setMenuOuvert(false)}>
              S'inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
