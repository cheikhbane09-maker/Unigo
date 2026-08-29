/**
 * UNIGO — Jeu de données initial
 * ------------------------------------------------------------------
 * Lancer avec :  npm run seed -w server
 *
 * NOTE IMPORTANTE : les informations ci-dessous (frais de scolarité,
 * effectifs, conditions d'admission) sont des ORDRES DE GRANDEUR
 * indicatifs destinés à la démonstration. Elles devront être vérifiées
 * et confirmées auprès de chaque établissement avant la mise en ligne
 * (cf. section 7 du cahier des charges : « contrainte de contenu »).
 * Les témoignages sont fictifs et servent uniquement de démonstration.
 * ------------------------------------------------------------------
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const universities = [
  {
    slug: 'ucad',
    name: 'Université Cheikh Anta Diop de Dakar',
    acronym: 'UCAD',
    type: 'PUBLIQUE',
    city: 'Dakar',
    region: 'Dakar',
    address: 'Avenue Cheikh Anta Diop, BP 5005, Dakar-Fann',
    description:
      "La plus ancienne et la plus grande université du Sénégal, l'UCAD accueille des dizaines de milliers d'étudiants répartis dans une dizaine de facultés et instituts (médecine, droit, lettres, sciences, sciences économiques, polytechnique). Elle dispose d'un service dédié à l'accueil des étudiants étrangers et d'un campus social avec restaurants universitaires et résidences.",
    website: 'https://www.ucad.sn',
    email: 'contact@ucad.edu.sn',
    phone: '+221 33 825 05 30',
    latitude: 14.6805,
    longitude: -17.4632,
    foundedYear: 1957,
    studentCount: 90000,
    languages: 'Francais',
    admissionInfo:
      "Baccalauréat ou diplôme équivalent reconnu. Les étudiants étrangers déposent un dossier via la plateforme Campusen ou directement auprès du service de la scolarité, accompagné d'une attestation d'équivalence délivrée par la DEEC.",
    scholarships:
      "Bourses de coopération bilatérale, bourses du gouvernement sénégalais pour certains pays partenaires, aides sociales du COUD.",
    hasCampusHousing: true,
    programs: [
      { name: 'Licence en Informatique', field: 'Informatique', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 300000 },
      { name: 'Master en Génie Logiciel', field: 'Informatique', degree: 'MASTER', durationYears: 2, tuitionFcfa: 600000 },
      { name: 'Licence en Droit', field: 'Droit', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 250000 },
      { name: 'Doctorat en Médecine', field: 'Santé', degree: 'DOCTORAT', durationYears: 7, tuitionFcfa: 900000 },
      { name: 'Licence en Sciences Économiques', field: 'Économie & Gestion', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 250000 },
      { name: 'Master en Relations Internationales', field: 'Sciences Politiques', degree: 'MASTER', durationYears: 2, tuitionFcfa: 700000 },
    ],
  },
  {
    slug: 'ugb',
    name: 'Université Gaston Berger de Saint-Louis',
    acronym: 'UGB',
    type: 'PUBLIQUE',
    city: 'Saint-Louis',
    region: 'Saint-Louis',
    address: 'Route de Ngallèle, BP 234, Saint-Louis',
    description:
      "Située à Saint-Louis, l'UGB est réputée pour la qualité de son encadrement et son campus intégré où étudiants et enseignants vivent sur le même site. Elle propose des UFR en sciences appliquées, lettres, sciences juridiques et politiques, sciences économiques et agronomie.",
    website: 'https://www.ugb.sn',
    email: 'contact@ugb.edu.sn',
    phone: '+221 33 961 23 42',
    latitude: 16.0574,
    longitude: -16.4218,
    foundedYear: 1990,
    studentCount: 12000,
    languages: 'Francais',
    admissionInfo:
      "Sélection sur dossier. Les candidatures internationales sont examinées par la commission pédagogique de chaque UFR ; un niveau de français courant est requis.",
    scholarships: "Bourses d'excellence UGB, bourses de coopération, aides au logement sur le campus.",
    hasCampusHousing: true,
    programs: [
      { name: 'Licence en Mathématiques Appliquées', field: 'Sciences', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 280000 },
      { name: "Master en Sciences de l'Ingénieur", field: 'Ingénierie', degree: 'MASTER', durationYears: 2, tuitionFcfa: 650000 },
      { name: 'Licence en Anglais', field: 'Lettres & Langues', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 250000, language: 'Francais/Anglais' },
      { name: 'Master en Agroalimentaire', field: 'Agronomie', degree: 'MASTER', durationYears: 2, tuitionFcfa: 700000 },
    ],
  },
  {
    slug: 'uasz',
    name: 'Université Assane Seck de Ziguinchor',
    acronym: 'UASZ',
    type: 'PUBLIQUE',
    city: 'Ziguinchor',
    region: 'Ziguinchor',
    address: 'Route de Diabir, BP 523, Ziguinchor',
    description:
      "Université à taille humaine implantée en Casamance, l'UASZ met l'accent sur les sciences et technologies, l'environnement et les sciences sociales. Le coût de la vie y est nettement plus bas qu'à Dakar.",
    website: 'https://www.univ-zig.sn',
    email: 'contact@univ-zig.sn',
    phone: '+221 33 991 68 07',
    latitude: 12.5433,
    longitude: -16.2719,
    foundedYear: 2007,
    studentCount: 5000,
    languages: 'Francais',
    admissionInfo: "Admission sur dossier via Campusen ou candidature internationale directe.",
    hasCampusHousing: true,
    programs: [
      { name: 'Licence en Informatique', field: 'Informatique', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 250000 },
      { name: 'Licence en Agroforesterie', field: 'Agronomie', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 250000 },
      { name: 'Master en Environnement', field: 'Environnement', degree: 'MASTER', durationYears: 2, tuitionFcfa: 550000 },
    ],
  },
  {
    slug: 'univ-thies',
    name: 'Université Iba Der Thiam de Thiès',
    acronym: 'UIDT',
    type: 'PUBLIQUE',
    city: 'Thiès',
    region: 'Thiès',
    address: 'Cité Malick Sy, BP A 967, Thiès',
    description:
      "L'université de Thiès regroupe plusieurs UFR et écoles, dont l'École Polytechnique de Thiès (EPT), l'une des formations d'ingénieurs les plus sélectives d'Afrique de l'Ouest, ainsi qu'une UFR de santé et une UFR des sciences agronomiques.",
    website: 'https://www.univ-thies.sn',
    email: 'contact@univ-thies.sn',
    phone: '+221 33 951 11 92',
    latitude: 14.7886,
    longitude: -16.9246,
    foundedYear: 2007,
    studentCount: 14000,
    languages: 'Francais',
    admissionInfo: "Concours d'entrée pour l'EPT, sélection sur dossier pour les autres UFR.",
    hasCampusHousing: true,
    programs: [
      { name: 'Diplôme d\'Ingénieur Génie Civil', field: 'Ingénierie', degree: 'MASTER', durationYears: 5, tuitionFcfa: 800000 },
      { name: 'Licence en Sciences Infirmières', field: 'Santé', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 450000 },
      { name: 'Licence en Agronomie', field: 'Agronomie', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 280000 },
    ],
  },
  {
    slug: 'uadb',
    name: 'Université Alioune Diop de Bambey',
    acronym: 'UADB',
    type: 'PUBLIQUE',
    city: 'Bambey',
    region: 'Diourbel',
    address: 'BP 30, Bambey',
    description:
      "Université orientée vers les sciences de la santé communautaire, l'agriculture et les technologies de l'information, avec une pédagogie fortement tournée vers le terrain et le développement local.",
    website: 'https://www.uadb.edu.sn',
    email: 'contact@uadb.edu.sn',
    latitude: 14.6959,
    longitude: -16.4664,
    foundedYear: 2007,
    studentCount: 6000,
    languages: 'Francais',
    hasCampusHousing: true,
    programs: [
      { name: 'Licence en Santé Communautaire', field: 'Santé', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 260000 },
      { name: 'Licence en Réseaux et Télécoms', field: 'Informatique', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 280000 },
    ],
  },
  {
    slug: 'uam-diamniadio',
    name: 'Université Amadou Mahtar Mbow',
    acronym: 'UAM',
    type: 'PUBLIQUE',
    city: 'Diamniadio',
    region: 'Dakar',
    address: 'Pôle urbain de Diamniadio',
    description:
      "Université de nouvelle génération implantée dans le pôle urbain de Diamniadio, orientée vers les sciences, l'ingénierie, le numérique et l'innovation, avec des infrastructures récentes.",
    website: 'https://uam.sn',
    latitude: 14.7286,
    longitude: -17.1836,
    foundedYear: 2019,
    studentCount: 4000,
    languages: 'Francais',
    hasCampusHousing: true,
    programs: [
      { name: 'Licence en Génie Informatique', field: 'Informatique', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 300000 },
      { name: 'Master en Intelligence Artificielle', field: 'Informatique', degree: 'MASTER', durationYears: 2, tuitionFcfa: 750000 },
      { name: 'Licence en Génie Énergétique', field: 'Ingénierie', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 320000 },
    ],
  },
  {
    slug: 'ussein',
    name: 'Université du Sine Saloum El Hadji Ibrahima Niass',
    acronym: 'USSEIN',
    type: 'PUBLIQUE',
    city: 'Kaolack',
    region: 'Kaolack',
    description:
      "Université spécialisée dans l'agriculture, l'agroalimentaire, la santé et l'entrepreneuriat, répartie sur plusieurs sites du bassin arachidier.",
    website: 'https://ussein.sn',
    latitude: 14.1652,
    longitude: -16.0726,
    foundedYear: 2018,
    studentCount: 3500,
    languages: 'Francais',
    programs: [
      { name: 'Licence en Agrobusiness', field: 'Agronomie', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 250000 },
      { name: 'Licence en Nutrition', field: 'Santé', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 270000 },
    ],
  },
  {
    slug: 'uvs',
    name: 'Université Virtuelle du Sénégal',
    acronym: 'UVS',
    type: 'PUBLIQUE',
    city: 'Dakar',
    region: 'Dakar',
    description:
      "Université entièrement numérique s'appuyant sur un réseau d'Espaces Numériques Ouverts (ENO) répartis dans tout le pays. Une option intéressante pour les étudiants souhaitant suivre une formation à distance.",
    website: 'https://www.uvs.sn',
    latitude: 14.7167,
    longitude: -17.4677,
    foundedYear: 2013,
    studentCount: 40000,
    languages: 'Francais',
    admissionInfo: "Inscription en ligne ; un ordinateur et une connexion internet sont indispensables.",
    programs: [
      { name: 'Licence en Développement Web et Mobile', field: 'Informatique', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 200000 },
      { name: 'Licence en Management des Organisations', field: 'Économie & Gestion', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 200000 },
    ],
  },
  {
    slug: 'esmt',
    name: 'École Supérieure Multinationale des Télécommunications',
    acronym: 'ESMT',
    type: 'PRIVEE',
    city: 'Dakar',
    region: 'Dakar',
    address: 'Rue Parchappe x Salva, BP 10000, Dakar',
    description:
      "École multinationale de référence en télécommunications et numérique, créée par plusieurs États africains. Elle accueille une forte proportion d'étudiants étrangers venus de toute l'Afrique de l'Ouest et centrale.",
    website: 'https://www.esmt.sn',
    phone: '+221 33 869 03 00',
    latitude: 14.6688,
    longitude: -17.4322,
    foundedYear: 1981,
    studentCount: 1500,
    languages: 'Francais/Anglais',
    admissionInfo: "Concours et sélection sur dossier ; ouvert aux ressortissants des États membres et hors zone.",
    scholarships: "Bourses des États membres et bourses partenaires opérateurs télécoms.",
    programs: [
      { name: 'Licence en Réseaux et Télécommunications', field: 'Informatique', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 1800000 },
      { name: 'Master en Cybersécurité', field: 'Informatique', degree: 'MASTER', durationYears: 2, tuitionFcfa: 2500000, language: 'Francais/Anglais' },
      { name: 'Master en Data Science', field: 'Informatique', degree: 'MASTER', durationYears: 2, tuitionFcfa: 2500000 },
    ],
  },
  {
    slug: 'ism-dakar',
    name: 'Institut Supérieur de Management',
    acronym: 'ISM',
    type: 'PRIVEE',
    city: 'Dakar',
    region: 'Dakar',
    address: 'Route de Ouakam, Dakar',
    description:
      "Groupe d'enseignement supérieur privé parmi les plus importants d'Afrique francophone, avec des campus à Dakar et dans plusieurs pays. Formations en management, finance, marketing, communication et informatique, avec de nombreux doubles diplômes internationaux.",
    website: 'https://www.groupeism.sn',
    phone: '+221 33 869 68 68',
    latitude: 14.7167,
    longitude: -17.4833,
    foundedYear: 1992,
    studentCount: 8000,
    languages: 'Francais/Anglais',
    admissionInfo: "Admission sur dossier tout au long de l'année ; service dédié aux étudiants internationaux.",
    programs: [
      { name: 'Licence en Marketing', field: 'Économie & Gestion', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 1500000 },
      { name: 'MBA Management International', field: 'Économie & Gestion', degree: 'MASTER', durationYears: 2, tuitionFcfa: 3000000, language: 'Francais/Anglais' },
      { name: 'Licence en Informatique de Gestion', field: 'Informatique', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 1600000 },
    ],
  },
  {
    slug: 'ucao-uut',
    name: "Université Catholique de l'Afrique de l'Ouest — Unité Universitaire de Thiès",
    acronym: 'UCAO',
    type: 'PRIVEE',
    city: 'Thiès',
    region: 'Thiès',
    description:
      "Établissement privé confessionnel du réseau UCAO, présent dans plusieurs pays d'Afrique de l'Ouest. Formations en gestion, droit, santé et sciences de l'éducation, avec un encadrement rapproché.",
    website: 'https://ucao-uut.sn',
    latitude: 14.7833,
    longitude: -16.9333,
    foundedYear: 2003,
    studentCount: 2500,
    languages: 'Francais',
    programs: [
      { name: 'Licence en Gestion des Entreprises', field: 'Économie & Gestion', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 900000 },
      { name: 'Licence en Droit des Affaires', field: 'Droit', degree: 'LICENCE', durationYears: 3, tuitionFcfa: 850000 },
    ],
  },
  {
    slug: 'cesag',
    name: "Centre Africain d'Études Supérieures en Gestion",
    acronym: 'CESAG',
    type: 'PRIVEE',
    city: 'Dakar',
    region: 'Dakar',
    address: 'Boulevard du Général de Gaulle, BP 3802, Dakar',
    description:
      "École de management à vocation régionale rattachée à la BCEAO, le CESAG forme des cadres venus de toute l'Afrique en gestion, finance, audit, santé publique et management public. Public très majoritairement international.",
    website: 'https://www.cesag.sn',
    phone: '+221 33 839 08 22',
    latitude: 14.6708,
    longitude: -17.4381,
    foundedYear: 1985,
    studentCount: 2000,
    languages: 'Francais/Anglais',
    admissionInfo: "Concours et sélection sur dossier ; niveau licence requis pour les masters professionnels.",
    programs: [
      { name: 'Master en Audit et Contrôle de Gestion', field: 'Économie & Gestion', degree: 'MASTER', durationYears: 2, tuitionFcfa: 2800000 },
      { name: 'Master en Banque et Finance', field: 'Économie & Gestion', degree: 'MASTER', durationYears: 2, tuitionFcfa: 2800000 },
      { name: 'Master en Santé Publique', field: 'Santé', degree: 'MASTER', durationYears: 2, tuitionFcfa: 2600000 },
    ],
  },
];

const procedures = [
  {
    slug: 'visa-etudiant',
    title: "Obtenir un visa d'entrée pour études",
    category: 'Visa',
    summary:
      "Selon votre nationalité, un visa peut être exigé pour entrer au Sénégal. Les ressortissants de la CEDEAO en sont dispensés.",
    content:
      "1. Vérifiez si votre nationalité est soumise à visa auprès de l'ambassade ou du consulat du Sénégal de votre pays.\n2. Les ressortissants des pays membres de la CEDEAO entrent sans visa avec une pièce d'identité en cours de validité.\n3. Pour les autres nationalités, déposez la demande auprès de la représentation diplomatique sénégalaise compétente.\n4. Présentez l'attestation d'inscription ou de pré-inscription de votre établissement.\n5. Conservez une copie numérique de toutes les pièces déposées.",
    documents:
      "Passeport valable au moins 6 mois\nAttestation d'inscription ou de pré-inscription\nPhotos d'identité\nJustificatif de ressources ou attestation de prise en charge\nBillet aller-retour ou réservation\nJustificatif d'hébergement",
    estimatedDelay: '2 à 6 semaines selon le poste consulaire',
    officialLink: 'https://www.diplomatie.gouv.sn',
    orderIndex: 1,
  },
  {
    slug: 'carte-sejour',
    title: 'Demander une carte de séjour étudiant',
    category: 'Séjour',
    summary:
      "Après votre arrivée, la carte de séjour vous permet de résider légalement au Sénégal pendant la durée de vos études.",
    content:
      "1. Rendez-vous à la Direction de la Police des Étrangers et des Titres de Voyage (DPETV) à Dakar, ou au commissariat central de votre ville.\n2. Retirez et remplissez le formulaire de demande.\n3. Déposez le dossier complet et effectuez la prise d'empreintes.\n4. Récupérez le récépissé, qui fait office de justificatif en attendant la carte.\n5. Anticipez le renouvellement environ deux mois avant l'expiration.",
    documents:
      "Passeport + copie des pages d'identité et du visa\nCertificat de scolarité de l'année en cours\nExtrait de naissance ou copie légalisée\nCertificat de résidence\nPhotos d'identité\nCasier judiciaire selon les cas\nQuittance des frais de dossier",
    estimatedDelay: '3 à 8 semaines',
    orderIndex: 2,
  },
  {
    slug: 'equivalence-diplome',
    title: "Faire reconnaître l'équivalence de son diplôme",
    category: 'Équivalence',
    summary:
      "L'équivalence atteste que votre diplôme étranger correspond à un niveau reconnu au Sénégal. Elle est souvent exigée à l'inscription.",
    content:
      "1. Constituez un dossier avec vos diplômes et relevés de notes originaux, accompagnés de copies légalisées.\n2. Déposez-le auprès de la Direction des Examens, Concours et Certifications (DEEC) du ministère de l'Éducation, ou du service compétent du ministère de l'Enseignement supérieur pour l'enseignement supérieur.\n3. Faites traduire par un traducteur assermenté tout document rédigé dans une autre langue que le français.\n4. Suivez l'avancement du dossier et récupérez l'attestation d'équivalence.\n5. Fournissez cette attestation à l'établissement lors de l'inscription définitive.",
    documents:
      "Diplômes originaux + copies légalisées\nRelevés de notes de toutes les années\nProgramme des enseignements suivis\nTraduction assermentée si nécessaire\nPièce d'identité\nQuittance des frais",
    estimatedDelay: '1 à 3 mois',
    orderIndex: 3,
  },
  {
    slug: 'inscription-universite',
    title: "S'inscrire dans un établissement supérieur",
    category: 'Inscription',
    summary:
      "La procédure diffère selon que l'établissement est public (souvent via la plateforme Campusen) ou privé (candidature directe).",
    content:
      "1. Identifiez les établissements et filières qui correspondent à votre projet grâce à l'annuaire UNIGO.\n2. Pour le public : créez un compte sur la plateforme nationale d'orientation (Campusen) ou suivez la procédure de candidature internationale de l'établissement.\n3. Pour le privé : déposez un dossier directement auprès du service des admissions, souvent ouvert toute l'année.\n4. Réglez les frais de dossier puis, en cas d'admission, les frais d'inscription.\n5. Récupérez l'attestation d'inscription : elle est indispensable pour le visa et la carte de séjour.",
    documents:
      "Attestation d'équivalence du diplôme\nRelevés de notes\nActe de naissance\nCopie du passeport\nPhotos d'identité\nCV et lettre de motivation pour certaines formations",
    estimatedDelay: 'Variable — candidatures généralement de mai à septembre',
    officialLink: 'https://campusen.sn',
    orderIndex: 4,
  },
  {
    slug: 'inscription-consulaire',
    title: "S'inscrire au consulat de son pays",
    category: 'Séjour',
    summary:
      "L'inscription au registre consulaire de votre pays au Sénégal facilite les démarches et la protection consulaire.",
    content:
      "1. Repérez l'ambassade ou le consulat de votre pays à Dakar.\n2. Prenez rendez-vous ou présentez-vous aux horaires d'ouverture.\n3. Faites enregistrer votre présence en tant que résident étudiant.\n4. Conservez le numéro d'urgence du consulat.\n5. Signalez tout changement d'adresse.",
    documents: "Passeport\nJustificatif de domicile au Sénégal\nCertificat de scolarité\nPhotos d'identité",
    estimatedDelay: 'Quelques jours',
    orderIndex: 5,
  },
  {
    slug: 'ouvrir-compte-bancaire',
    title: 'Ouvrir un compte bancaire au Sénégal',
    category: 'Banque',
    summary:
      "Un compte local simplifie le paiement des frais de scolarité et du loyer. Les banques proposent des offres étudiantes.",
    content:
      "1. Comparez les offres « jeunes / étudiants » des banques présentes au Sénégal.\n2. Présentez-vous en agence avec les pièces demandées.\n3. Signez la convention de compte et effectuez le versement initial.\n4. Activez le service de banque mobile pour les virements courants.\n5. Pensez aussi aux solutions de mobile money, très utilisées au quotidien.",
    documents:
      "Passeport ou carte de séjour\nCertificat de scolarité\nJustificatif de domicile\nPhotos d'identité\nVersement initial selon la banque",
    estimatedDelay: '1 à 2 semaines',
    orderIndex: 6,
  },
  {
    slug: 'assurance-sante',
    title: 'Se couvrir sur le plan santé',
    category: 'Santé',
    summary:
      "Une couverture santé est fortement recommandée. Certaines universités proposent un service médical sur le campus.",
    content:
      "1. Vérifiez si votre établissement dispose d'un centre médical universitaire et de la cotisation associée.\n2. Souscrivez une mutuelle étudiante ou une assurance santé internationale.\n3. Vérifiez vos vaccinations avant le départ (dont fièvre jaune, exigée à l'entrée pour certaines provenances).\n4. Repérez le centre de santé et la pharmacie les plus proches de votre logement.\n5. Conservez une copie numérique de vos documents médicaux.",
    documents: "Carnet de vaccination\nAttestation d'assurance\nCertificat de scolarité",
    estimatedDelay: 'Avant ou dès l\'arrivée',
    orderIndex: 7,
  },
];

// Témoignages FICTIFS de démonstration — à remplacer par de vrais témoignages recueillis.
const testimonials = [
  {
    authorName: 'Aïcha (témoignage de démonstration)',
    country: 'Mali',
    year: 2025,
    content:
      "Je suis arrivée à Dakar sans connaître personne. Le plus difficile a été l'équivalence de mon diplôme : prévoyez au moins deux mois. Une fois inscrite, l'intégration a été rapide, notamment grâce aux associations d'étudiants étrangers du campus.",
    universitySlug: 'ucad',
  },
  {
    authorName: 'Jean-Marc (témoignage de démonstration)',
    country: 'Cameroun',
    year: 2024,
    content:
      "Le campus intégré de Saint-Louis change tout : logement, restaurant et salles de cours au même endroit. Le coût de la vie est bien plus bas qu'à Dakar, ce qui aide beaucoup quand on est boursier.",
    universitySlug: 'ugb',
  },
  {
    authorName: 'Fatou (témoignage de démonstration)',
    country: "Côte d'Ivoire",
    year: 2025,
    content:
      "Mon conseil : commencez les démarches de visa et de logement trois mois avant la rentrée, et ouvrez un compte mobile money dès votre arrivée, c'est ce qu'on utilise le plus au quotidien.",
    universitySlug: 'cesag',
  },
];

/* Données de démarrage pour les modules Transport (Binta) et Activités (Maguette) :
   quelques exemples pour que l'interface ne soit pas vide au premier lancement. */
