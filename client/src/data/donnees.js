/* ===================================================================
 * DONNÉES DE DÉMONSTRATION
 * -------------------------------------------------------------------
 * Tant que le backend n'est pas branché, le site lit ses informations
 * dans ce fichier. C'est du JavaScript pur : des tableaux d'objets.
 *
 * Quand l'API sera prête, on remplacera simplement
 *     import { universites } from '../data/donnees.js'
 * par un appel réseau, et le reste des pages ne bougera pas.
 *
 * Les contacts des établissements ont été vérifiés en septembre 2026
 * (voir CONTACTS_ETABLISSEMENTS.md à la racine du projet).
 * =================================================================== */

export const universites = [
  {
    id: 'unipro',
    nom: 'UNIPRO',
    nomComplet: 'UNI-PRO',
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Sicap Mermoz',
    adresse: 'Sicap Mermoz, Immeuble 7648, Dakar',
    telephone: '+221 77 855 94 19',
    email: 'uniprocomsn@gmail.com',
    siteWeb: 'https://unipro.sn',
    description:
      "Établissement privé d'enseignement supérieur situé à Mermoz, proposant des formations professionnalisantes de courte et moyenne durée.",
    domaines: ['Gestion', 'Informatique'],
    fraisMin: 400000,
  },
  {
    id: 'ism-dakar',
    nom: 'ISM Dakar',
    nomComplet: 'Groupe ISM — Institut Supérieur de Management',
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Rue 1',
    adresse: '22 Rue 1, Dakar',
    telephone: '+221 33 869 76 76',
    email: 'info@ism.edu.sn',
    siteWeb: 'https://www.groupeism.sn',
    description:
      "L'un des plus grands groupes d'enseignement supérieur privé d'Afrique francophone. Management, finance, marketing, communication et informatique, avec de nombreux doubles diplômes internationaux.",
    domaines: ['Management', 'Finance', 'Marketing', 'Informatique'],
    fraisMin: 1500000,
  },
  {
    id: 'supdeco',
    nom: 'Supdeco Dakar',
    nomComplet: 'Groupe École Supérieure de Commerce de Dakar',
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Plateau',
    adresse: '7, Avenue Faidherbe — BP 21345, Dakar',
    telephone: '+221 33 849 69 19',
    email: 'admission@supdeco.sn',
    siteWeb: 'https://supdeco.sn',
    description:
      "Grande école de commerce sénégalaise. Management, informatique, transport-logistique et droit, avec une forte orientation professionnelle.",
    domaines: ['Commerce', 'Logistique', 'Droit', 'Informatique'],
    fraisMin: 1400000,
  },
  {
    id: 'cesag',
    nom: 'CESAG',
    nomComplet: "Centre Africain d'Études Supérieures en Gestion",
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Plateau',
    adresse: 'Boulevard Mamadou Dia x Malick Sy — BP 3802, Dakar',
    telephone: '+221 33 839 73 60',
    email: 'courrier@cesag.edu.sn',
    siteWeb: 'https://www.cesag.sn',
    description:
      "École de management à vocation régionale rattachée à la BCEAO. Le public y est très majoritairement international : un excellent point de chute pour un étudiant étranger.",
    domaines: ['Gestion', 'Finance', 'Audit', 'Santé publique'],
    fraisMin: 2600000,
  },
  {
    id: 'iam',
    nom: 'IAM',
    nomComplet: 'Groupe Institut Africain de Management',
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Mermoz',
    adresse: 'Mermoz, villa 7606 — BP 15391, Dakar (Route de la Pyrotechnie)',
    telephone: '+221 33 869 36 36',
    email: 'info@groupeiam.com',
    siteWeb: 'https://groupeiam.com',
    description:
      "Groupe reconnu en management, ingénierie et technologies, avec des campus dans plusieurs pays d'Afrique de l'Ouest.",
    domaines: ['Management', 'Ingénierie', 'Informatique'],
    fraisMin: 1200000,
  },
  {
    id: 'dit',
    nom: 'DIT',
    nomComplet: 'Dakar Institute of Technology',
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Keur Gorgui',
    adresse: 'Immeuble 46, Cité Keur Gorgui, Dakar',
    telephone: '+221 33 822 47 33',
    whatsapp: '+221 78 429 77 77',
    email: 'info@dit.sn',
    siteWeb: 'https://dit.sn',
    description:
      "École spécialisée dans le numérique : développement, data, cybersécurité. Accueil téléphonique du lundi au vendredi de 9h à 17h.",
    domaines: ['Informatique', 'Data', 'Cybersécurité'],
    fraisMin: 1500000,
  },
  {
    id: 'euromed',
    nom: 'Euromed',
    nomComplet: 'Euromed Université',
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Ouakam / Mamelles',
    adresse: 'Mamelles 472, rue OKM 23 — BP 24274, Ouakam, Dakar',
    telephone: '+221 33 825 14 37',
    whatsapp: '+221 76 437 43 19',
    email: null,
    siteWeb: 'https://www.euromed.sn',
    description:
      "Université privée située aux Mamelles, tournée vers les échanges euro-méditerranéens et les formations internationales.",
    domaines: ['Gestion', 'Santé', 'Ingénierie'],
    fraisMin: 1000000,
  },
  {
    id: 'unis',
    nom: 'UNIS',
    nomComplet: 'Université du Sahel',
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Mermoz',
    adresse: '33, Rue MZ-198 Mermoz — BP 5355, Dakar-Fann',
    telephone: '+221 33 860 99 75',
    whatsapp: '+221 33 860 99 75',
    email: 'contact@sahel.education',
    siteWeb: 'https://www.sahel.education',
    description:
      "Université privée fondée en 1998, proposant des formations en sciences de la santé, droit, gestion et sciences sociales.",
    domaines: ['Santé', 'Droit', 'Gestion'],
    fraisMin: 900000,
  },
  {
    id: 'udb',
    nom: 'UDB',
    nomComplet: 'Université Dakar Bourguiba',
    type: 'Privée',
    ville: 'Dakar',
    quartier: 'Biscuiterie',
    adresse: 'Biscuiterie, Dakar',
    telephone: '+221 77 364 50 80',
    email: 'info@udb-sn.com',
    siteWeb: 'http://udb-sn.com',
    description:
      "Université privée pluridisciplinaire de Dakar : droit, économie, informatique et sciences de la santé.",
    domaines: ['Droit', 'Économie', 'Informatique'],
    fraisMin: 700000,
    aVerifier: true, // contacts issus d'un annuaire, à confirmer
  },
];

