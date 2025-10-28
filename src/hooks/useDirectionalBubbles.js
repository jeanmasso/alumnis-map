import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  getVisibleAlumni, 
  calculateDirectionalCounts, 
  getAlumniByDirection,
  getOptimalNavigationTarget,
  shouldShowBubbles
} from '../utils/geoBounds';

/**
 * Hook pour gérer la logique des bulles directionnelles
 * @param {Object} mapInstance - Instance de la carte Leaflet
 * @param {Array} allAlumni - Tous les alumni
 * @param {number} currentZoom - Niveau de zoom actuel
 * @param {Object} options - Options de configuration
 * @returns {Object} État et fonctions des bulles directionnelles
 */
export const useDirectionalBubbles = (mapInstance, allAlumni, currentZoom, options = {}) => {
  const {
    minZoom = 3,
    disabled = false,
    debounceMs = 300,
    displayDelayMs = 2000 // Délai de 2 secondes avant affichage
  } = options;

  // États locaux
  const [bubbleData, setBubbleData] = useState({
    counts: { north: 0, south: 0, east: 0, west: 0 },
    alumni: { north: [], south: [], east: [], west: [] },
    isActive: false
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [shouldDisplayBubbles, setShouldDisplayBubbles] = useState(false);

  // Refs pour les timeouts
  const displayTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);
  const calculateBubbleDataRef = useRef(null);
  const handleUserActivityRef = useRef(null);
  const displayDelayRef = useRef(displayDelayMs);

  // Fonction utilitaire pour vérifier la validité de l'instance de carte
  const isMapInstanceReady = useCallback((instance) => {
    return instance && 
           instance.getBounds && 
           instance._loaded && 
           instance.on && 
           instance.off;
  }, []);

  // Fonction de calcul des données directionnelles
  const calculateBubbleData = useCallback(() => {
    if (!mapInstance || !allAlumni || allAlumni.length === 0 || disabled) {
      setBubbleData({
        counts: { north: 0, south: 0, east: 0, west: 0 },
        alumni: { north: [], south: [], east: [], west: [] },
        isActive: false
      });
      return;
    }

    // Vérifier que l'instance de carte est complètement initialisée
    if (!isMapInstanceReady(mapInstance)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Instance de carte non initialisée, calcul reporté');
      }
      return;
    }

    try {
      setIsUpdating(true);

      // Obtenir les bounds actuels de la carte avec vérification
      let bounds;
      try {
        bounds = mapInstance.getBounds();
        if (!bounds || !bounds.isValid || !bounds.isValid()) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Bounds de carte invalides, calcul reporté');
          }
          return;
        }
      } catch (boundsError) {
        console.warn('Erreur lors de l\'obtention des bounds:', boundsError);
        return;
      }
      
      // Calculer les alumni visibles et cachés
      const visibleAlumni = getVisibleAlumni(bounds, allAlumni);
      const hiddenAlumni = allAlumni.filter(alumni => 
        !visibleAlumni.some(visible => visible.id === alumni.id)
      );

      // Calculer les compteurs et alumni par direction
      const directionalCounts = calculateDirectionalCounts(bounds, hiddenAlumni);
      const directionalAlumni = getAlumniByDirection(bounds, hiddenAlumni);

      // Vérifier si les bulles doivent être actives
      const isActive = shouldShowBubbles(currentZoom, directionalCounts, minZoom);

      setBubbleData({
        counts: directionalCounts,
        alumni: directionalAlumni,
        isActive: isActive
      });

      // Gérer l'affichage avec délai
      if (isActive && Object.values(directionalCounts).some(count => count > 0)) {
        // Annuler le timeout précédent s'il existe
        if (displayTimeoutRef.current) {
          clearTimeout(displayTimeoutRef.current);
        }
        
        // Réinitialiser l'affichage
        setShouldDisplayBubbles(false);
        
        // Programmer l'affichage après le délai
        displayTimeoutRef.current = setTimeout(() => {
          setShouldDisplayBubbles(true);
        }, displayDelayMs);
      } else {
        setShouldDisplayBubbles(false);
      }

    } catch (error) {
      console.warn('Erreur lors du calcul des bulles directionnelles:', error);
      setBubbleData({
        counts: { north: 0, south: 0, east: 0, west: 0 },
        alumni: { north: [], south: [], east: [], west: [] },
        isActive: false
      });
      setShouldDisplayBubbles(false);
    } finally {
      setIsUpdating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, allAlumni, currentZoom, disabled, minZoom]); // Retirer displayDelayMs

  // Fonction pour gérer l'activité utilisateur
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleUserActivity = useCallback(() => {
    // Masquer immédiatement les bulles lors d'activité
    setShouldDisplayBubbles(false);
    
    // Annuler les timeouts en cours
    if (displayTimeoutRef.current) {
      clearTimeout(displayTimeoutRef.current);
      displayTimeoutRef.current = null;
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }
    
    // Programmer un nouveau délai d'affichage
    activityTimeoutRef.current = setTimeout(() => {
      // Recalculer et afficher si nécessaire - utiliser une fonction de mise à jour
      setBubbleData(currentBubbleData => {
        if (currentBubbleData.isActive && Object.values(currentBubbleData.counts).some(count => count > 0)) {
          setShouldDisplayBubbles(true);
        }
        return currentBubbleData; // Pas de changement des données
      });
    }, displayDelayRef.current);
  }, []); // Pas de dépendances car nous utilisons des refs

  // Mettre à jour les refs à chaque render
  calculateBubbleDataRef.current = calculateBubbleData;
  handleUserActivityRef.current = handleUserActivity;
  displayDelayRef.current = displayDelayMs;

  // Debounce de la fonction de calcul pour éviter les calculs excessifs
  const debouncedCalculate = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (calculateBubbleDataRef.current) {
          calculateBubbleDataRef.current();
        }
      }, debounceMs);
    };
  }, [debounceMs]);

  // Fonction de navigation vers une direction
  const navigateToDirection = useCallback((direction) => {
    if (!mapInstance || !bubbleData.alumni[direction] || bubbleData.alumni[direction].length === 0) {
      console.warn(`Aucun alumni trouvé en direction ${direction}`);
      return false;
    }

    try {
      const target = getOptimalNavigationTarget(direction, bubbleData.alumni[direction]);
      
      if (target) {
        mapInstance.flyTo(target.center, target.zoom, {
          duration: 1.5,
          easeLinearity: 0.25
        });
        
        // Optionnel : Callback pour analytics/tracking
        if (options.onNavigate) {
          options.onNavigate(direction, target);
        }
        
        return true;
      }
    } catch (error) {
      console.error(`Erreur lors de la navigation vers ${direction}:`, error);
    }
    
    return false;
  }, [mapInstance, bubbleData.alumni, options]);

  // Effet pour initialiser et gérer les event listeners
  useEffect(() => {
    if (!mapInstance) {
      return;
    }

    // Vérifier que la carte est complètement initialisée
    if (!isMapInstanceReady(mapInstance)) {
      // Attendre que la carte soit initialisée
      const checkInitialization = () => {
        if (isMapInstanceReady(mapInstance)) {
          // Calcul initial une fois la carte prête
          if (calculateBubbleDataRef.current) {
            calculateBubbleDataRef.current();
          }
        } else {
          // Réessayer après un court délai
          setTimeout(checkInitialization, 100);
        }
      };
      checkInitialization();
    } else {
      // Calcul initial si la carte est déjà prête
      if (calculateBubbleDataRef.current) {
        calculateBubbleDataRef.current();
      }
    }

    // Event listeners pour les changements de carte
    const handleMapChange = () => {
      if (handleUserActivityRef.current) {
        handleUserActivityRef.current(); // Traiter comme activité utilisateur
      }
      debouncedCalculate();
    };

    // Ajouter les event listeners seulement si la carte est prête
    if (isMapInstanceReady(mapInstance)) {
      mapInstance.on('moveend', handleMapChange);
      mapInstance.on('zoomend', handleMapChange);
    }

    // Nettoyage
    return () => {
      if (mapInstance && mapInstance.off) {
        try {
          mapInstance.off('moveend', handleMapChange);
          mapInstance.off('zoomend', handleMapChange);
        } catch (error) {
          console.warn('Erreur lors du nettoyage des event listeners:', error);
        }
      }
      
      // Nettoyer les timeouts
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, debouncedCalculate]); // Simplifier les dépendances

  // Effet pour recalculer quand les données changent
  useEffect(() => {
    calculateBubbleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAlumni, currentZoom, disabled, calculateBubbleData]);

  // Fonction pour obtenir les informations d'une bulle spécifique
  const getBubbleInfo = useCallback((direction) => {
    const count = bubbleData.counts[direction] || 0;
    const alumniList = bubbleData.alumni[direction] || [];
    
    return {
      count,
      alumniList,
      hasAlumni: count > 0,
      countries: alumniList.reduce((acc, alumni) => {
        acc[alumni.country] = (acc[alumni.country] || 0) + 1;
        return acc;
      }, {})
    };
  }, [bubbleData]);

  // Fonction pour vérifier si une direction spécifique est active
  const isDirectionActive = useCallback((direction) => {
    return bubbleData.isActive && (bubbleData.counts[direction] || 0) > 0;
  }, [bubbleData]);

  return {
    // États
    bubbleData: bubbleData.counts,
    alumniByDirection: bubbleData.alumni,
    isActive: shouldDisplayBubbles && bubbleData.isActive,
    isUpdating,
    shouldShowBubbles: shouldDisplayBubbles,
    
    // Fonctions
    navigateToDirection,
    getBubbleInfo,
    isDirectionActive,
    handleUserActivity,
    
    // Utilitaires
    totalHiddenAlumni: Object.values(bubbleData.counts).reduce((sum, count) => sum + count, 0),
    hasAnyBubbles: Object.values(bubbleData.counts).some(count => count > 0)
  };
};