# Module Activités & Divertissement — Maguette Niang

Branche de travail : **`feature/activites-maguette`**

Bonjour Maguette 👋 — voici tout ce qui est déjà en place et ce qu'il te reste à faire.
Tu n'as pas besoin de toucher au reste du site : tout ce qui suit se trouve dans **3 fichiers**.

---

## 1. Ce qui est déjà fait pour toi

| Élément | Emplacement | État |
|---|---|---|
| Tables de la base | `server/prisma/schema.prisma` → modèles `Event`, `Venue`, `Community` | ✅ créées |
| Données de départ | `server/prisma/seed.js` → `events`, `venues`, `communities` | ✅ quelques exemples |
| API | `server/src/routes/activities.routes.js` | ✅ agenda, lieux, communautés, proposition d'événement |
| Page web | `client/src/pages/Activities.jsx` | ✅ affichage de base |
| Composant carte | `client/src/components/MapView.jsx` | ✅ prêt à l'emploi (OpenStreetMap) |

L'adresse de la page est **http://localhost:5173/activites**.

## 2. Ce qu'il te reste à faire

### a) Contenu (le plus important)
- [ ] Enrichir l'agenda : concerts, festivals (Dak'Art, Saint-Louis Jazz…), matchs, soirées étudiantes,
      journées d'intégration.
- [ ] Compléter l'annuaire des lieux : restaurants, plages, sites touristiques, salles de sport,
      cinémas, espaces de coworking — avec ville, description, fourchette de prix et coordonnées GPS.
- [ ] Créer des communautés par nationalité et par centre d'intérêt.

👉 Tout se saisit dans `server/prisma/seed.js` (tableaux `events`, `venues`, `communities`),
puis on relance `npm run seed`.

### b) API — `server/src/routes/activities.routes.js`
- [ ] Filtres agenda : catégorie, ville, période (`?from=`, `?to=`).
- [ ] Validation des entrées avec **zod** dans `POST /events` (copie le modèle de `auth.routes.js`).
- [ ] Routes de modération : lister les événements en attente, les approuver, les supprimer
      (copie le modèle de `testimonials.routes.js`, avec `requireRole('ADMIN')`).
- [ ] Recommandations personnalisées : filtrer les événements selon `req.user.interests`.

### c) Front-end — `client/src/pages/Activities.jsx`
- [ ] Onglets ou filtres : *Événements · Lieux · Communautés*.
- [ ] Filtres par catégorie et par ville.
- [ ] Page de détail d'un événement (`/activites/:slug`) — ajouter la route dans `client/src/App.jsx`.
- [ ] Formulaire « Proposer un événement » réservé aux utilisateurs connectés :

```jsx
import { post } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const { isAuthenticated } = useAuth();
await post('/activities/events', { title, description, city, startsAt, venue, category });
```

- [ ] Carte des lieux de loisirs avec `<MapView points={venues.map(v => ({ id: v.id, lat: v.latitude, lng: v.longitude, title: v.name }))} />`.
- [ ] Section « Recommandé pour vous » sur la page d'accueil du module.

### d) Traductions
- [ ] Ajouter tes textes dans `client/src/i18n/translations.js` (sections `fr` **et** `en`),
      puis les utiliser avec `t('ma.cle')` plutôt que d'écrire le texte en dur.

## 3. Rappel des commandes

```bash
git checkout feature/activites-maguette   # se placer sur ta branche
git pull origin main                      # récupérer les nouveautés de l'équipe
npm run dev                               # lancer le site

git add .
git commit -m "feat(activites): filtres de l'agenda par catégorie"
git push origin feature/activites-maguette
```

Le guide complet (installation, XAMPP, branches, commits, pull requests) est dans
**GUIDE_GIT_UNIGO.docx** à la racine du projet.