const transportOptions = [
  {
    slug: 'brt-dakar',
    name: 'BRT (Bus Rapid Transit)',
    mode: 'BRT',
    description:
      "Bus à haut niveau de service reliant le centre de Dakar à la banlieue sur voie dédiée. Rapide et climatisé, il évite une grande partie des embouteillages.",
    coverageArea: 'Dakar — axe Guédiawaye / Petersen',
    priceMinFcfa: 400,
    priceMaxFcfa: 800,
    schedule: 'Environ 05h30 à 22h30, fréquence élevée aux heures de pointe',
    safetyTips: "Gardez vos affaires devant vous aux heures de pointe. Achetez votre carte de transport en station.",
    operator: 'Dakar Mobilité',
  },
  {
    slug: 'ter-dakar-aibd',
    name: 'TER — Train Express Régional',
    mode: 'TER',
    description:
      "Train reliant Dakar (gare de Dakar) à Diamniadio et à l'aéroport international Blaise Diagne. Solution confortable pour rejoindre le campus de Diamniadio.",
    coverageArea: 'Dakar ↔ Diamniadio ↔ AIBD',
    priceMinFcfa: 500,
    priceMaxFcfa: 2500,
    schedule: 'Départs réguliers en journée, renforcés aux heures de pointe',
    operator: 'SETER',
  },
  {
    slug: 'cars-rapides-tata',
    name: 'Bus urbains (Dakar Dem Dikk / TATA)',
    mode: 'BUS',
    description:
      "Réseau de bus urbains couvrant l'essentiel de l'agglomération dakaroise. Le moyen le plus économique pour les trajets quotidiens vers les campus.",
    coverageArea: 'Agglomération de Dakar',
    priceMinFcfa: 150,
    priceMaxFcfa: 300,
    safetyTips: "Aux heures de pointe, privilégiez les arrêts officiels et surveillez votre téléphone.",
  },
];

