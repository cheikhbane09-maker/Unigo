# UNIGO — Plateforme web pour les étudiants étrangers au Sénégal

Projet développé d'après le cahier des charges *« Conception et développement d'une plateforme web
dédiée aux étudiants étrangers au Sénégal — Université · Transport · Activités & Divertissement »* (v1.0).

**Stack :** React 18 + Vite + Tailwind CSS · Node.js + Express · Prisma + MySQL (XAMPP) · JWT + bcrypt.

| Membre | Module | Branche Git |
|---|---|---|
| Kaiju | Université (+ authentification, base commune, design) | `feature/universite-kaiju` |
| Binta Comé | Transport | `feature/transport-binta` |
| Maguette Niang | Activités & Divertissement | `feature/activites-maguette` |

---

## 1. Prérequis

- **Node.js 18 ou plus** — https://nodejs.org (prendre la version LTS)
- **XAMPP** (pour MySQL et phpMyAdmin) — https://www.apachefriends.org
- **Git** — https://git-scm.com

Vérifier l'installation :

```bash
node -v
npm -v
git --version
```

## 2. Installation (5 minutes)

### a) Démarrer MySQL et créer la base

1. Ouvrir le **XAMPP Control Panel**.
2. Cliquer sur **Start** en face de **MySQL** (Apache n'est pas obligatoire, mais utile pour phpMyAdmin).
3. Ouvrir http://localhost/phpmyadmin
4. Onglet **Bases de données** → nom : `unigo` → interclassement `utf8mb4_general_ci` → **Créer**.

### b) Installer les dépendances

À la racine du projet :

```bash
npm install
```

### c) Configurer le serveur

Copier le fichier d'exemple puis l'adapter si besoin :

```bash
# Windows (PowerShell)
copy server\.env.example server\.env

# macOS / Linux
cp server/.env.example server/.env
```

Avec XAMPP par défaut (utilisateur `root`, mot de passe vide), la valeur fournie fonctionne telle quelle :

```
DATABASE_URL="mysql://root:@localhost:3306/unigo"
```

> Si votre MySQL a un mot de passe : `mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/unigo`

### d) Créer les tables et charger les données

```bash
npm run db:setup
```

Cette commande enchaîne trois étapes : `prisma generate` (client), `prisma db push` (création des
tables) et `seed` (12 universités, filières, guide des démarches, données de démarrage transport et
activités, comptes de test).

### e) Lancer le projet

```bash
npm run dev
```

- Front-end : http://localhost:5173
- API : http://localhost:4000/api/health

### Comptes de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | `admin@unigo.sn` | `Admin1234!` |
| Étudiant | `etudiant@unigo.sn` | `Etudiant1234!` |

---

## 3. Structure du projet

```
UNIGO/
├─ package.json              → scripts communs (npm run dev lance l'API + le front)
├─ server/                   → API REST (Node.js / Express / Prisma)
│  ├─ .env.example           → variables d'environnement à copier en .env
│  ├─ prisma/
│  │  ├─ schema.prisma       → modèle de données (toutes les tables)
│  │  └─ seed.js             → données de départ
│  └─ src/
│     ├─ index.js            → point d'entrée, sécurité, montage des routes
│     ├─ config/env.js       → lecture de la configuration
│     ├─ lib/                → client Prisma, envoi d'e-mails
│     ├─ middleware/         → authentification JWT, gestion des erreurs
│     └─ routes/
│        ├─ auth.routes.js          → inscription, login, mot de passe oublié
│        ├─ universities.routes.js  → module Université (Kaiju)
│        ├─ reviews / favorites / procedures / testimonials
│        ├─ transport.routes.js     → module Transport (Binta)
│        ├─ activities.routes.js    → module Activités (Maguette)
│        ├─ search.routes.js        → recherche globale multi-modules
│        └─ admin.routes.js         → back-office
└─ client/                   → front-end React
   └─ src/
      ├─ App.jsx             → toutes les routes de l'application
      ├─ components/         → Navbar, Footer, cartes, carte OSM, icônes…
      ├─ context/            → authentification, comparateur
      ├─ i18n/               → traductions FR / EN
      ├─ lib/api.js          → appels HTTP vers l'API
      └─ pages/              → une page par écran
```

## 4. Scripts disponibles

| Commande | Effet |
|---|---|
| `npm run dev` | Lance l'API et le front-end ensemble |
| `npm run dev:server` | Lance uniquement l'API (port 4000) |
| `npm run dev:client` | Lance uniquement le front-end (port 5173) |
| `npm run db:setup` | Génère le client Prisma, crée les tables et charge les données |
| `npm run seed` | Recharge uniquement les données de démonstration |
| `npm run build` | Construit la version de production du front-end |
| `npm run prisma:studio -w server` | Ouvre une interface visuelle sur la base de données |

## 5. Principales routes de l'API

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion (JWT) |
| POST | `/api/auth/forgot-password` | Envoi du lien de réinitialisation |
| POST | `/api/auth/reset-password` | Nouveau mot de passe |
| GET | `/api/auth/me` | Profil connecté |
| GET | `/api/universities` | Annuaire + filtres + pagination |
| GET | `/api/universities/filters` | Valeurs disponibles pour les filtres |
| GET | `/api/universities/compare?ids=` | Comparateur |
| GET | `/api/universities/:slug` | Fiche détaillée |
| POST | `/api/reviews` | Déposer un avis (modéré) |
| POST | `/api/favorites/toggle` | Ajouter / retirer un favori |
| GET | `/api/procedures` | Guide des démarches |
| GET | `/api/search?q=` | Recherche globale multi-modules |
| GET | `/api/transport` | Moyens de transport *(module Binta)* |
| GET | `/api/activities/events` | Agenda des événements *(module Maguette)* |
| GET | `/api/admin/stats` | Statistiques du back-office |

## 6. Sécurité mise en place

Conformément à la section 5 du cahier des charges :

- Mots de passe **hachés avec bcrypt** (coût 12), jamais stockés en clair.
- Sessions par **jeton JWT** signé, expiration configurable.
- Jetons de réinitialisation **à usage unique**, valables 30 minutes, stockés hachés (SHA-256).
- **Limitation des tentatives** de connexion (10 essais / 15 min) et des demandes de réinitialisation.
- En-têtes de sécurité **Helmet**, **CORS** restreint au front-end, corps de requête limité à 1 Mo.
- Validation systématique des entrées avec **Zod** (protection contre les données malformées).
- Requêtes SQL générées par **Prisma** (requêtes paramétrées → protection contre l'injection SQL).
- React échappe le contenu par défaut (protection XSS).

> En production : servir le site en **HTTPS**, remplacer `JWT_SECRET` par une valeur longue et
> aléatoire, et activer les sauvegardes automatiques de la base.

## 7. Travail en équipe

Chaque membre travaille sur sa branche puis ouvre une *pull request* vers `main`.
La marche à suivre détaillée se trouve dans **GUIDE_GIT_UNIGO.docx** (à la racine du projet).

```bash
git checkout main
git pull origin main
git checkout -b feature/mon-module
# … modifications …
git add .
git commit -m "feat(transport): ajout des filtres par mode"
git push origin feature/mon-module
```

## 8. Reste à faire

- **Transport (Binta)** : filtres par mode, fiches détaillées, carte interactive, annuaire des prestataires.
- **Activités (Maguette)** : filtres agenda, détail d'un événement, formulaire de proposition, recommandations.
- **Commun** : traduction anglaise des contenus de la base, messagerie/forum, notifications e-mail, déploiement.
- **Contenu** : vérifier et confirmer auprès des établissements toutes les données du seed
  (frais, effectifs, conditions d'admission), qui sont actuellement indicatives.
