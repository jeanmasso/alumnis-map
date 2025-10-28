/**
 * Utilitaires pour les calculs géographiques des bulles directionnelles
 */

/**
 * Vérifie si des coordonnées sont dans les bounds de la carte
 * @param {Array} coordinates - [latitude, longitude]
 * @param {Object} bounds - Bounds Leaflet avec _northEast et _southWest
 * @returns {boolean}
 */
export const isInBounds = (coordinates, bounds) => {
  if (!coordinates || !bounds || !bounds._northEast || !bounds._southWest) {
    return false;
  }

  const [lat, lng] = coordinates;
  const { _northEast, _southWest } = bounds;
  
  return (
    lat >= _southWest.lat &&
    lat <= _northEast.lat &&
    lng >= _southWest.lng &&
    lng <= _northEast.lng
  );
};

/**
 * Filtre les alumni visibles dans les bounds actuels de la carte
 * @param {Object} bounds - Bounds Leaflet
 * @param {Array} allAlumni - Tous les alumni
 * @returns {Array} Alumni visibles
 */
export const getVisibleAlumni = (bounds, allAlumni) => {
  if (!bounds || !allAlumni || allAlumni.length === 0) {
    return [];
  }

  return allAlumni.filter(alumni => {
    if (!alumni.coordinates || alumni.coordinates.length !== 2) {
      return false;
    }
    return isInBounds(alumni.coordinates, bounds);
  });
};

/**
 * Calcule le nombre d'alumni dans chaque direction par rapport aux bounds actuels
 * @param {Object} bounds - Bounds Leaflet
 * @param {Array} hiddenAlumni - Alumni non visibles
 * @returns {Object} Compteurs par direction {north, south, east, west}
 */
export const calculateDirectionalCounts = (bounds, hiddenAlumni) => {
  if (!bounds || !hiddenAlumni || hiddenAlumni.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }

  const { _northEast, _southWest } = bounds;
  const north = _northEast.lat;
  const south = _southWest.lat;
  const east = _northEast.lng;
  const west = _southWest.lng;

  const directionalCounts = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };

  hiddenAlumni.forEach(alumni => {
    if (!alumni.coordinates || alumni.coordinates.length !== 2) {
      return;
    }

    const [lat, lng] = alumni.coordinates;

    // Priorité aux directions principales (Nord/Sud puis Est/Ouest)
    if (lat > north) {
      directionalCounts.north++;
    } else if (lat < south) {
      directionalCounts.south++;
    } else if (lng > east) {
      directionalCounts.east++;
    } else if (lng < west) {
      directionalCounts.west++;
    }
  });

  return directionalCounts;
};

/**
 * Obtient les alumni regroupés par direction
 * @param {Object} bounds - Bounds Leaflet
 * @param {Array} hiddenAlumni - Alumni non visibles
 * @returns {Object} Alumni groupés par direction
 */
export const getAlumniByDirection = (bounds, hiddenAlumni) => {
  if (!bounds || !hiddenAlumni || hiddenAlumni.length === 0) {
    return { north: [], south: [], east: [], west: [] };
  }

  const { _northEast, _southWest } = bounds;
  const north = _northEast.lat;
  const south = _southWest.lat;
  const east = _northEast.lng;
  const west = _southWest.lng;

  const directionalAlumni = {
    north: [],
    south: [],
    east: [],
    west: []
  };

  hiddenAlumni.forEach(alumni => {
    if (!alumni.coordinates || alumni.coordinates.length !== 2) {
      return;
    }

    const [lat, lng] = alumni.coordinates;

    // Même logique de priorité que calculateDirectionalCounts
    if (lat > north) {
      directionalAlumni.north.push(alumni);
    } else if (lat < south) {
      directionalAlumni.south.push(alumni);
    } else if (lng > east) {
      directionalAlumni.east.push(alumni);
    } else if (lng < west) {
      directionalAlumni.west.push(alumni);
    }
  });

  return directionalAlumni;
};

/**
 * Calcule le centre optimal pour la navigation vers une direction
 * @param {string} direction - Direction (north, south, east, west)
 * @param {Array} alumniList - Liste des alumni dans cette direction
 * @returns {Object|null} Target de navigation {center: [lat, lng], zoom: number}
 */
export const getOptimalNavigationTarget = (direction, alumniList) => {
  if (!alumniList || alumniList.length === 0) {
    return null;
  }

  // Calculer le centre géographique des alumni
  const avgLat = alumniList.reduce((sum, alumni) => sum + alumni.coordinates[0], 0) / alumniList.length;
  const avgLng = alumniList.reduce((sum, alumni) => sum + alumni.coordinates[1], 0) / alumniList.length;

  // Déterminer le zoom optimal selon le nombre d'alumni
  let zoom = 3; // Vue globale par défaut
  if (alumniList.length === 1) {
    zoom = 8; // Zoom proche pour 1 alumni
  } else if (alumniList.length <= 3) {
    zoom = 6; // Zoom région pour 2-3 alumni
  } else if (alumniList.length <= 10) {
    zoom = 4; // Zoom pays pour 4-10 alumni
  }

  return {
    center: [avgLat, avgLng],
    zoom: zoom,
    alumniCount: alumniList.length,
    direction: direction
  };
};

/**
 * Vérifie si les bulles doivent être affichées
 * @param {number} currentZoom - Niveau de zoom actuel
 * @param {Object} directionalCounts - Compteurs par direction
 * @param {number} minZoom - Zoom minimum pour afficher les bulles (défaut: 3)
 * @returns {boolean}
 */
export const shouldShowBubbles = (currentZoom, directionalCounts, minZoom = 3) => {
  if (currentZoom < minZoom) {
    return false;
  }

  // Vérifier s'il y a au moins une direction avec des alumni
  return Object.values(directionalCounts).some(count => count > 0);
};

/**
 * Formate le texte de tooltip pour une bulle
 * @param {string} direction - Direction
 * @param {number} count - Nombre d'alumni
 * @param {Array} alumniList - Liste des alumni (optionnel pour détails)
 * @returns {string}
 */
export const formatBubbleTooltip = (direction, count, alumniList = []) => {
  const directionNames = {
    north: 'nord',
    south: 'sud',
    east: 'est',
    west: 'ouest'
  };

  const directionName = directionNames[direction] || direction;
  let tooltip = `${count} alumni vers le ${directionName}`;

  // Ajouter les pays si disponibles
  if (alumniList.length > 0) {
    const countryGroups = alumniList.reduce((acc, alumni) => {
      acc[alumni.country] = (acc[alumni.country] || 0) + 1;
      return acc;
    }, {});

    const countries = Object.entries(countryGroups)
      .map(([country, count]) => `${country} (${count})`)
      .join(', ');

    tooltip += `\n${countries}`;
  }

  return tooltip;
};