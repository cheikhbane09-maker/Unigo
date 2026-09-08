# Module Université — Kaiju

Branche de travail : **`feature/universite-kaiju`**

C'est ma branche. J'y travaille sur l'annuaire des établissements,
l'authentification et le design général du site.

---

## 1. Ce qui est déjà fait

| Élément | Emplacement | État |
|---|---|---|
| Table `universites` | `server/src/base.js` | ✅ créée automatiquement |
| Contenu des 9 écoles | `server/src/donnees.js` → `universites` | ✅ avec site web et téléphone |
| API | `server/src/routes/contenu.routes.js` | ✅ liste, recherche, filtre, fiche |
| Page annuaire | `client/src/pages/Universites.jsx` | ✅ recherche + filtre par domaine |
| Page fiche | `client/src/pages/DetailUniversite.jsx` | ✅ contacts cliquables |
| Authentification | `server/src/routes/auth.routes.js` + `client/src/context/AuthContext.jsx` | ✅ inscription, connexion, mot de passe |

## 2. Ce qu'il me reste à faire

### a) Contenu
- [ ] Confirmer par téléphone les contacts marqués ⚠ (`aVerifier: true`) dans `CONTACTS_ETABLISSEMENTS.md`.
- [ ] Ajouter les frais de scolarité réels et les dates d'inscription de chaque école.
- [ ] Ajouter les universités publiques hors Dakar (UGB Saint-Louis, UASZ Ziguinchor, UADB Bambey).

### b) API
- [ ] Tri de l'annuaire par prix (`?tri=prix`).
- [ ] Route `GET /api/domaines` qui renvoie la liste des domaines, au lieu de la coder en dur côté React.

### c) Front-end
- [ ] Comparateur : cocher 2 ou 3 écoles et les afficher côte à côte.
- [ ] Favoris : bouton ⭐ sur chaque fiche, table `favoris` en base.
- [ ] Page profil : modifier son nom, son pays, son domaine.

### d) Qualité
- [ ] Message clair quand la recherche ne renvoie rien.
- [ ] Vérifier l'affichage sur téléphone (menu, tableaux).

## 3. Rappel des commandes

```bash
git checkout feature/universite-kaiju
git merge main                       # récupérer les nouveautés de l'équipe
npm run dev                          # (MySQL démarré dans XAMPP d'abord)

git add .
git commit -m "feat(universite): ajout du comparateur"
git push origin feature/universite-kaiju
```
