# Module Transport — Binta Comé

Branche de travail : **`feature/transport-binta`**

Bonjour Binta 👋 — tout ce qui suit se passe sur **ta** branche.
Tu ne touches à rien d'autre : le reste du site est déjà fait.

---

## 0. Démarrer le projet (à faire une fois)

1. Installer **Node.js** (https://nodejs.org) et **XAMPP** (https://www.apachefriends.org).
2. Récupérer le projet :

```bash
git clone https://github.com/cheikhbane09-maker/Unigo.git
cd Unigo
git checkout feature/transport-binta
npm install
copy server\.env.example server\.env
```

3. Ouvrir le **XAMPP Control Panel** → **Start** en face de **MySQL** (la ligne devient verte).
4. Lancer :

```bash
npm run dev
```

Le site s'ouvre sur http://localhost:5173 — crée ton compte sur **/inscription**,
sinon tu ne verras que la page d'accueil. Ta page est http://localhost:5173/transport.

> La base MySQL `unigo` et ses tables se créent toutes seules au premier démarrage.
> Le guide complet est dans **GUIDE_UNIGO_VSCODE.docx**.

---

## 1. Ce qui est déjà fait pour toi

| Élément | Emplacement | État |
|---|---|---|
| Table `transports` | `server/src/base.js` | ✅ créée automatiquement |
| Les 5 moyens de transport | `server/src/donnees.js` → `moyensTransport` | ✅ AFTU, DDD, BRT, car rapide, taxi |
| API | `server/src/routes/contenu.routes.js` → `GET /api/transport` | ✅ fonctionne |
| Page web | `client/src/pages/Transport.jsx` | ✅ affiche la liste |
| Ton fichier de travail | `server/src/donnees-transport.js` | ✅ 2 trajets d'exemple |

## 2. Ce qu'il te reste à faire

### a) Contenu (commence par ça)

Ouvre **`server/src/donnees-transport.js`** et ajoute les trajets fréquents :
AIBD ↔ campus, gare routière ↔ université, Dakar ↔ Saint-Louis…
Pour chacun : départ, arrivée, durée, prix mini/maxi, conseil.

Tu peux aussi compléter les moyens de transport existants dans
`server/src/donnees.js` (tableau `moyensTransport`) : horaires, zones couvertes,
conseils de sécurité.

> Après avoir modifié un fichier de données : supprime la base `unigo` dans
> phpMyAdmin (http://localhost/phpmyadmin → onglet **Opérations** → *Supprimer la base*)
> et relance `npm run dev`. Elle est recréée avec ton nouveau contenu.

### b) Brancher tes trajets à la base et à l'API

Ton fichier `donnees-transport.js` n'est encore relié à rien. 4 étapes, dans l'ordre :

**1.** Dans `server/src/base.js`, ajoute la table (à côté des autres `CREATE TABLE`) :

```js
await pool.query(`
  CREATE TABLE IF NOT EXISTS trajets (
    id         VARCHAR(60) PRIMARY KEY,
    depart     VARCHAR(120),
    arrivee    VARCHAR(120),
    distanceKm INT,
    duree      VARCHAR(60),
    prixMin    INT,
    prixMax    INT,
    moyens     TEXT,
    conseil    TEXT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`);
```

**2.** Toujours dans `base.js`, en haut : `import { trajets } from './donnees-transport.js';`
puis dans `remplirSiVide()`, à la suite des transports :

```js
for (const t of trajets) {
  await pool.query(
    `INSERT INTO trajets (id, depart, arrivee, distanceKm, duree, prixMin, prixMax, moyens, conseil)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [t.id, t.depart, t.arrivee, t.distanceKm, t.duree, t.prixMin, t.prixMax,
     JSON.stringify(t.moyens), t.conseil]
  );
}
```

(`JSON.stringify` parce qu'un tableau ne rentre pas tel quel dans une colonne.)

**3.** Dans `server/src/routes/contenu.routes.js`, copie la route `/transport` et adapte :

```js
router.get('/trajets', exigeConnexion, async (_req, res) => {
  try {
    const [lignes] = await pool.query('SELECT * FROM trajets ORDER BY prixMin');
    res.json({ data: lignes.map((l) => ({ ...l, moyens: JSON.parse(l.moyens || '[]') })) });
  } catch (erreur) {
    console.error('Erreur trajets :', erreur);
    res.status(500).json({ error: 'Impossible de charger les trajets.' });
  }
});
```

**4.** Supprime la base dans phpMyAdmin, relance `npm run dev`, et teste :
http://localhost:4000/api/trajets (il dira « Connexion requise » — c'est normal, c'est protégé).

### c) Front-end — `client/src/pages/Transport.jsx`

- [ ] Afficher tes trajets sous la liste des moyens de transport :

```jsx
import { useApi } from '../lib/useApi.js';

const { donnees: trajets, erreur, chargement } = useApi('/trajets');
```

  (`useApi` gère tout seul l'attente, l'erreur et le jeton de connexion.)
- [ ] Une barre de filtres : par moyen de transport, ou par prix maximum.
- [ ] Un tableau comparatif « combien ça coûte pour aller de X à Y ».

### d) Pour aller plus loin
- [ ] Page de détail d'un trajet (`/transport/:id`) — la route s'ajoute dans `client/src/App.jsx`.
- [ ] Annuaire des applis VTC (Yango, Heetch) avec leurs liens.
- [ ] Carte interactive des lignes de bus.

## 3. Rappel des commandes Git

```bash
git checkout feature/transport-binta   # se placer sur ta branche
git merge main                         # récupérer les nouveautés de l'équipe
npm run dev                            # lancer le site (MySQL démarré !)

git add .
git commit -m "feat(transport): ajout des trajets fréquents"
git push origin feature/transport-binta
```

**Le réflexe quand ça ne marche pas :** le vrai message d'erreur est dans le
**terminal**, pas dans le navigateur. Lis-le, il dit presque toujours quoi faire.
