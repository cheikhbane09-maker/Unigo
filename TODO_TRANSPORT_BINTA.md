# Module Transport — Binta Comé

Branche de travail : **`feature/transport-binta`**

Bonjour Binta 👋 — voici tout ce qui est déjà en place et ce qu'il te reste à faire.
Tu n'as pas besoin de toucher au reste du site : tout ce qui suit se trouve dans **3 fichiers**.

---

## 1. Ce qui est déjà fait pour toi

| Élément | Emplacement | État |
|---|---|---|
| Tables de la base | `server/prisma/schema.prisma` → modèles `TransportOption` et `Route` | ✅ créées |
| Données de départ | `server/prisma/seed.js` → `transportOptions` et `routes` | ✅ 3 moyens + 2 trajets |
| API | `server/src/routes/transport.routes.js` | ✅ lecture (liste, trajets, détail) |
| Page web | `client/src/pages/Transport.jsx` | ✅ affichage de base |
| Composant carte | `client/src/components/MapView.jsx` | ✅ prêt à l'emploi (OpenStreetMap) |

L'adresse de la page est **http://localhost:5173/transport**.

## 2. Ce qu'il te reste à faire

### a) Contenu (le plus important)
- [ ] Compléter les moyens de transport : bus Dakar Dem Dikk / TATA, cars rapides, taxis, VTC
      (Yango, Heetch…), transport interurbain (gares routières, Sept-places).
- [ ] Renseigner pour chacun : tarifs indicatifs, horaires, zones de couverture, conseils de sécurité.
- [ ] Ajouter des trajets fréquents : AIBD ↔ campus, campus ↔ centre-ville, gare routière ↔ université,
      avec durée, prix et conseils.

👉 Tout se saisit dans `server/prisma/seed.js` (tableaux `transportOptions` et `routes`),
puis on relance `npm run seed`.

### b) API — `server/src/routes/transport.routes.js`
- [ ] Filtres par mode (`?mode=BUS`) et par ville / zone.
- [ ] Routes d'administration : `POST`, `PUT`, `DELETE` protégées par
      `requireAuth, requireRole('ADMIN')` (copie le modèle de `universities.routes.js`).
- [ ] Validation des entrées avec **zod** (copie le modèle de `auth.routes.js`).

### c) Front-end — `client/src/pages/Transport.jsx`
- [ ] Barre de filtres par mode de transport (boutons ou `<select>`).
- [ ] Page de détail d'un moyen de transport (`/transport/:slug`) — ajouter la route dans `client/src/App.jsx`.
- [ ] **Carte interactive** : le composant est déjà prêt, il suffit de l'utiliser :

```jsx
import MapView from '../components/MapView.jsx';

<MapView
  height={420}
  zoom={12}
  points={routes.map((r) => ({
    id: r.id,
    lat: r.fromLat,
    lng: r.fromLng,
    title: r.fromLabel,
    subtitle: `→ ${r.toLabel}`,
  }))}
/>
```

- [ ] Annuaire des prestataires (compagnies, applications VTC) avec liens utiles.

### d) Traductions
- [ ] Ajouter tes textes dans `client/src/i18n/translations.js` (sections `fr` **et** `en`),
      puis les utiliser avec `t('ma.cle')` plutôt que d'écrire le texte en dur.

## 3. Rappel des commandes

```bash
git checkout feature/transport-binta   # se placer sur ta branche
git pull origin main                   # récupérer les nouveautés de l'équipe
npm run dev                            # lancer le site

git add .
git commit -m "feat(transport): ajout des filtres par mode"
git push origin feature/transport-binta
```

Le guide complet (installation, XAMPP, branches, commits, pull requests) est dans
**GUIDE_GIT_UNIGO.docx** à la racine du projet.
