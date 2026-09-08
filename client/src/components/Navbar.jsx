/* ===================================================================
 * BARRE DE NAVIGATION
 * -------------------------------------------------------------------
 * Elle change selon qu'on est connecté ou non :
 *   - visiteur   → boutons « Connexion » et « S'inscrire »
 *   - connecté   → son prénom et le bouton « Déconnexion »
 * =================================================================== */

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Les onglets du menu. Pour en ajouter un, il suffit d'ajouter une ligne.
const liens = [
  { chemin: '/universites', libelle: 'Universités' },
  { chemin: '/transport', libelle: 'Transport' },
  { chemin: '/activites', libelle: 'Activités' },
];

export default function Navbar() {
  const { utilisateur, estConnecte, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Cette fonction reçoit { isActive } de la part de NavLink.
  const classeLien = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-ardoise-600 hover:bg-ardoise-100 hover:text-ardoise-900'
    }`;

  function seDeconnecter() {
    deconnecter();
    setMenuOuvert(false);
    navigate('/'); // retour à la page d'accueil
  }

  // « Étudiant Démo » → « Étudiant »
  const prenom = utilisateur ? utilisateur.nomComplet.split(' ')[0] : '';

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

        {/* Les onglets sont TOUJOURS visibles, connecté ou non.
            Si on n'est pas connecté, le clic mène à la page de connexion
            avec un message d'explication (voir RouteProtegee.jsx).
            Le petit cadenas prévient avant même de cliquer. */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {liens.map((lien) => (
            <NavLink
              key={lien.chemin}
              to={lien.chemin}
              className={classeLien}
              title={estConnecte ? undefined : 'Connexion requise'}
            >
              {lien.libelle}
              {!estConnecte && (
                <span aria-hidden="true" className="ml-1 text-xs opacity-50">🔒</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Zone de droite */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {estConnecte ? (
            <>
              <span className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
                  {prenom.slice(0, 1).toUpperCase()}
                </span>
                {prenom}
              </span>
              <button type="button" onClick={seDeconnecter} className="bouton-secondaire">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="bouton-secondaire">
                Connexion
              </Link>
              <Link to="/inscription" className="bouton-principal">
                S'inscrire
              </Link>
            </>
          )}
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
                {!estConnecte && (
                  <span aria-hidden="true" className="ml-1 text-xs opacity-50">🔒</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-ardoise-100 pt-4">
            {estConnecte ? (
              <>
                <span className="bouton-secondaire">{prenom}</span>
                <button type="button" onClick={seDeconnecter} className="bouton-principal">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="bouton-secondaire" onClick={() => setMenuOuvert(false)}>
                  Connexion
                </Link>
                <Link to="/inscription" className="bouton-principal" onClick={() => setMenuOuvert(false)}>
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
