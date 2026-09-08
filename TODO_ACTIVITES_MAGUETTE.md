# Module Activités & Divertissement — Maguette Niang

Branche de travail : **`feature/activites-maguette`**

Bonjour Maguette 👋 — tout ce qui suit se passe sur **ta** branche.
Tu ne touches à rien d'autre : le reste du site est déjà fait.

---

## 0. Démarrer le projet (à faire une fois)

1. Installer **Node.js** (https://nodejs.org) et **XAMPP** (https://www.apachefriends.org).
2. Récupérer le projet :

```bash
git clone https://github.com/cheikhbane09-maker/Unigo.git
cd Unigo
git checkout feature/activites-maguette
npm install
copy server\.env.example server\.env
```

3. Ouvrir le **XAMPP Control Panel** → **Start** en face de **MySQL** (la ligne devient verte).
4. Lancer :

```bash
npm run dev
```

Le site s'ouvre sur http://localhost:5173 — crée ton compte sur **/inscription**,
sinon tu ne verras que la page d'accueil. Ta page est http://localhost:5173/activites.

> La base MySQL `unigo` et ses tables se créent toutes seules au premier démarrage.
> Le guide complet est dans **GUIDE_UNIGO_VSCODE.docx**.

---

## 1. Ce qui est déjà fait

| Élément | Emplacement | État |
|---|---|---|
| Table `activites` | `server/src/base.js` | ✅ les 4 familles |
| Table `lieux` | `server/src/base.js` | ✅ **68 lieux** |
| Le contenu que tu as rassemblé | `server/src/donnees-activites.js` | ✅ nom, téléphone, site, carte |
| API | `contenu.routes.js` → `GET /api/lieux` | ✅ filtre `?categorie=` et `?recherche=` |
| Page web | `client/src/pages/Activites.jsx` | ✅ fiches par sous-catégorie |

Sur http://localhost:5173/activites : 4 onglets, une barre de recherche, et pour
chaque lieu une fiche avec le **nom cliquable** (site officiel, sinon Google Maps),
le **téléphone cliquable** (`tel:`) et un badge **⚠** quand le numéro reste à confirmer.

Répartition actuelle : 18 restaurants · 10 plages & nature · 20 loisirs · 20 culture.

## 2. Ce qu'il te reste à faire

### a) Compléter les contacts (le plus utile)

**9 lieux** portent encore le badge ⚠ — la liste est dans `CONTACTS_ACTIVITES.md`.
Un coup de fil ou une recherche, et tu remplaces `telephone: ''` par le numéro
dans `server/src/donnees-activites.js`, puis tu passes `aVerifier` à `false`.

### b) Enrichir les fiches

Dans `server/src/donnees-activites.js`, ajoute à chaque lieu ce qui manque :
adresse précise, quartier, fourchette de prix, horaires, une phrase de description.

Pour qu'un nouveau champ s'affiche, il faut le déclarer à trois endroits — c'est
toujours la même mécanique, prends `ville` comme modèle :

1. le champ dans `server/src/donnees-activites.js`
2. la colonne dans `CREATE TABLE lieux` + le `INSERT` de `remplirLieux()` (`server/src/base.js`)
3. l'affichage dans la fiche de `client/src/pages/Activites.jsx`

> ⚠ Après **toute** modification d'un fichier de données : supprime la base `unigo`
> dans phpMyAdmin (http://localhost/phpmyadmin → onglet **Opérations** →
> *Supprimer la base*) et relance `npm run dev`. Sinon tu ne verras aucun changement :
> le remplissage ne se fait que sur une table vide.

### c) Pour aller plus loin

- [ ] Page de détail d'un lieu (`/activites/:id`) — la route s'ajoute dans `client/src/App.jsx`,
      copie le modèle de `DetailUniversite.jsx`.
- [ ] Agenda des événements avec les dates (Dak'Art, Festa2H, Saint-Louis Jazz…).
- [ ] Photos des lieux.
- [ ] Filtre par prix, ou par quartier.

## 3. Rappel des commandes Git

```bash
git checkout feature/activites-maguette   # se placer sur ta branche
git merge main                            # récupérer les nouveautés de l'équipe
npm run dev                               # lancer le site (MySQL démarré !)

git add .
git commit -m "feat(activites): fiches détaillées des restaurants"
git push origin feature/activites-maguette
```

**Le réflexe quand ça ne marche pas :** le vrai message d'erreur est dans le
**terminal**, pas dans le navigateur. Lis-le, il dit presque toujours quoi faire.
