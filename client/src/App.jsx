/* ===================================================================
 * LES ADRESSES DU SITE (le « routeur »)
 * -------------------------------------------------------------------
 * Une ligne = une adresse. Quand l'utilisateur va sur /connexion,
 * React affiche le composant Connexion à la place de la page.
 *
 * Pour ajouter une page :
 *   1. créer le fichier dans src/pages/
 *   2. l'importer en haut de ce fichier
 *   3. ajouter une ligne <Route path="..." element={...} />
 * =================================================================== */

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';

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
        {/* Page vitrine */}
        <Route path="/" element={<Accueil />} />

        {/* Module Université — Kaiju */}
        <Route path="/universites" element={<Universites />} />
        <Route path="/universites/:identifiant" element={<DetailUniversite />} />

        {/* Module Transport — Binta Comé */}
        <Route path="/transport" element={<Transport />} />

        {/* Module Activités & Divertissement — Maguette Niang */}
        <Route path="/activites" element={<Activites />} />

        {/* Comptes utilisateurs */}
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route path="/nouveau-mot-de-passe" element={<NouveauMotDePasse />} />

        {/* Adresse inconnue : toujours en dernier */}
        <Route path="*" element={<Introuvable />} />
      </Routes>
    </Layout>
  );
}
