/* ===================================================================
 * LA STRUCTURE COMMUNE À TOUTES LES PAGES
 * -------------------------------------------------------------------
 * Barre de navigation en haut, contenu au milieu, pied de page en bas.
 * « children » = le contenu de la page en cours (voir App.jsx).
 * =================================================================== */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  // À chaque changement de page, on remonte en haut de l'écran.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-ardoise-50 text-ardoise-800">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

/* En-tête réutilisable en haut des pages intérieures. */
export function EnTetePage({ titre, sousTitre }) {
  return (
    <div className="border-b border-ardoise-100 bg-white">
      <div className="conteneur py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-ardoise-900 sm:text-4xl">
          {titre}
        </h1>
        {sousTitre && <p className="mt-3 max-w-2xl text-ardoise-600">{sousTitre}</p>}
      </div>
    </div>
  );
}
