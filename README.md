# UNIGO — Plateforme web pour les étudiants étrangers au Sénégal

Projet développé d'après le cahier des charges *« Conception et développement d'une plateforme web
dédiée aux étudiants étrangers au Sénégal — Université · Transport · Activités & Divertissement »*.

**Stack :** React 18 + Vite + Tailwind CSS · Node.js + Express · **MySQL (XAMPP)** · JWT + bcrypt

| Membre | Module | Branche Git |
|---|---|---|
| Kaiju | Université (+ authentification, design) | `feature/universite-kaiju` |
| Binta Comé | Transport | `feature/transport-binta` |
| Maguette Niang | Activités & Divertissement | `feature/activites-maguette` |

---

## 1. Lancer le projet

### Étape 1 — Démarrer MySQL dans XAMPP

Ouvre le **XAMPP Control Panel** et clique sur **Start** en face de **MySQL**.
La ligne doit devenir verte. (Apache n'est pas nécessaire.)

> C'est la seule étape à ne pas oublier. Sans MySQL démarré, le serveur affiche
> `✖ IMPOSSIBLE DE SE CONNECTER À MYSQL` et s'arrête.

### Étape 2 — Le fichier de réglages

Une seule fois, copie `server/.env.example` en `server/.env` :

```bash
copy server\.env.example server\.env
```

Les valeurs par défaut sont déjà celles de XAMPP (`root`, sans mot de passe, port 3306).

### Étape 3 — Lancer

```bash
npm install
npm run dev
```

**La base `unigo` et ses 4 tables sont créées automatiquement au premier démarrage**,
puis remplies avec le contenu de `server/src/donnees.js`. Rien à faire dans phpMyAdmin.

Deux serveurs démarrent en même temps :

| | Adresse | Rôle |
|---|---|---|
| Site | http://localhost:5173 | Le site React |
| API | http://localhost:4000 | Le serveur Express |

Pour vérifier que l'API répond : http://localhost:4000/api/sante

### Lancer un seul des deux

```bash
npm run dev:server   # seulement l'API (port 4000)
npm run dev:client   # seulement le site (port 5173)
```

### Premier compte

Il n'y a aucun compte au départ : va sur **/inscription** et crée le tien.
Le site est fermé — sans compte, on ne voit que la page d'accueil.

---

## 2. Où sont les données

Dans la base MySQL **`unigo`**, que tu peux ouvrir dans **phpMyAdmin** :
http://localhost/phpmyadmin

| Table | Contenu |
|---|---|
| `utilisateurs` | Les comptes (mot de passe **haché**, jamais en clair) |
| `universites` | Les 9 établissements |
| `transports` | Les 5 moyens de transport |
| `activites` | Les 4 familles d'activités |

- Pour **modifier le contenu du site** (universités, transports, activités) :
  édite **`server/src/donnees.js`**, puis supprime la base dans phpMyAdmin
  (onglet *Opérations* → *Supprimer la base*) et relance le serveur : elle est recréée.
- Pour **repartir de zéro** (effacer tous les comptes) : même chose.

> `server/src/donnees.js` = le contenu de départ que **tu écris**.
> Il ne sert qu'au premier remplissage : ensuite, c'est MySQL qui fait foi.

Le fichier `server/.env` (réglages de connexion) n'est **pas** envoyé sur GitHub.
C'est pour ça qu'il faut le recréer à partir de `.env.example` sur chaque machine.

---

## 3. Structure du projet

```
UNIGO/
├─ server/                      → l'API (Node.js + Express)
│  ├─ .env                      → réglages MySQL (à créer depuis .env.example)
│  ├─ .env.example              → le modèle, avec les réglages XAMPP
│  └─ src/
│     ├─ index.js               → point d'entrée, branche les routes
│     ├─ base.js                → connexion MySQL, création des tables
│     ├─ auth.js                → jetons JWT et protection des routes
│     ├─ donnees.js             → LE CONTENU DE DÉPART (à modifier ici)
│     └─ routes/
│        ├─ auth.routes.js      → inscription, connexion, mot de passe
│        └─ contenu.routes.js   → universités, transport, activités
│
└─ client/                      → le site (React)
   └─ src/
      ├─ App.jsx                → toutes les adresses du site
      ├─ context/AuthContext.jsx→ qui est connecté
      ├─ lib/api.js             → tous les appels à l'API
      ├─ lib/useApi.js          → charge des données (attente / erreur / succès)
      ├─ components/            → Navbar, Footer, RouteProtegee…
      └─ pages/                 → une page par écran
```

---

## 4. Les adresses de l'API

| Méthode | Adresse | Accès | Rôle |
|---|---|---|---|
| GET | `/api/sante` | public | Vérifier que l'API tourne |
| GET | `/api/statistiques` | public | Les 3 chiffres de la page d'accueil |
| POST | `/api/auth/inscription` | public | Créer un compte |
| POST | `/api/auth/connexion` | public | Se connecter |
| POST | `/api/auth/nouveau-mot-de-passe` | public | Changer son mot de passe |
| GET | `/api/auth/moi` | 🔒 connecté | Le profil de la personne connectée |
| GET | `/api/universites` | 🔒 connecté | L'annuaire (`?recherche=` et `?domaine=`) |
| GET | `/api/universites/:id` | 🔒 connecté | La fiche d'un établissement |
| GET | `/api/transport` | 🔒 connecté | Les moyens de transport |
| GET | `/api/activites` | 🔒 connecté | Les familles d'activités |

**Tester une adresse protégée dans le navigateur ne marchera pas** : il faut un jeton.
C'est normal, c'est justement le but. Le site, lui, l'envoie automatiquement.

---

## 5. La sécurité

- **Mots de passe hachés avec bcrypt.** Le mot de passe n'est jamais stocké : on garde
  une empreinte impossible à inverser. Ouvre la table `utilisateurs` dans phpMyAdmin
  pour le vérifier — la colonne `motDePasseHache` ressemble à `$2a$10$wFm.ce90…`.
- **Requêtes préparées** (les `?` dans le SQL) : c'est ce qui protège de l'**injection SQL**.
  On ne colle jamais une valeur venue du navigateur directement dans une requête.
- **Jeton JWT signé**, valable 7 jours. Le navigateur le range et le renvoie à chaque appel.
- **Double protection des pages** : React empêche d'afficher la page sans compte
  (`RouteProtegee.jsx`), et l'API refuse de renvoyer les données sans jeton
  (`exigeConnexion` dans `auth.js`). La deuxième est la vraie — on peut contourner React
  en tapant l'adresse de l'API à la main, jamais le contrôle du serveur.
- **Message de connexion volontairement vague** (« e-mail ou mot de passe incorrect ») :
  sinon un pirate pourrait deviner quelles adresses sont inscrites.
- **Vérification de toutes les données reçues** côté serveur : on ne fait jamais confiance
  à ce qui vient du navigateur.

> Avant une vraie mise en ligne : servir le site en HTTPS, remplacer `JWT_SECRET`
> dans `server/.env` par une longue chaîne aléatoire, et créer un utilisateur MySQL
> dédié avec un mot de passe (plutôt que `root` sans mot de passe, réservé au local).

---

## 6. Comment lire le code

Tout est écrit sur le même modèle. Une fois qu'on a compris une route, on les comprend toutes.

**Une route de l'API :**

```js
router.get('/mon-adresse', exigeConnexion, async (req, res) => {
  try {
    const [lignes] = await pool.query('SELECT * FROM ma_table WHERE id = ?', [req.params.id]);
    res.json({ data: lignes });           // on renvoie du JSON
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: 'Message affiché à l\'utilisateur.' });
  }
});
```

Trois choses à retenir : `async` + `await` (MySQL répond avec un petit délai),
le `?` (jamais de valeur collée dans le SQL), et le `try / catch`.

**Une page React qui charge des données :**

```jsx
const { donnees, erreur, chargement } = useApi('/transport');

if (chargement) return <Chargement />;
if (erreur) return <ErreurChargement message={erreur} />;

return <div>{donnees.map((x) => <p key={x.id}>{x.nom}</p>)}</div>;
```

Codes de réponse : **200** ok · **201** créé · **400** données invalides ·
**401** pas connecté · **404** introuvable · **409** existe déjà · **500** erreur serveur.

**Le réflexe de débogage :** quand quelque chose ne marche pas sur le site, le vrai message
d'erreur est dans le **terminal de l'API**, pas dans le navigateur.

---

## 7. Problèmes fréquents

| Message | Ce que ça veut dire | Solution |
|---|---|---|
| `✖ IMPOSSIBLE DE SE CONNECTER À MYSQL` + `ECONNREFUSED` | MySQL n'est pas démarré | XAMPP → **Start** en face de MySQL |
| `ER_ACCESS_DENIED_ERROR` | Mauvais identifiants | Vérifie `DB_USER` / `DB_PASSWORD` dans `server/.env` |
| `EADDRINUSE :::4000` | Un serveur tourne déjà | `npx kill-port 4000` |
| `Cannot find module 'mysql2'` | Dépendances pas installées | `npm install` à la racine |
| Le site dit « Le serveur ne répond pas » | L'API est arrêtée | Relance `npm run dev` |

---

## 8. Travail en équipe

Chacun travaille sur sa branche, puis ouvre une pull request vers `main`.
La marche à suivre complète est dans **GUIDE_UNIGO_VSCODE.docx**.

```bash
git checkout feature/transport-binta
# … modifications …
git add .
git commit -m "feat(transport): ajout des trajets fréquents"
git push
```

---

## 9. Reste à faire

- **Transport (Binta)** : trajets fréquents (aéroport ↔ campus), filtres, carte interactive
- **Activités (Maguette)** : vrais lieux avec adresse et téléphone, agenda des événements
- **Commun** : favoris, avis sur les établissements, guide des démarches administratives,
  version anglaise, déploiement en ligne
- **Contenu** : confirmer par téléphone les contacts marqués ⚠ dans `CONTACTS_ETABLISSEMENTS.md`
