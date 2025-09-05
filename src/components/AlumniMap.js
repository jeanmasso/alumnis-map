import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import L from 'leaflet';
import AlumniCard from './AlumniCard';
import AlumniProfile from './AlumniProfile';
import AlumniFilters from './AlumniFilters';
import alumniService from '../services/alumniService';
import geoService from '../services/geoService';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AlumniMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [alumniData, setAlumniData] = useState([]);
  const [allAlumniData, setAllAlumniData] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(2);
  const [displayMode, setDisplayMode] = useState('country'); // 'country', 'region', 'pins', 'individual'

  // ===== DÉFINITIONS DES FONCTIONS =====
  
  // Gestion des filtres
  const handleFilterChange = useCallback((filters) => {
    // Appliquer les filtres sur toutes les données
    let filtered = allAlumniData;
    
    // Si on a des filtres actifs, les appliquer
    const hasActiveFilters = Object.values(filters).some(filter => filter !== '');
    if (hasActiveFilters) {
      // Temporairement mettre à jour le service avec les données à filtrer
      const originalData = alumniService.alumni;
      alumniService.alumni = filtered;
      filtered = alumniService.filterAlumni(filters);
      alumniService.alumni = originalData;
    }
    
    setAlumniData(filtered);
  }, [allAlumniData]);

  // Gestion de l'ouverture/fermeture du menu de filtres
  const toggleFiltersMenu = useCallback(() => {
    setIsFiltersOpen(prev => !prev);
  }, []);

  // Nettoyer tous les marqueurs
  const clearAllMarkers = () => {
    markersRef.current.forEach(marker => {
      if (marker.reactRoot) {
        setTimeout(() => {
          try {
            marker.reactRoot.unmount();
          } catch (error) {
            console.warn('Erreur lors du démontage du marqueur:', error);
          }
        }, 0);
      }
      mapInstance.current.removeLayer(marker);
    });
    markersRef.current = [];
  };

  // Affichage des compteurs par pays
  const displayCountryMarkers = () => {
    const countriesData = alumniService.getAlumniByCountry(alumniData);
    
    // Trier les pays par nombre d'alumni (croissant) pour afficher d'abord ceux avec moins d'alumni
    const sortedCountries = Object.values(countriesData).sort((a, b) => a.count - b.count);
    
    sortedCountries.forEach(countryGroup => {
      createCountryMarker(countryGroup);
    });
  };

  // Affichage des compteurs par région
  const displayRegionMarkers = () => {
    const regionsData = alumniService.getAlumniByRegion(alumniData);
    
    // Trier les régions par nombre d'alumni (croissant) pour afficher d'abord ceux avec moins d'alumni
    const sortedRegions = Object.values(regionsData).sort((a, b) => a.count - b.count);
    
    sortedRegions.forEach(regionGroup => {
      createRegionMarker(regionGroup);
    });
  };

  // Affichage des épingles Leaflet natives
  const displayPinMarkers = () => {
    // Grouper les alumni par position géographique
    const positionsData = {};
    
    alumniData.forEach(alumni => {
      const key = `${alumni.coordinates[0]},${alumni.coordinates[1]}`;
      if (!positionsData[key]) {
        positionsData[key] = {
          coordinates: alumni.coordinates,
          alumni: [],
          count: 0
        };
      }
      positionsData[key].alumni.push(alumni);
      positionsData[key].count++;
    });

    Object.values(positionsData).forEach(positionGroup => {
      createPinMarker(positionGroup);
    });
  };

  // Affichage des cartes individuelles
  const displayIndividualMarkers = () => {
    alumniData.forEach(alumni => {
      createIndividualMarker(alumni);
    });
  };

  // Créer un marqueur pays
  const createCountryMarker = (countryGroup) => {
    // Toujours afficher le marqueur de comptage, même pour 1 alumni
    const container = document.createElement('div');
    container.className = 'country-marker';
    const markerSize = geoService.getMarkerSize(countryGroup.count);
    
    // Calculer le z-index basé sur le nombre d'alumni (plus il y en a, plus le z-index est élevé)
    const zIndex = 1000 + countryGroup.count;
    
    // Intensité du dégradé basée sur le nombre d'alumni (plus intense pour plus d'alumni)
    const intensity = Math.min(countryGroup.count / 20, 1); // Normaliser entre 0 et 1
    const lightPurple = `rgba(155, 89, 182, ${0.7 + intensity * 0.3})`; // Plus intense = plus opaque
    const darkPurple = `rgba(106, 32, 140, ${0.8 + intensity * 0.2})`;
    
    container.style.cssText = `
      width: ${markerSize.width}px;
      height: ${markerSize.height}px;
      background: radial-gradient(circle at 30% 30%, ${lightPurple}, ${darkPurple});
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 
        0 4px 12px rgba(106, 32, 140, 0.4),
        inset 0 1px 3px rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: ${zIndex};
      position: relative;
    `;

    // Effet hover avec intensité violette
    container.addEventListener('mouseenter', () => {
      const hoverIntensity = Math.min(countryGroup.count / 20, 1);
      const hoverLightPurple = `rgba(155, 89, 182, ${0.9 + hoverIntensity * 0.1})`;
      const hoverDarkPurple = `rgba(106, 32, 140, ${1.0})`;
      
      container.style.transform = 'scale(1.2)';
      container.style.background = `radial-gradient(circle at 30% 30%, ${hoverLightPurple}, ${hoverDarkPurple})`;
      container.style.boxShadow = `
        0 6px 20px rgba(106, 32, 140, 0.6),
        inset 0 2px 4px rgba(255, 255, 255, 0.4)
      `;
    });

    container.addEventListener('mouseleave', () => {
      const intensity = Math.min(countryGroup.count / 20, 1);
      const lightPurple = `rgba(155, 89, 182, ${0.7 + intensity * 0.3})`;
      const darkPurple = `rgba(106, 32, 140, ${0.8 + intensity * 0.2})`;
      
      container.style.transform = 'scale(1)';
      container.style.background = `radial-gradient(circle at 30% 30%, ${lightPurple}, ${darkPurple})`;
      container.style.boxShadow = `
        0 4px 12px rgba(106, 32, 140, 0.4),
        inset 0 1px 3px rgba(255, 255, 255, 0.3)
      `;
    });

    const fontSize = Math.max(14, markerSize.width * 0.35); // Augmenté car plus d'espace disponible

    container.innerHTML = `
      <div style="font-size: ${fontSize}px; line-height: 1; font-weight: bold;">${countryGroup.count}</div>
    `;

    // Événement de clic pour zoomer vers le niveau région ou individuel
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      
      if (countryGroup.count === 1) {
        // Cas 1: Un seul alumni - zoomer directement au niveau individuel
        const alumni = countryGroup.alumni[0];
        mapInstance.current.setView(alumni.coordinates, 12);
      } else {
        // Cas 2: Plusieurs alumni - zoomer au niveau région (niveau 1)
        mapInstance.current.setView(countryGroup.coordinates, 6);
      }
      
      // Forcer le changement de mode après un délai
      setTimeout(() => {
        const currentZoom = mapInstance.current.getZoom();
        const newDisplayMode = geoService.getDisplayLevel(currentZoom);
        setDisplayMode(newDisplayMode);
        setCurrentZoom(currentZoom);
      }, 500);
    });

    const icon = L.divIcon({
      html: container,
      className: 'country-cluster-icon',
      iconSize: [geoService.getMarkerSize(countryGroup.count).width, geoService.getMarkerSize(countryGroup.count).height],
      iconAnchor: [geoService.getMarkerSize(countryGroup.count).width/2, geoService.getMarkerSize(countryGroup.count).height/2]
    });

    const marker = L.marker(countryGroup.coordinates, { 
      icon: icon,
      zIndexOffset: countryGroup.count * 100 // Offset basé sur le nombre d'alumni
    }).addTo(mapInstance.current);
    markersRef.current.push(marker);
  };

  // Créer un marqueur région
  const createRegionMarker = (regionGroup) => {
    const container = document.createElement('div');
    container.className = 'region-marker';
    const markerSize = geoService.getMarkerSize(regionGroup.count);
    
    // Calculer le z-index basé sur le nombre d'alumni
    const zIndex = 1000 + regionGroup.count;
    
    // Intensité du dégradé basée sur le nombre d'alumni (style similaire aux pays mais avec une teinte différente)
    const intensity = Math.min(regionGroup.count / 20, 1);
    const lightBlue = `rgba(52, 152, 219, ${0.7 + intensity * 0.3})`; // Bleu pour différencier des pays
    const darkBlue = `rgba(41, 128, 185, ${0.8 + intensity * 0.2})`;
    
    container.style.cssText = `
      width: ${markerSize.width}px;
      height: ${markerSize.height}px;
      background: radial-gradient(circle at 30% 30%, ${lightBlue}, ${darkBlue});
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 
        0 4px 12px rgba(41, 128, 185, 0.4),
        inset 0 1px 3px rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: ${zIndex};
      position: relative;
    `;

    // Effet hover avec intensité bleue
    container.addEventListener('mouseenter', () => {
      const hoverIntensity = Math.min(regionGroup.count / 20, 1);
      const hoverLightBlue = `rgba(52, 152, 219, ${0.9 + hoverIntensity * 0.1})`;
      const hoverDarkBlue = `rgba(41, 128, 185, 1.0)`;
      
      container.style.transform = 'scale(1.2)';
      container.style.background = `radial-gradient(circle at 30% 30%, ${hoverLightBlue}, ${hoverDarkBlue})`;
      container.style.boxShadow = `
        0 6px 20px rgba(41, 128, 185, 0.6),
        inset 0 2px 4px rgba(255, 255, 255, 0.4)
      `;
    });

    container.addEventListener('mouseleave', () => {
      const intensity = Math.min(regionGroup.count / 20, 1);
      const lightBlue = `rgba(52, 152, 219, ${0.7 + intensity * 0.3})`;
      const darkBlue = `rgba(41, 128, 185, ${0.8 + intensity * 0.2})`;
      
      container.style.transform = 'scale(1)';
      container.style.background = `radial-gradient(circle at 30% 30%, ${lightBlue}, ${darkBlue})`;
      container.style.boxShadow = `
        0 4px 12px rgba(41, 128, 185, 0.4),
        inset 0 1px 3px rgba(255, 255, 255, 0.3)
      `;
    });

    const fontSize = Math.max(14, markerSize.width * 0.35);

    container.innerHTML = `
      <div style="font-size: ${fontSize}px; line-height: 1; font-weight: bold;">${regionGroup.count}</div>
    `;

    // Événement de clic pour zoomer vers les épingles ou directement vers les cartes individuelles
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      
      if (regionGroup.count === 1) {
        // Cas 1: Un seul alumni - zoomer directement au niveau individuel
        const alumni = regionGroup.alumni[0];
        mapInstance.current.setView(alumni.coordinates, 12);
      } else {
        // Cas 2: Plusieurs alumni - zoomer au niveau épingles (niveau 8)
        mapInstance.current.setView(regionGroup.coordinates, 8);
      }
      
      // Forcer le changement de mode après un délai
      setTimeout(() => {
        const currentZoom = mapInstance.current.getZoom();
        const newDisplayMode = geoService.getDisplayLevel(currentZoom);
        setDisplayMode(newDisplayMode);
        setCurrentZoom(currentZoom);
      }, 500);
    });

    const icon = L.divIcon({
      html: container,
      className: 'region-cluster-icon',
      iconSize: [markerSize.width, markerSize.height],
      iconAnchor: [markerSize.width/2, markerSize.height/2]
    });

    const marker = L.marker(regionGroup.coordinates, { 
      icon: icon,
      zIndexOffset: regionGroup.count * 100
    }).addTo(mapInstance.current);
    markersRef.current.push(marker);
  };

    // Créer une épingle Leaflet native
  const createPinMarker = (positionGroup) => {
    const marker = L.marker(positionGroup.coordinates, {
      riseOnHover: true
    })
    .addTo(mapInstance.current);

    // Événement de clic pour zoomer vers les cartes individuelles
    marker.on('click', () => {
      mapInstance.current.setView(positionGroup.coordinates, 12);
    });

    markersRef.current.push(marker);
  };

  // Créer un marqueur individuel (carte alumni)
  const createIndividualMarker = (alumni) => {
    const cardContainer = document.createElement('div');
    cardContainer.style.width = '120px';
    cardContainer.style.height = '150px';
    
    if (cardContainer && document.body.contains !== false) {
      const root = ReactDOM.createRoot(cardContainer);
      
      try {
        root.render(
          <AlumniCard 
            alumni={alumni}
            onClick={handleAlumniCardClick}
            isSelected={selectedAlumni?.id === alumni.id}
          />
        );

        const customIcon = L.divIcon({
          html: cardContainer,
          className: 'alumni-marker',
          iconSize: [120, 150],
          iconAnchor: [60, 150],
          popupAnchor: [0, -150]
        });

        const marker = L.marker(alumni.coordinates, { 
          icon: customIcon,
          riseOnHover: true
        }).addTo(mapInstance.current);

        marker.alumni = alumni;
        marker.reactRoot = root;
        markersRef.current.push(marker);
      } catch (error) {
        console.warn('Erreur lors de la création du marqueur pour', alumni.firstname, alumni.name, ':', error);
      }
    }
  };

  const handleAlumniCardClick = (alumni) => {
    setSelectedAlumni(alumni);
    setIsPanelOpen(true);
  };

  // Fonction pour mettre à jour l'affichage selon le mode (pays/région/individuel)
  const updateMarkersDisplay = useCallback(() => {
    // Nettoyer les marqueurs existants
    clearAllMarkers();

    if (!mapInstance.current || alumniData.length === 0) return;

    // Toujours vérifier le zoom actuel pour déterminer le bon mode d'affichage
    const currentZoom = mapInstance.current.getZoom();
    const correctDisplayMode = geoService.getDisplayLevel(currentZoom);
    
    // Mettre à jour le displayMode si nécessaire
    if (correctDisplayMode !== displayMode) {
      setDisplayMode(correctDisplayMode);
    }

    switch (correctDisplayMode) {
      case 'country':
        displayCountryMarkers();
        break;
      case 'region':
        displayRegionMarkers();
        break;
      case 'pins':
        displayPinMarkers();
        break;
      case 'individual':
        displayIndividualMarkers();
        break;
      default:
        displayCountryMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMode, alumniData]); // Les fonctions display sont définies dans le même composant

  // ===== FIN DES DÉFINITIONS DES FONCTIONS =====

  // Chargement des données depuis le service
  useEffect(() => {
    const loadAlumniData = async () => {
      setIsLoading(true);
      try {
        const result = await alumniService.loadData();
        if (result.success) {
          setAllAlumniData(result.data);
          setAlumniData(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlumniData();
  }, []);

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // Initialisation de la carte et retrait du contrôle de zoom par défaut
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        minZoom: 2,  // Zoom minimum pour voir le monde entier sans duplicatas
        maxZoom: 18, // Zoom maximum
        maxBounds: [[-85, -180], [85, 180]], // Limites du monde entier (évite les pôles)
        maxBoundsViscosity: 1.0 // Empêche de sortir des limites
      }).setView([20, 0], 2); // Vue centrée sur le monde entier

      // Ajouter manuellement le contrôle avec une nouvelle position
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Ajouter un fond de carte OpenStreetMap avec limites
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: '© OpenStreetMap contributors',
        noWrap: true, // Empêche la répétition horizontale de la carte
        bounds: [[-85, -180], [85, 180]] // Limites géographiques du monde entier
      }).addTo(mapInstance.current);

      // Gestion des événements de zoom
      mapInstance.current.on('zoomend', () => {
        const zoom = mapInstance.current.getZoom();
        setCurrentZoom(zoom);
        const newDisplayMode = geoService.getDisplayLevel(zoom);
        setDisplayMode(newDisplayMode);
      });

      // Ajouter les marqueurs pour chaque alumni une fois les données chargées
      if (alumniData.length > 0) {
        updateMarkersDisplay();
      }
    }

    return () => {
      // Nettoyer les roots React des marqueurs de manière asynchrone
      markersRef.current.forEach(marker => {
        if (marker.reactRoot) {
          // Démonter de manière asynchrone pour éviter les race conditions
          setTimeout(() => {
            try {
              marker.reactRoot.unmount();
            } catch (error) {
              console.warn('Erreur lors du démontage du root React:', error);
            }
          }, 0);
        }
      });
      
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumniData]); // updateMarkersDisplay ne peut pas être ajouté car dépendance circulaire

  // useEffect pour mettre à jour l'affichage quand le mode change
  useEffect(() => {
    if (mapInstance.current && alumniData.length > 0) {
      updateMarkersDisplay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMode, alumniData]); // updateMarkersDisplay ne peut pas être ajouté car dépendance circulaire

  // useEffect pour gérer la fermeture du menu de filtres au clic sur la carte
  useEffect(() => {
    if (mapInstance.current) {
      const handleMapClick = () => {
        if (isFiltersOpen) {
          setIsFiltersOpen(false);
        }
      };

      mapInstance.current.on('click', handleMapClick);
      
      return () => {
        if (mapInstance.current) {
          mapInstance.current.off('click', handleMapClick);
        }
      };
    }
  }, [isFiltersOpen]);

  // useEffect séparé pour mettre à jour l'état des cartes quand selectedAlumni change
  useEffect(() => {
    // Utiliser requestAnimationFrame pour éviter les race conditions
    requestAnimationFrame(() => {
      markersRef.current.forEach(marker => {
        if (marker.reactRoot && marker.alumni) {
          try {
            // Recréer seulement le contenu React avec le nouvel état
            marker.reactRoot.render(
              <AlumniCard 
                alumni={marker.alumni}
                onClick={handleAlumniCardClick}
                isSelected={marker.alumni.id === (selectedAlumni?.id || null)}
              />
            );
          } catch (error) {
            console.warn('Erreur lors de la mise à jour du marqueur:', error);
          }
        }
      });
    });
  }, [selectedAlumni]);  // eslint-disable-line react-hooks/exhaustive-deps

  const returnToGlobalView = () => {
    // Retourner à la vue globale (zoom niveau 2)
    mapInstance.current.setView([20, 0], 2);
    
    // Forcer la mise à jour du mode après un délai
    setTimeout(() => {
      setCurrentZoom(2);
      setDisplayMode('country');
    }, 300);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedAlumni(null);
  };

  const handleContactAlumni = (alumni) => {
    // Ici vous pourrez ajouter la logique de contact
    // Par exemple : ouvrir un modal de contact, rediriger vers email, etc.
    alert(`Contacter ${alumni.firstname} ${alumni.name} à l'adresse : contact@example.com`);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {/* Indicateur de chargement */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: 'rgba(255,255,255,0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <p>Chargement des données alumni...</p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          background: '#f44336',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px'
        }}>
          Erreur: {error}
        </div>
      )}

      {/* Contrôles de navigation */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        {/* Bouton retour à la vue globale - masqué si déjà en vue globale */}
        {displayMode !== 'country' && (
          <button
            onClick={returnToGlobalView}
            style={{
              background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(107, 70, 193, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(107, 70, 193, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(107, 70, 193, 0.3)';
            }}
          >
            🌍 Vue globale
          </button>
        )}

        {/* Indicateur du mode d'affichage */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          border: '1px solid #ddd'
        }}>
          Mode: {
            displayMode === 'country' ? 'Pays' : 
            displayMode === 'region' ? 'Région' : 
            displayMode === 'pins' ? 'Épingles' : 
            'Cartes'
          } | 
          Zoom: {currentZoom} | 
          Alumni: {alumniData.length}
        </div>
      </div>
      
      {/* Panneau de filtres avec burger menu */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000
      }}>
        <AlumniFilters
          alumni={allAlumniData}
          onFilterChange={handleFilterChange}
          isOpen={isFiltersOpen}
          onToggle={toggleFiltersMenu}
        />
      </div>

      {/* Container de la carte */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Panneau de profil alumni */}
      <AlumniProfile
        alumni={selectedAlumni}
        isOpen={isPanelOpen}
        onClose={closePanel}
        onContactClick={handleContactAlumni}
      />
    </div>
  );
};

export default AlumniMap;