const routes = [
  {
    slug: 'aibd-ucad',
    fromLabel: 'Aéroport AIBD',
    toLabel: 'Campus UCAD (Dakar-Fann)',
    durationMin: 75,
    priceFcfa: 3000,
    advice:
      "TER jusqu'à la gare de Dakar puis bus ou taxi jusqu'au campus. En taxi direct, négociez le prix avant de monter.",
    optionSlug: 'ter-dakar-aibd',
  },
  {
    slug: 'guediawaye-centre-ville',
    fromLabel: 'Guédiawaye',
    toLabel: 'Centre-ville de Dakar (Petersen)',
    durationMin: 45,
    priceFcfa: 800,
    advice: 'Le BRT est la solution la plus rapide aux heures de pointe.',
    optionSlug: 'brt-dakar',
  },
];

const venues = [
  {
    slug: 'plage-ngor',
    name: 'Plage de Ngor',
    category: 'Plage',
    city: 'Dakar',
    description:
      "Plage populaire du nord de Dakar, avec des pirogues qui mènent à l'île de Ngor. Un classique des week-ends étudiants.",
    latitude: 14.7519,
    longitude: -17.5133,
    priceRange: 'Gratuit',
  },
  {
    slug: 'ile-de-goree',
    name: 'Île de Gorée',
    category: 'Site touristique',
    city: 'Dakar',
    description:
      "Île classée au patrimoine mondial de l'UNESCO, accessible en chaloupe depuis le port de Dakar. Maison des Esclaves, ruelles colorées et ambiance paisible.",
    latitude: 14.6674,
    longitude: -17.3985,
    priceRange: 'Chaloupe aller-retour, tarif réduit étudiant',
  },
  {
    slug: 'lac-rose',
    name: 'Lac Rose (Lac Retba)',
    category: 'Site touristique',
    city: 'Dakar',
    description:
      "Lac salé aux reflets roses selon la lumière et la saison, à une trentaine de kilomètres de Dakar. Sortie de groupe très prisée.",
    latitude: 14.8386,
    longitude: -17.2353,
  },
];

