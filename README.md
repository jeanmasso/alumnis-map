# 🗺️ Alumni Map - Carte Interactive des Diplômés de l'IUT NC

## 📋 Description du projet

**Alumni Map** est une application web interactive qui présente la géolocalisation des anciens étudiants de l'Institut Universitaire de Technologie de Nouvelle-Calédonie (IUT NC) des 10 dernières années. Cette carte permet de valoriser les parcours professionnels des diplômés et d'offrir une visualisation intuitive de leur répartition géographique mondiale.

## ✨ Fonctionnalités principales

### 🎯 Navigation Interactive
- **Système de zoom adaptatif** : 4 niveaux de zoom avec affichage dynamique (pays → régions → épingles → cartes individuelles)
- **Bulles directionnelles** : Indicateurs pour naviguer vers des alumni situés hors de la zone visible
- **Mode plein écran** : Interface immersive compatible PWA avec contrôle automatique de visibilité

### 👤 Profils Alumni
- **Cartes interactives** : Animation de retournement au survol avec informations détaillées
- **Profils détaillés** : Panneau latéral avec informations complètes (poste, entreprise, promotion)
- **Photos personnalisées** : System d'images avec fallback automatique

### 🔍 Système de filtres
- **Filtrage par promotion** : DUT-BUT MMI, GEA, LP CAN, etc.
- **Filtrage par année** : Années de graduation
- **Filtrage par localisation** : Pays et villes
- **Interface burger menu** : Design mobile-first responsive

### 🌍 Données géographiques
- **27 alumni** répartis dans 8 pays (Nouvelle-Calédonie, France, Vanuatu, etc.)
- **Clustering intelligent** : Regroupement automatique par zones géographiques
- **Géocodage précis** : Coordonnées GPS exactes pour chaque localisation

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/jeanmasso/alumnis-map.git
cd alumnis-map

# Installer les dépendances
npm install

# Lancer l'application en développement
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture du projet

```
src/
├── components/           # Composants React
│   ├── AlumniMap.js     # Composant principal de la carte
│   ├── AlumniCard.js    # Cartes des profils alumni
│   ├── AlumniProfile.js # Panneau de profil détaillé
│   ├── AlumniFilters.js # Système de filtres
│   └── DirectionalBubbles/ # Bulles de navigation
├── hooks/               # Hooks React personnalisés
│   └── useDirectionalBubbles.js # Logique des bulles directionnelles
├── services/            # Services et logique métier
│   ├── alumniService.js # Gestion des données alumni
│   └── geoService.js    # Services géographiques
├── utils/               # Utilitaires
│   └── geoBounds.js     # Calculs géographiques
└── assets/              # Ressources statiques
    └── images/alumni/   # Photos des alumni
```

### 📁 Données
```
public/data/
├── alumni.json         # Base de données des alumni (27 profils)
└── countries.json      # Référentiel géographique des pays
```

## 🛠️ Technologies utilisées

### Frontend
- **React 19.1.0** - Framework JavaScript
- **Leaflet 1.9.4** - Cartes interactives
- **React-Leaflet 5.0.0** - Intégration React/Leaflet

### Cartes et géolocalisation
- **OpenStreetMap** - Données cartographiques
- **Leaflet.markercluster** - Clustering de marqueurs
- **Système de coordonnées GPS** - Positionnement précis

### PWA et déploiement
- **Progressive Web App** - Capacités mobiles avancées
- **Netlify** - Hébergement et déploiement continu
- **Create React App** - Configuration et build

## 📱 Fonctionnalités PWA

- ✅ **Mode plein écran** automatique sur mobile
- ✅ **Installation en tant qu'app** native
- ✅ **Icons adaptatives** pour différentes plateformes
- ✅ **Optimisation performance** et cache

## 🎨 Interface utilisateur

