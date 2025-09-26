#!/bin/bash

# Script de test local du build de production
echo "🚀 Test du build de production..."

# Build du projet
echo "📦 Construction du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi!"
    
    # Vérifier que les fichiers importants existent
    if [ -f "build/index.html" ] && [ -d "build/static" ] && [ -d "build/data" ]; then
        echo "✅ Structure du build correcte"
        
        # Proposer de servir localement
        echo "🌐 Voulez-vous tester localement ? (nécessite 'serve' : npm i -g serve)"
        echo "Commande: serve -s build -p 3001"
        
        # Afficher la taille du build
        echo "📊 Taille du dossier build:"
        du -sh build/
    else
        echo "❌ Structure du build incorrecte"
        exit 1
    fi
else
    echo "❌ Erreur lors du build"
    exit 1
fi
