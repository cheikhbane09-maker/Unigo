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

## 1. Ce qui est déjà fait pour toi

| Élément | Emplacement | État |
|---|---|---|
| Table `activites` | `server/src/base.js` | ✅ créée automatiquement |
| Les 4 familles + sous-catégories | `server/src/donnees.js` → `categoriesActivites` | ✅ ta liste est déjà saisie |
| API | `server/src/routes/contenu.routes.js` → `GET /api/activites` | ✅ fonctionne |
| Page web | `client/src/pages/Activites.jsx` | ✅ onglets par famille |
| Ton fichier de travail | `server/src/donnees-activites.js` | ✅ 3 lieux d'exemple |

## 2. Ce qu'il te reste à faire

### a) Contenu (commence par ça)

Aujourd'hui la page affiche des **noms de lieux dans du texte**.
L'objectif : de **vraies fiches** avec adresse, téléphone et prix.

Ouvre **`server/src/donnees-activites.js`** et ajoute tes lieux un par un
(en copiant un bloc existant) : restaurants, plages, parcs, salles de sport,
cinémas, lieux culturels.

> Après avoir modifié un fichier de données : supprime la base `unigo` dans
> phpMyAdmin (http://localhost/phpmyadmin → onglet **Opérations** → *Supprimer la base*)
> et relance `npm run dev`. Elle est recréée avec ton nouveau contenu.

### b) Brancher tes lieux à la base et à l'API

Ton fichier `donnees-activites.js` n'est encore relié à rien. 4 étapes, dans l'ordre :

**1.** Dans `server/src/base.js`, ajoute la table (à côté des autres `CREATE TABLE`) :

```js
await pool.query(`
  CREATE TABLE IF NOT EXISTS lieux (
    id          VARCHAR(60) PRIMARY KEY,
    nom         VARCHAR(120) NOT NULL,
    categorie   VARCHAR(60),
    quartier    VARCHAR(120),
    adresse     VARCHAR(255),
    telephone   VARCHAR(40),
    siteWeb     VARCHAR(255),
    prixMin     INT,
    prixMax     INT,
    description TEXT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`);
```

**2.** Toujours dans `base.js`, en haut : `import { lieux } from './donnees-activites.js';`
puis dans `remplirSiVide()`, à la suite des activités :

```js
for (const l of lieux) {
  await pool.query(
    `INSERT INTO lieux (id, nom, categorie, quartier, adresse, telephone, siteWeb, prixMin, prixMax, description)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [l.id, l.nom, l.categorie, l.quartier, l.adresse, l.telephone, l.siteWeb,
     l.prixMin, l.prixMax, l.description]
  );
}
```

**3.** Dans `server/src/routes/contenu.routes.js`, copie la route `/activites` et adapte.
Le `?categorie=` permettra de filtrer depuis la page :

```js
router.get('/lieux', exigeConnexion, async (req, res) => {
  try {
    let requete = 'SELECT * FROM lieux';
    const valeurs = [];
    if (req.query.categorie) {
      requete += ' WHERE categorie = ?';   // le « ? » : jamais de valeur collée dans le SQL
      valeurs.push(req.query.categorie);
    }
    const [lignes] = await pool.query(requete + ' ORDER BY nom', valeurs);
    res.json({ data: lignes });
  } catch (erreur) {
    console.error('Erreur lieux :', erreur);
    res.status(500).json({ error: 'Impossible de charger les lieux.' });
  }
});
```

**4.** Supprime la base dans phpMyAdmin, relance `npm run dev`, et teste :
http://localhost:4000/api/lieux (il dira « Connexion requise » — c'est normal, c'est protégé).

### c) Front-end — `client/src/pages/Activites.jsx`

- [ ] Afficher les lieux de la famille sélectionnée, en cartes :

```jsx
import { useApi } from '../lib/useApi.js';

const { donnees: lieux, erreur, chargement } = useApi(`/lieux?categorie=${familleActive}`);
```

  (`useApi` gère tout seul l'attente, l'erreur et le jeton de connexion.)
- [ ] Rendre le téléphone cliquable : `<a href={'tel:' + lieu.telephone}>` — voir
      `client/src/pages/DetailUniversite.jsx`, c'est déjà fait là-bas.
- [ ] Afficher la fourchette de prix avec `formaterFcfa()` (dans `client/src/lib/api.js`).
- [ ] Une barre de recherche par nom de lieu.

### d) Pour aller plus loin
- [ ] Page de détail d'un lieu (`/activites/:id`) — la route s'ajoute dans `client/src/App.jsx`.
- [ ] Agenda des événements (Dak'Art, Festa2H, Saint-Louis Jazz) avec les dates.
- [ ] Photos des lieux.

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
