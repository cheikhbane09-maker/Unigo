/* ===================================================================
 * useApi — un « hook » maison pour charger des données
 * -------------------------------------------------------------------
 * Charger des données depuis l'API demande toujours les mêmes 3 états :
 *   - chargement  (on attend la réponse)
 *   - erreur      (le serveur a répondu une erreur, ou ne répond pas)
 *   - donnees     (tout s'est bien passé)
 *
 * Plutôt que de réécrire ça dans chaque page, on l'écrit une fois ici.
 *
 * Utilisation dans une page :
 *   const { donnees, erreur, chargement } = useApi('/universites');
 * =================================================================== */

import { useEffect, useState } from 'react';
import { get } from './api.js';

export function useApi(chemin) {
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    // « annule » évite de mettre à jour une page déjà quittée :
    // sans ça, React affiche un avertissement dans la console.
    let annule = false;

    setChargement(true);
    setErreur(null);

    get(chemin)
      .then((reponse) => {
        if (!annule) setDonnees(reponse.data);
      })
      .catch((e) => {
        if (!annule) setErreur(e.message);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    // Cette fonction est appelée quand on quitte la page.
    return () => {
      annule = true;
    };
  }, [chemin]); // relance l'appel si l'adresse change

  return { donnees, erreur, chargement };
}
