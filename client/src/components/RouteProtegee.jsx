/* ===================================================================
 * ROUTE PROTÉGÉE
 * -------------------------------------------------------------------
 * On enveloppe une page avec ce composant pour la réserver aux
 * personnes connectées. Si personne n'est connecté, React redirige
 * vers /connexion EN EMPORTANT UN MESSAGE, pour que la page de
 * connexion puisse expliquer pourquoi on est arrivé là.
 *
 * Utilisation dans App.jsx :
 *   <Route path="/universites" element={
 *     <RouteProtegee><Universites /></RouteProtegee>
 *   } />
 * =================================================================== */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/* Donne un nom lisible à chaque adresse, pour le message affiché.
   On inclut la préposition (« à », « au ») dans le texte, sinon on
   obtiendrait « accéder à le module » au lieu de « accéder au module ». */
function nomDeLaPage(chemin) {
  if (chemin.startsWith('/universites')) return "à l'annuaire des universités";
  if (chemin.startsWith('/transport')) return 'au module Transport';
  if (chemin.startsWith('/activites')) return 'au module Activités';
  return 'à cette page';
}

export default function RouteProtegee({ children }) {
  const { estConnecte, chargement } = useAuth();
  const emplacement = useLocation();

  // Le temps de lire le navigateur, on n'affiche rien : sinon la page
  // clignoterait vers /connexion avant de revenir.
  if (chargement) {
    return <div className="conteneur py-20 text-center text-ardoise-400">Chargement…</div>;
  }

  if (!estConnecte) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{
          // On retient la page demandée pour y revenir après la connexion…
          depuis: emplacement.pathname,
          // …et on prépare le message que la page de connexion affichera.
          message: `Tu dois être connecté pour accéder ${nomDeLaPage(emplacement.pathname)}.`,
        }}
      />
    );
  }

  return children;
}
