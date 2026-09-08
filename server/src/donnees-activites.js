/* ===================================================================
 * MODULE ACTIVITÉS & DIVERTISSEMENT — le fichier de travail de Maguette
 * -------------------------------------------------------------------
 * Ce fichier n'appartient qu'à la branche feature/activites-maguette.
 * Personne d'autre n'y touche : aucun risque de conflit Git.
 *
 * Il contient les LIEUX en détail (adresse, téléphone, prix).
 * Les 4 grandes familles (Plages & Nature, Restauration, Loisirs,
 * Culture & Événements) sont déjà en base : elles viennent de
 * server/src/donnees.js → categoriesActivites.
 *
 * ⚠ Pour l'instant ce fichier n'est branché à rien : il faut le
 * connecter à la base et à l'API. Les 4 étapes sont expliquées dans
 * TODO_ACTIVITES_MAGUETTE.md (partie 2b).
 * =================================================================== */

export const lieux = [
  {
    id: 'chez-loutcha',
    nom: 'Chez Loutcha',
    categorie: 'restauration', // doit correspondre à un id de categoriesActivites
    quartier: 'Plateau',
    adresse: '101 rue Moussé Diop, Dakar',
    telephone: '+221 33 821 03 02',
    siteWeb: '',
    prixMin: 3000,
    prixMax: 8000,
    description:
      'Cantine cap-verdienne et sénégalaise, généreuse et bon marché. Une institution du Plateau, très fréquentée le midi.',
  },
  {
    id: 'magic-land',
    nom: 'Magic Land',
    categorie: 'loisirs',
    quartier: 'Corniche Ouest',
    adresse: 'Route de la Corniche Ouest, Dakar',
    telephone: '',
    siteWeb: '',
    prixMin: 1000,
    prixMax: 5000,
    description:
      "Parc d'attractions en bord de mer : manèges, grande roue, jeux. Idéal en fin d'après-midi.",
  },
  {
    id: 'anse-bernard',
    nom: 'Anse Bernard',
    categorie: 'plages-nature',
    quartier: 'Plateau',
    adresse: 'Boulevard de la Libération, Dakar',
    telephone: '',
    siteWeb: '',
    prixMin: 0,
    prixMax: 0,
    description: 'Petite plage abritée du centre-ville, accessible à pied depuis le Plateau.',
  },

  // 👇 Maguette : ajoute tes lieux ici, en copiant un bloc ci-dessus.
  // Pense aux catégories : 'plages-nature', 'restauration', 'loisirs', 'culture'.
];
