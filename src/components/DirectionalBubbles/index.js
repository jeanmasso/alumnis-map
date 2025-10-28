/**
 * Point d'entrée du module DirectionalBubbles
 * Exporte le composant principal et les utilitaires associés
 */

// Composant principal
export { default } from './DirectionalBubbles';

// Hook personnalisé
export { useDirectionalBubbles } from '../../hooks/useDirectionalBubbles';

// Utilitaires géographiques
export {
  getVisibleAlumni,
  calculateDirectionalCounts,
  getAlumniByDirection,
  getOptimalNavigationTarget,
  shouldShowBubbles,
  formatBubbleTooltip,
  isInBounds
} from '../../utils/geoBounds';

// Constantes utiles
export const DIRECTIONS = {
  NORTH: 'north',
  SOUTH: 'south',
  EAST: 'east',
  WEST: 'west'
};

export const DEFAULT_CONFIG = {
  MIN_ZOOM: 3,
  BUBBLE_SIZE: 40,
  ANIMATION_DURATION: 2000,
  DEBOUNCE_MS: 300,
  COLORS: {
    DEFAULT: 'rgba(0, 123, 255, 0.9)',
    NORTH: 'rgba(34, 139, 34, 0.9)',
    SOUTH: 'rgba(220, 53, 69, 0.9)',
    EAST: 'rgba(255, 193, 7, 0.9)',
    WEST: 'rgba(111, 66, 193, 0.9)'
  }
};

// Types TypeScript (pour référence future)
export const PROP_TYPES = {
  mapInstance: 'object', // Instance Leaflet Map
  alumni: 'array',       // Array d'objets alumni
  currentZoom: 'number', // Niveau de zoom actuel
  onNavigate: 'function', // Callback de navigation (optionnel)
  minZoom: 'number',     // Zoom minimum (défaut: 3)
  disabled: 'boolean',   // Désactivation (défaut: false)
  className: 'string',   // Classes CSS additionnelles
  bubbleClassName: 'string', // Classes CSS pour les bulles
  showTooltips: 'boolean' // Affichage des tooltips (défaut: true)
};