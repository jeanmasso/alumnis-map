import React from 'react';
import { useDirectionalBubbles } from '../../hooks/useDirectionalBubbles';
import { formatBubbleTooltip } from '../../utils/geoBounds';
import './DirectionalBubbles.css';

/**
 * Composant DirectionalBubbles - Affiche des bulles indiquant la présence d'alumni 
 * dans les directions non visibles de la carte
 */
const DirectionalBubbles = ({ 
  mapInstance, 
  alumni, 
  currentZoom, 
  onNavigate,
  minZoom = 3,
  disabled = false,
  className = '',
  bubbleClassName = '',
  showTooltips = true 
}) => {
  // Utilisation du hook personnalisé pour la logique métier
  const {
    bubbleData,
    isActive,
    isUpdating,
    navigateToDirection,
    getBubbleInfo,
    isDirectionActive,
    handleUserActivity
  } = useDirectionalBubbles(mapInstance, alumni, currentZoom, {
    minZoom,
    disabled,
    onNavigate
  });

  // Ne pas afficher si non actif ou en cours de mise à jour
  if (!isActive || isUpdating) {
    return null;
  }

  // Les bulles ne sont plus cliquables - supprimé handleBubbleClick

  // Rendu d'une bulle individuelle
  const renderBubble = (direction) => {
    if (!isDirectionActive(direction)) {
      return null;
    }

    const bubbleInfo = getBubbleInfo(direction);
    const { count, alumniList } = bubbleInfo;
    
    const tooltipText = showTooltips ? formatBubbleTooltip(direction, count, alumniList) : '';

    return (
      <div
        key={direction}
        className={`
          directional-bubble 
          directional-bubble--${direction} 
          ${bubbleClassName}
        `.trim()}
        title={tooltipText}
        aria-label={`${count} alumni vers le ${direction === 'north' ? 'nord' : 
                                                direction === 'south' ? 'sud' : 
                                                direction === 'east' ? 'est' : 'ouest'}`}
      >
        <span className="bubble-count">{count}</span>
        
        {/* Indicateur de chargement optionnel */}
        {isUpdating && (
          <div className="bubble-loading" aria-hidden="true">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`directional-bubbles-container ${className}`.trim()}
      aria-label="Indicateurs d'alumni dans les directions non visibles"
    >
      {/* Bulles pour chaque direction */}
      {renderBubble('north')}
      {renderBubble('south')}
      {renderBubble('east')}
      {renderBubble('west')}
      
      {/* Debug info en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{ display: 'none' }}>
          <pre>{JSON.stringify(bubbleData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Définition des PropTypes pour une meilleure documentation
DirectionalBubbles.propTypes = {
  // Props requises
  mapInstance: (props, propName, componentName) => {
    if (!props[propName]) {
      return new Error(`La prop '${propName}' est requise dans '${componentName}'.`);
    }
    if (typeof props[propName] !== 'object' || !props[propName].getBounds) {
      return new Error(`La prop '${propName}' doit être une instance Leaflet Map valide.`);
    }
  },
  
  alumni: (props, propName, componentName) => {
    if (!props[propName]) {
      return new Error(`La prop '${propName}' est requise dans '${componentName}'.`);
    }
    if (!Array.isArray(props[propName])) {
      return new Error(`La prop '${propName}' doit être un tableau d'alumni.`);
    }
  },
  
  currentZoom: (props, propName, componentName) => {
    if (typeof props[propName] !== 'number') {
      return new Error(`La prop '${propName}' doit être un nombre.`);
    }
  },
  
  // Props optionnelles
  onNavigate: (props, propName) => {
    if (props[propName] && typeof props[propName] !== 'function') {
      return new Error(`La prop '${propName}' doit être une fonction.`);
    }
  },
  
  minZoom: (props, propName) => {
    if (props[propName] && typeof props[propName] !== 'number') {
      return new Error(`La prop '${propName}' doit être un nombre.`);
    }
  },
  
  disabled: (props, propName) => {
    if (props[propName] && typeof props[propName] !== 'boolean') {
      return new Error(`La prop '${propName}' doit être un booléen.`);
    }
  },
  
  className: (props, propName) => {
    if (props[propName] && typeof props[propName] !== 'string') {
      return new Error(`La prop '${propName}' doit être une chaîne de caractères.`);
    }
  },
  
  bubbleClassName: (props, propName) => {
    if (props[propName] && typeof props[propName] !== 'string') {
      return new Error(`La prop '${propName}' doit être une chaîne de caractères.`);
    }
  },
  
  showTooltips: (props, propName) => {
    if (props[propName] && typeof props[propName] !== 'boolean') {
      return new Error(`La prop '${propName}' doit être un booléen.`);
    }
  }
};

// Valeurs par défaut
DirectionalBubbles.defaultProps = {
  minZoom: 3,
  disabled: false,
  className: '',
  bubbleClassName: '',
  showTooltips: true,
  onNavigate: null
};

export default DirectionalBubbles;