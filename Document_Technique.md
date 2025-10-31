# 🧠 Documentation technique – Alumni Map

## 🔧 Structure fonctionnelle

| Module | Description | Dépendances |
|---------|--------------|-------------|
| **AlumniMap** | Composant principal. Initialise la carte Leaflet, gère les niveaux de zoom et les marqueurs. | leaflet, alumniService, geoService |
| **AlumniCard** | Carte individuelle d’un alumni (flip, affichage photo + infos). | React DOM |
| **AlumniProfile** | Panneau latéral de profil détaillé. | CSS dédié, React |
| **alumniService** | Service métier pour chargement, filtrage, regroupement et statistiques des données alumni. | JSON statique (public/data/) |
| **geoService** | Fonctions de clustering et d’analyse géographique (distance, niveau d’affichage, taille de marqueurs). | Leaflet |
| **App.js** | Point d’entrée React, monte la carte. | React |

---

## 🗺️ Niveaux d’affichage (logique zoom)

| Niveau | Zoom | Contenu affiché | Couleur dominante |
|--------|------|----------------|-------------------|
| 0 | 2–4 | Marqueurs de pays | Violet |
| 1 | 5–7 | Marqueurs de régions | Bleu |
| 2 | 8+ | Cartes individuelles | Image de profil |

---

## 🧮 Données

- **alumni.json** : tableau `alumni[]` contenant `id`, `firstname`, `name`, `company`, `position`, `graduationYear`, `coordinates`, `image`, etc.
- **countries.json** : dictionnaire `countries{}` avec `center`, `bounds`, `zoomLevel`.

La logique de lecture et regroupement se trouve dans `alumniService.loadData()` et `getAlumniByCountry()`.

---

## ⚙️ Gestion des marqueurs

- Les marqueurs sont créés à partir de **divIcons** Leaflet avec rendu React intégré (`ReactDOM.createRoot()`).
- Chaque zoom déclenche un `updateMarkersDisplay()` qui nettoie les anciens marqueurs puis redessine selon le niveau (`country`, `region`, `individual`).
- Les cartes individuelles sont interactives via `AlumniCard` (clic/hover → `AlumniProfile`).

---

## 🧭 Services clés

### alumniService

- Charge les fichiers JSON.
- Regroupe par pays, région, ville.
- Offre des méthodes de recherche et statistiques (`getStatistics()`).
- Donne accès à des listes uniques (entreprises, années, pays).

### geoService

- Traduit les zooms en niveaux d’affichage (`getDisplayLevel`).
- Calcule les distances Haversine pour le clustering.
- Génère tailles et couleurs de marqueurs (`getMarkerSize`, `getClusterColor`).

---

## 🧰 Maintenance et extension

- **Pas de backend** : la mise à jour des données passe par édition manuelle des JSON.
- **Front modulaire** : composants réutilisables, séparés par rôle.
- Pour ajouter une fonctionnalité (ex. filtre supplémentaire), agir dans `AlumniMap.js` (logique d’état) et étendre `alumniService`.
- **Build statique** : `npm run build` génère les fichiers pour Netlify.

---

_Fichier créé pour compléter le README du projet et documenter la structure interne de l’application._
