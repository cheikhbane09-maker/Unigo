/* ===================================================================
 * MODULE TRANSPORT — le fichier de travail de Binta
 * -------------------------------------------------------------------
 * Ce fichier n'appartient qu'à la branche feature/transport-binta.
 * Personne d'autre n'y touche : aucun risque de conflit Git.
 *
 * Il contient les TRAJETS FRÉQUENTS (aéroport ↔ campus, etc.).
 * Les moyens de transport eux-mêmes (bus, BRT, taxi…) sont déjà en
 * base : ils viennent de server/src/donnees.js → moyensTransport.
 *
 * ⚠ Pour l'instant ce fichier n'est branché à rien : il faut le
 * connecter à la base et à l'API. Les 4 étapes sont expliquées dans
 * TODO_TRANSPORT_BINTA.md (partie 2b).
 * =================================================================== */

export const trajets = [
  {
    id: 'aibd-plateau',
    depart: 'Aéroport AIBD (Diass)',
    arrivee: 'Dakar — Plateau',
    distanceKm: 47,
    duree: '1 h à 1 h 30',
    prixMin: 1500, // en navette / bus
    prixMax: 25000, // en taxi ou VTC de nuit
    moyens: ['ter-navette', 'taxi-clando'], // les id des moyens dans donnees.js
    conseil:
      "Négocie le prix du taxi AVANT de monter : il n'y a pas de compteur. La navette officielle est bien moins chère.",
  },
  {
    id: 'plateau-ucad',
    depart: 'Dakar — Plateau',
    arrivee: 'UCAD (Fann)',
    distanceKm: 5,
    duree: '20 à 40 min',
    prixMin: 150,
    prixMax: 2000,
    moyens: ['ddd', 'aftu-tata', 'taxi-clando'],
    conseil: 'Aux heures de pointe (7h-9h et 17h-19h), le bus est souvent plus rapide que le taxi.',
  },

  // 👇 Binta : ajoute tes trajets ici, en copiant le bloc ci-dessus.
  // Idées : gare routière Beaux Maraîchers ↔ campus, Almadies ↔ Plateau,
  // Dakar ↔ Saint-Louis, Dakar ↔ Thiès, Guédiawaye ↔ Plateau.
];
