/**
 * Service pour la gestion géographique et le clustering
 */

class GeoService {
  /**
   * Détermine le niveau d'affichage selon le zoom
   * - Niveau 0 (zoom 2-4): Vue globale - Compteurs par pays
   * - Niveau 1 (zoom 5-7): Vue pays - Compteurs par région/ville
   * - Niveau 2 (zoom 8+): Vue locale - Cartes individuelles des alumni
   */
  static getDisplayLevel(zoomLevel) {
    if (zoomLevel <= 4) return 'country';
    if (zoomLevel <= 7) return 'region';
    return 'individual';
  }

  /**
   * Calcule la distance entre deux points géographiques
   * Utilise la formule de Haversine
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convertit les degrés en radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Détermine si deux points sont dans la même zone selon le niveau de zoom
   */
  static areInSameCluster(point1, point2, zoomLevel) {
    const distance = this.calculateDistance(
      point1.coordinates[0], point1.coordinates[1],
      point2.coordinates[0], point2.coordinates[1]
    );

    // Seuils de distance selon le zoom
    const thresholds = {
      country: 500,  // 500km pour le niveau pays
      city: 50,      // 50km pour le niveau ville
      individual: 5  // 5km pour le niveau individuel
    };

    const level = this.getDisplayLevel(zoomLevel);
    return distance <= thresholds[level];
  }

  /**
   * Groupe les alumni par proximité géographique
   */
  static clusterAlumniByProximity(alumni, zoomLevel) {
    const clusters = [];
    const processed = new Set();

    alumni.forEach((alumni, index) => {
      if (processed.has(index)) return;

      const cluster = {
        id: `cluster_${clusters.length}`,
        alumni: [alumni],
        coordinates: [...alumni.coordinates],
        count: 1
      };

      // Chercher les alumni proches
      for (let i = index + 1; i < alumni.length; i++) {
        if (processed.has(i)) continue;

        const otherAlumni = alumni[i];
        if (this.areInSameCluster(alumni, otherAlumni, zoomLevel)) {
          cluster.alumni.push(otherAlumni);
          cluster.count++;
          processed.add(i);
        }
      }

      // Recalculer le centre du cluster si plusieurs alumni
      if (cluster.count > 1) {
        cluster.coordinates = this.calculateClusterCenter(cluster.alumni);
      }

      clusters.push(cluster);
      processed.add(index);
    });

    return clusters;
  }

  /**
   * Calcule le centre géographique d'un groupe d'alumni
   */
  static calculateClusterCenter(alumni) {
    const sumLat = alumni.reduce((sum, a) => sum + a.coordinates[0], 0);
    const sumLng = alumni.reduce((sum, a) => sum + a.coordinates[1], 0);
    
    return [
      sumLat / alumni.length,
      sumLng / alumni.length
    ];
  }

  /**
   * Détermine la taille optimale d'un marqueur selon le nombre d'alumni
   */
  static getMarkerSize(count) {
    if (count === 1) return { width: 40, height: 40 };
    if (count <= 5) return { width: 50, height: 50 };
    if (count <= 10) return { width: 60, height: 60 };
    if (count <= 20) return { width: 70, height: 70 };
    return { width: 80, height: 80 };
  }

  /**
   * Génère une couleur pour un cluster selon le nombre d'alumni
   */
  static getClusterColor(count) {
    if (count === 1) return '#667eea';
    if (count <= 5) return '#4CAF50';
    if (count <= 10) return '#FF9800';
    if (count <= 20) return '#F44336';
    return '#9C27B0';
  }

  /**
   * Valide des coordonnées géographiques
   */
  static isValidCoordinates(lat, lng) {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  }

  /**
   * Convertit des coordonnées en format utilisable par Leaflet
   */
  static normalizeCoordinates(coordinates) {
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      const [lat, lng] = coordinates;
      if (this.isValidCoordinates(lat, lng)) {
        return [lat, lng];
      }
    }
    
    console.warn('Coordonnées invalides:', coordinates);
    return [0, 0]; // Coordonnées par défaut
  }
}

export default GeoService;
