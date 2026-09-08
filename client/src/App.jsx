/* ===================================================================
 * LES ADRESSES DU SITE (le « routeur »)
 * -------------------------------------------------------------------
 * Deux familles d'adresses :
 *
 *   PUBLIQUES  — accessibles à tout le monde : l'accueil et les pages
 *                de compte (connexion, inscription, mot de passe).
 *
 *   PROTÉGÉES  — enveloppées dans <RouteProtegee>. Si personne n'est
 *                connecté, on est renvoyé vers /connexion.
 *
 * Pour ajouter une page :
 *   1. créer le fichier dans src/pages/
 *   2. l'importer en haut de ce fichier
 *   3. ajouter une ligne <Route path="..." element={...} />
 * =================================================================== */

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RouteProtegee from './components/RouteProtegee.jsx';

import Accueil from './pages/Accueil.jsx';
import Universites from './pages/Universites.jsx';
import DetailUniversite from './pages/DetailUniversite.jsx';
import Transport from './pages/Transport.jsx';
import Activites from './pages/Activites.jsx';

import Connexion from './pages/Connexion.jsx';
import Inscription from './pages/Inscription.jsx';
import MotDePasseOublie from './pages/MotDePasseOublie.jsx';
import NouveauMotDePasse from './pages/NouveauMotDePasse.jsx';

import Introuvable from './pages/Introuvable.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* ---------------- Pages publiques ---------------- */}
        <Route path="/" element={<Accueil />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route path="/nouveau-mot-de-passe" element={<NouveauMotDePasse />} />

        {/* ------- Pages réservées aux membres connectés ------- */}

        {/* Module Université — Kaiju */}
        <Route
          path="/universites"
          element={
            <RouteProtegee>
              <Universites />
            </RouteProtegee>
          }
        />
        <Route
          path="/universites/:identifiant"
          element={
            <RouteProtegee>
              <DetailUniversite />
            </RouteProtegee>
          }
        />

        {/* Module Transport — Binta Comé */}
        <Route
          path="/transport"
          element={
            <RouteProtegee>
              <Transport />
            </RouteProtegee>
          }
        />

        {/* Module Activités & Divertissement — Maguette Niang */}
        <Route
          path="/activites"
          element={
            <RouteProtegee>
              <Activites />
            </RouteProtegee>
          }
        />

        {/* Adresse inconnue : toujours en dernier */}
        <Route path="*" element={<Introuvable />} />
      </Routes>
    </Layout>
  );
}
