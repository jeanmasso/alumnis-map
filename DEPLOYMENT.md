# Déploiement sur Netlify

## 📋 Pré-requis pour le déploiement

✅ **Script de build configuré** : `npm run build`  
✅ **Dossier de sortie** : `build/`  
✅ **Configuration Netlify** : `netlify.toml`  
✅ **Redirections SPA** : `_redirects`  

## 🚀 Instructions de déploiement

### Option 1: Déploiement via Git (Recommandé)

1. **Connecter votre repository à Netlify :**
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur "Add new site" → "Import an existing project"
   - Connectez votre compte GitHub/GitLab/Bitbucket
   - Sélectionnez ce repository

2. **Configuration automatique :**
   Netlify détectera automatiquement la configuration grâce au fichier `netlify.toml` :
   - **Build command** : `npm run build`
   - **Publish directory** : `build`
   - **Node version** : 18

### Option 2: Déploiement manuel (Drag & Drop)

1. **Construire le projet localement :**
   ```bash
   npm run build
   ```

2. **Déployer sur Netlify :**
   - Allez sur [netlify.com](https://netlify.com)
   - Glissez-déposez le dossier `build/` sur la zone de déploiement

## ⚙️ Configuration du projet

### Fichiers de configuration

- **`netlify.toml`** : Configuration principale Netlify
- **`public/_redirects`** : Redirections pour les routes SPA
- **`package.json`** : Scripts de build et homepage

### Structure après build
```
build/
├── index.html          # Point d'entrée principal
├── static/             # Assets CSS/JS optimisés
├── data/              # Données JSON des alumni
├── images/            # Images et assets
└── manifest.json      # Manifest PWA
```

## 🔧 Variables d'environnement (si nécessaire)

Si votre application utilise des variables d'environnement, ajoutez-les dans :
**Netlify Dashboard** → **Site Settings** → **Environment Variables**

## 📊 Optimisations incluses

- ✅ Cache des assets statiques (1 an)
- ✅ Cache des données JSON (1 heure)  
- ✅ Headers de sécurité
- ✅ Redirections SPA
- ✅ Compression GZIP automatique

## 🌐 URL de déploiement

Une fois déployé, votre site sera accessible à une URL du type :
`https://votre-site-name.netlify.app`

Vous pourrez configurer un domaine personnalisé dans les paramètres Netlify.
