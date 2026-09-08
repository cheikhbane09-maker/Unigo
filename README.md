# UNIGO — Plateforme web pour les étudiants étrangers au Sénégal

Projet développé d'après le cahier des charges *« Conception et développement d'une plateforme web
dédiée aux étudiants étrangers au Sénégal — Université · Transport · Activités & Divertissement »*.

**Stack :** React 18 + Vite + Tailwind CSS · Node.js + Express · JWT + bcrypt

| Membre | Module | Branche Git |
|---|---|---|
| Kaiju | Université (+ authentification, design) | `feature/universite-kaiju` |
| Binta Comé | Transport | `feature/transport-binta` |
| Maguette Niang | Activités & Divertissement | `feature/activites-maguette` |

---

## 1. Lancer le projet (2 commandes)

**Rien à installer d'autre que Node.js.** Pas de MySQL, pas de XAMPP, pas de base de données à créer.

```bash
npm install
npm run dev
```

C'est tout. Deux serveurs démarrent en même temps :

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

Dans **`server/donnees.json`**, un simple fichier créé automatiquement au premier démarrage.
Tu peux l'ouvrir dans VS Code pour voir ce qu'il contient.

- Pour **modifier le contenu du site** (universités, transports, activités) :
  édite **`server/src/donnees.js`**, supprime `server/donnees.json`, relance le serveur.
- Pour **repartir de zéro** (effacer tous les comptes) : supprime `server/donnees.json`.

> Attention aux deux noms qui se ressemblent :
> `server/src/donnees.js` = le contenu que **tu écris** · `server/donnees.json` = la base **générée**.

`donnees.json` n'est pas envoyé sur GitHub (il contient les comptes des utilisateurs).

> Un fichier JSON suffit largement pour ce projet. Pour un vrai site avec beaucoup de
> visiteurs, on passerait à MySQL ou PostgreSQL : seul `server/src/base.js` serait à
> réécrire, les routes ne changeraient pas d'une ligne.

---

## 3. Structure du projet

```
UNIGO/
├─ server/                      → l'API (Node.js + Express)
│  ├─ donnees.json              → la base de données (créée toute seule)
│  └─ src/
│     ├─ index.js               → point d'entrée, branche les routes
│     ├─ base.js                → lire / écrire donnees.json
│     ├─ auth.js                → jetons JWT et protection des routes
│     ├─ donnees.js            → LE CONTENU DU SITE (à modifier ici)
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
  une empreinte impossible à inverser. Ouvre `server/donnees.json` pour le vérifier.
- **Jeton JWT signé**, valable 7 jours. Le navigateur le range et le renvoie à chaque appel.
- **Double protection des pages** : React empêche d'afficher la page sans compte
  (`RouteProtegee.jsx`), et l'API refuse de renvoyer les données sans jeton
  (`exigeConnexion` dans `auth.js`). La deuxième est la vraie — on peut contourner React
  en tapant l'adresse de l'API à la main, jamais le contrôle du serveur.
- **Message de connexion volontairement vague** (« e-mail ou mot de passe incorrect ») :
  sinon un pirate pourrait deviner quelles adresses sont inscrites.
- **Vérification de toutes les données reçues** côté serveur : on ne fait jamais confiance
  à ce qui vient du navigateur.

> Avant une vraie mise en ligne : servir le site en HTTPS et remplacer la clé
> `JWT_SECRET` (dans `server/src/auth.js`) par une longue chaîne aléatoire
> rangée dans un fichier `.env`.

---

## 6. Comment lire le code

Tout est écrit sur le même modèle. Une fois qu'on a compris une route, on les comprend toutes.

**Une route de l'API :**

```js
router.get('/mon-adresse', exigeConnexion, (req, res) => {
  try {
    const donnees = lireBase().maListe;   // 1. on lit la base
    res.json({ data: donnees });          // 2. on renvoie du JSON
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: 'Message affiché à l\'utilisateur.' });
  }
});
```

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

## 7. Travail en équipe

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

## 8. Reste à faire

- **Transport (Binta)** : trajets fréquents (aéroport ↔ campus), filtres, carte interactive
- **Activités (Maguette)** : vrais lieux avec adresse et téléphone, agenda des événements
- **Commun** : favoris, avis sur les établissements, guide des démarches administratives,
  version anglaise, déploiement en ligne
- **Contenu** : confirmer par téléphone les contacts marqués ⚠ dans `CONTACTS_ETABLISSEMENTS.md`