const communities = [
  {
    slug: 'etudiants-cedeao-dakar',
    name: 'Étudiants CEDEAO à Dakar',
    kind: 'Nationalité',
    description:
      "Groupe d'entraide entre étudiants ressortissants des pays de la CEDEAO installés à Dakar : logement, démarches, bons plans.",
  },
  {
    slug: 'club-tech-dakar',
    name: 'Club Tech & Numérique',
    kind: "Centre d'intérêt",
    description: "Rencontres, hackathons et entraide entre étudiants en informatique et en ingénierie.",
  },
];

const events = [
  {
    slug: 'journee-accueil-etudiants-internationaux',
    title: "Journée d'accueil des étudiants internationaux",
    category: 'ETUDIANT',
    description:
      "Journée d'information et de rencontre pour les nouveaux étudiants étrangers : démarches, logement, vie de campus, associations.",
    venue: 'Campus universitaire',
    city: 'Dakar',
    startsAt: new Date(new Date().getFullYear(), 9, 15, 9, 0),
    priceFcfa: 0,
    isApproved: true,
  },
  {
    slug: 'tournoi-inter-campus',
    title: 'Tournoi sportif inter-campus',
    category: 'SPORTIF',
    description: "Tournoi de football et de basket entre équipes des différents campus de la région.",
    city: 'Dakar',
    startsAt: new Date(new Date().getFullYear(), 10, 8, 15, 0),
    priceFcfa: 0,
    isApproved: true,
  },
];