### Design System
- **Couleurs principales** : Violet (#6B46C1) et Vert (#10B981)
- **Typographie** : Système de polices moderne et lisible
- **Animations** : Transitions fluides et micro-interactions
- **Responsive Design** : Optimisé mobile, tablette et desktop

### Interactions
- **Hover effects** : Élévation et changements de couleur
- **Cartes flippables** : Animation 3D au survol
- **Bulles tactiles** : Indication des zones hors-écran
- **Navigation intuitive** : Zoom et pan naturels

## 📊 Données des alumni

### Répartition géographique
- **Nouvelle-Calédonie** : 18 alumni (67%)
- **France** : 6 alumni (22%)
- **Vanuatu, La Réunion, Canada, Luxembourg** : 3 alumni (11%)

### Formations représentées
- **DUT-BUT GEA** : Gestion des Entreprises et Administrations
- **DUT-BUT MMI** : Métiers du Multimédia et Internet
- **LP CAN** : Licence Pro Communication et Numérique
- **LP spécialisées** : Contrôle de gestion, Révision comptable, etc.

## 🚀 Scripts disponibles

```bash
# Développement
npm start          # Lance le serveur de développement

# Production
npm run build      # Build optimisé pour la production
npm test           # Lance les tests
npm run eject      # Éjecte la configuration CRA (non recommandé)
```

## Contribution

Nous serions ravis que vous contribuiez à ce projet, même si vous débutez sur GitHub ! Voici un guide simple pour vous aider à démarrer :

1. **Créer un compte GitHub** (si ce n'est pas déjà fait)  
   Rendez-vous sur [GitHub](https://github.com/) et inscrivez-vous gratuitement.

2. **Forker le projet**  
   Cliquez sur le bouton "Fork" en haut à droite de la page du repository pour créer une copie du projet dans votre compte.

3. **Cloner le projet sur votre ordinateur**  
   Ouvrez un terminal et clonez votre fork avec la commande `git clone`, puis placez-vous dans le dossier du projet :  
   ```bash
   git clone https://github.com/<votre_nom_utilisateur>/alumnis-map.git  
   cd alumnis-map
   ```
   Remplacez `<votre_nom_utilisateur>` par votre nom d'utilisateur GitHub.*

4. **Créer une branche pour vos modifications**  
   Créez une nouvelle branche avec un nom représentatif de votre modification, par exemple `ajout-fonctionnalite` ou `correction-bug` :  
   ```bash
   git checkout -b ma-branche
   ```
   
5. **Faire des modifications**  
   Apportez vos modifications au code ou à la documentation avec l’éditeur de texte de votre choix.

6. **Enregistrer vos modifications**  
   Une fois vos changements effectués, enregistrez-les avec les commandes suivantes :  
   ```bash
   git add .
   git commit -m "Description des modifications"
   ```
   Remplacez `"Description des modifications"` par un message clair et précis.
   
7. **Envoyer vos modifications sur GitHub**  
   Poussez votre branche vers votre fork avec :  
   ```bash
   git push origin ma-branche
   ```

8. **Créer une pull request**  
   Rendez-vous sur la page GitHub de votre fork, cliquez sur **"Compare & pull request"**, ajoutez une description claire, puis cliquez sur **"Create pull request"** pour proposer vos modifications.

---

## 🌐 Déploiement

Le projet est configuré pour un déploiement automatique sur Netlify :

1. **Build automatique** : Déclenchement à chaque push sur master
2. **Optimisations** : Minification, compression et cache
3. **PWA ready** : Service workers et manifest configurés

## 📈 Roadmap

### Fonctionnalités prévues
- [ ] **Recherche textuelle** : Recherche par nom, entreprise, ville
- [ ] **Statistiques avancées** : Graphiques et données analytiques
- [ ] **Export de données** : PDF, CSV des profils
- [ ] **Mode sombre** : Thème alternatif
- [ ] **Internationalisation** : Support multilingue

### Améliorations techniques
- [ ] **Tests automatisés** : Couverture complète des composants
- [ ] **Performance** : Optimisation du chargement des images
- [ ] **Accessibilité** : Conformité WCAG 2.1
- [ ] **SEO** : Métadonnées et référencement

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

**Développement** : Jean Masso  
**Données** : IUT de Nouvelle-Calédonie  
**Design** : Interface moderne et responsive  

## 📞 Contact

- **Repository** : [https://github.com/jeanmasso/alumnis-map](https://github.com/jeanmasso/alumnis-map)
- **Issues** : [Signaler un problème](https://github.com/jeanmasso/alumnis-map/issues)
- **Démo live** : [Version déployée](https://votre-url-netlify.netlify.app) <!-- À remplacer par l'URL réelle -->

---

*Développé avec ❤️ pour valoriser les parcours des diplômés de l'IUT NC*