/* -------------------------------------------------------------------
 * MODULE TRANSPORT — Binta Comé
 * Fourchettes de tarifs relevées sur l'agglomération de Dakar.
 * Elles sont générales : elles s'appliquent à tous les campus.
 * ----------------------------------------------------------------- */

export const moyensTransport = [
  {
    id: 'aftu-tata',
    nom: 'AFTU / Tata',
    prixMin: 100,
    prixMax: 500,
    description:
      "Minibus blancs et bleus des lignes AFTU, très présents dans toute l'agglomération. Le moyen le plus économique au quotidien.",
    conseil: "Ayez toujours de la monnaie : le receveur rend rarement sur les gros billets.",
  },
  {
    id: 'ddd',
    nom: 'Dakar Dem Dikk (DDD)',
    prixMin: 150,
    prixMax: 350,
    description:
      "Les grands bus verts de la société nationale de transport urbain. Lignes régulières et arrêts identifiés.",
    conseil: 'Aux heures de pointe, comptez large sur le temps de trajet.',
  },
  {
    id: 'brt',
    nom: 'BRT',
    prixMin: 400,
    prixMax: 500,
    description:
      "Bus à haut niveau de service sur voie dédiée, climatisé. Il évite une grande partie des embouteillages.",
    conseil: 'Achetez votre carte de transport en station avant de monter.',
  },
  {
    id: 'car-rapide',
    nom: 'Car rapide',
    prixMin: 200,
    prixMax: 500,
    description:
      "Les minibus colorés traditionnels de Dakar. Pittoresques et bon marché, mais sans horaires ni arrêts fixes.",
    conseil: "On monte et on descend en marche : à éviter avec des bagages.",
  },
  {
    id: 'taxi-clando',
    nom: 'Taxi / Clando',
    prixMin: 700,
    prixMax: 2500,
    description:
      "Taxis jaunes et noirs, ou taxis collectifs (« clandos »). Le plus rapide et le plus confortable, mais le plus cher.",
    conseil: "Négociez TOUJOURS le prix avant de monter : il n'y a pas de compteur.",
  },
];

/* -------------------------------------------------------------------
 * MODULE ACTIVITÉS & DIVERTISSEMENT — Maguette Niang
 * Les quatre familles et leurs sous-catégories.
 * ----------------------------------------------------------------- */

export const categoriesActivites = [
  {
    id: 'plages-nature',
    emoji: '🏖️',
    titre: 'Plages & Nature',
    couleur: 'bg-sky-50 text-sky-700',
    sousCategories: [
      'Plages surveillées (baignade)',
      'Spots de surf',
      'Îles (Gorée, Ngor)',
      'Lac Rose / excursions nature',
      'Parcs et espaces verts',
    ],
  },
  {
    id: 'restauration',
    emoji: '🍽️',
    titre: 'Restauration',
    couleur: 'bg-sable-50 text-sable-700',
    sousCategories: [
      'Cuisine sénégalaise traditionnelle',
      'Fruits de mer / poisson',
      'Fast-food / grillades',
      'Restaurants gastronomiques',
      'Cafés / brunch',
    ],
  },
  {
    id: 'loisirs',
    emoji: '🎡',
    titre: 'Loisirs & Activités',
    couleur: 'bg-brand-50 text-brand-700',
    sousCategories: [
      "Parcs d'attractions",
      'Sports & aventure (paintball, escalade, tyrolienne)',
      'Salles de sport / fitness',
      'Jeux en salle (bowling, jeux vidéo)',
      'Librairies / médiathèques',
    ],
  },
  {
    id: 'culture',
    emoji: '🎭',
    titre: 'Culture & Événements',
    couleur: 'bg-violet-50 text-violet-700',
    sousCategories: [
      'Concerts & festivals de musique',
      "Expositions & art (Dak'Art, galeries)",
      'Théâtre & cinéma',
      'Sport (lutte, football, basket)',
      'Événements traditionnels et religieux',
    ],
  },
];

/** Transforme 250000 en « 250 000 FCFA ». */
export function formaterFcfa(montant) {
  if (montant === null || montant === undefined) return '—';
  return `${new Intl.NumberFormat('fr-FR').format(montant)} FCFA`;
}