async function main() {
  console.log('→ Nettoyage des tables...');
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.program.deleteMany();
  await prisma.university.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.route.deleteMany();
  await prisma.transportOption.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.community.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.user.deleteMany();

  console.log('→ Création des comptes de démonstration...');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@unigo.sn').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';

  const admin = await prisma.user.create({
    data: {
      fullName: 'Administrateur UNIGO',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
      countryOrigin: 'Sénégal',
    },
  });

  const student = await prisma.user.create({
    data: {
      fullName: 'Étudiant Démo',
      email: 'etudiant@unigo.sn',
      passwordHash: await bcrypt.hash('Etudiant1234!', 12),
      role: 'STUDENT',
      countryOrigin: 'Mali',
      targetCity: 'Dakar',
      studyField: 'Informatique',
    },
  });

  console.log('→ Import des universités et filières...');
  const slugToId = {};
  for (const { programs, ...uni } of universities) {
    const created = await prisma.university.create({ data: uni });
    slugToId[uni.slug] = created.id;
    for (const p of programs) {
      await prisma.program.create({ data: { ...p, universityId: created.id } });
    }
  }

  console.log('→ Import du guide des démarches...');
  for (const p of procedures) await prisma.procedure.create({ data: p });

  console.log('→ Import des témoignages de démonstration...');
  for (const { universitySlug, ...t } of testimonials) {
    await prisma.testimonial.create({
      data: { ...t, isApproved: true, universityId: slugToId[universitySlug] ?? null },
    });
  }

  console.log('→ Quelques avis de démonstration...');
  await prisma.review.createMany({
    data: [
      {
        userId: student.id,
        universityId: slugToId['ucad'],
        rating: 4,
        title: 'Un campus vivant',
        comment:
          "Beaucoup de filières et une vraie vie de campus. Les amphis sont chargés en première année, mais l'encadrement en master est bon.",
        isApproved: true,
      },
      {
        userId: admin.id,
        universityId: slugToId['ugb'],
        rating: 5,
        title: 'Excellent encadrement',
        comment:
          "Campus intégré, effectifs raisonnables et enseignants disponibles. Idéal pour se concentrer sur ses études.",
        isApproved: true,
      },
    ],
  });

  console.log('→ Données de démarrage Transport (module Binta)...');
  const optionSlugToId = {};
  for (const o of transportOptions) {
    const created = await prisma.transportOption.create({ data: o });
    optionSlugToId[o.slug] = created.id;
  }
  for (const { optionSlug, ...r } of routes) {
    await prisma.route.create({ data: { ...r, optionId: optionSlugToId[optionSlug] ?? null } });
  }

  console.log('→ Données de démarrage Activités (module Maguette)...');
  for (const v of venues) await prisma.venue.create({ data: v });
  for (const c of communities) await prisma.community.create({ data: c });
  for (const e of events) await prisma.event.create({ data: e });

  const counts = {
    universites: await prisma.university.count(),
    filieres: await prisma.program.count(),
    demarches: await prisma.procedure.count(),
    transports: await prisma.transportOption.count(),
    lieux: await prisma.venue.count(),
  };

  console.log('\n✔ Base initialisée avec succès :', counts);
  console.log('\n  Comptes de test');
  console.log(`  • Admin    : ${adminEmail} / ${adminPassword}`);
  console.log('  • Étudiant : etudiant@unigo.sn / Etudiant1234!\n');
}

main()
  .catch((e) => {
    console.error('✖ Erreur pendant le seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
