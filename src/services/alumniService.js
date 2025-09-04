/**
 * Service pour gérer les données des alumni
 * Simule une API avec des données JSON locales
 */

class AlumniService {
  constructor() {
    this.alumni = [];
    this.countries = {};
    this.isLoaded = false;
  }

  /**
   * Charge les données depuis les fichiers JSON
   */
  async loadData() {
    try {
      // Charger les alumni
      const alumniResponse = await fetch('/data/alumni.json');
      const alumniData = await alumniResponse.json();
      this.alumni = alumniData.alumni;

      // Charger les référentiels pays
      const countriesResponse = await fetch('/data/countries.json');
      const countriesData = await countriesResponse.json();
      this.countries = countriesData.countries;

      this.isLoaded = true;
      return { success: true, data: this.alumni };
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retourne tous les alumni
   */
  getAllAlumni() {
    return this.alumni;
  }

  /**
   * Recherche des alumni par critères
   */
  searchAlumni(query) {
    if (!query || query.trim() === '') {
      return this.alumni;
    }

    const searchTerm = query.toLowerCase();
    return this.alumni.filter(alumni => 
      alumni.name.toLowerCase().includes(searchTerm) ||
      alumni.firstname.toLowerCase().includes(searchTerm) ||
      alumni.location.toLowerCase().includes(searchTerm) ||
      alumni.company.toLowerCase().includes(searchTerm) ||
      alumni.position.toLowerCase().includes(searchTerm) ||
      alumni.country.toLowerCase().includes(searchTerm) ||
      alumni.city.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Filtre les alumni par critères multiples
   */
  filterAlumni(filters) {
    let filteredAlumni = this.alumni;

    // Filtre par année de promotion
    if (filters.graduationYear && filters.graduationYear !== '') {
      filteredAlumni = filteredAlumni.filter(alumni => 
        alumni.graduationYear === parseInt(filters.graduationYear)
      );
    }

    // Filtre par pays
    if (filters.country && filters.country !== '') {
      filteredAlumni = filteredAlumni.filter(alumni => 
        alumni.country === filters.country
      );
    }

    // Filtre par type de promotion
    if (filters.promotionType && filters.promotionType !== '') {
      filteredAlumni = filteredAlumni.filter(alumni => 
        alumni.promotionType === filters.promotionType
      );
    }

    return filteredAlumni;
  }

  /**
   * Groupe les alumni par pays
   */
  getAlumniByCountry(alumniList = null) {
    const alumni = alumniList || this.alumni;
    const groupedByCountry = {};

    alumni.forEach(alumni => {
      const country = alumni.country;
      
      if (!groupedByCountry[country]) {
        groupedByCountry[country] = {
          country: country,
          count: 0,
          alumni: [],
          coordinates: this.countries[country]?.center || [0, 0],
          bounds: this.countries[country]?.bounds,
          zoomLevel: this.countries[country]?.zoomLevel || 6
        };
      }

      groupedByCountry[country].count++;
      groupedByCountry[country].alumni.push(alumni);
    });

    // Toujours utiliser les coordonnées du centre du pays pour un clustering cohérent
    return groupedByCountry;
  }

  /**
   * Groupe les alumni par ville
   */
  getAlumniByCity(alumniList = null) {
    const alumni = alumniList || this.alumni;
    const groupedByCity = {};

    alumni.forEach(alumni => {
      const cityKey = `${alumni.city}, ${alumni.country}`;
      
      if (!groupedByCity[cityKey]) {
        groupedByCity[cityKey] = {
          city: alumni.city,
          country: alumni.country,
          count: 0,
          alumni: [],
          coordinates: alumni.coordinates
        };
      }

      groupedByCity[cityKey].count++;
      groupedByCity[cityKey].alumni.push(alumni);
    });

    return groupedByCity;
  }

  /**
   * Groupe les alumni par région (logique simplifiée basée sur la proximité des villes)
   */
  getAlumniByRegion(alumniList = null) {
    const alumni = alumniList || this.alumni;
    const groupedByRegion = {};

    alumni.forEach(alumni => {
      // Pour simplifier, on groupe par pays + première partie de la ville ou coordonnées proches
      let regionKey;
      
      // Logique de regroupement régional simple
      if (alumni.country === 'France') {
        // Pour la France, on peut définir des régions principales
        if (alumni.city.includes('Paris') || alumni.city.includes('Île-de-France')) {
          regionKey = 'France_IleDeFrance';
        } else if (alumni.city.includes('Lyon') || alumni.city.includes('Rhône')) {
          regionKey = 'France_RhoneAlpes';
        } else if (alumni.city.includes('Nouméa') || alumni.city.includes('Nouvelle-Calédonie')) {
          regionKey = 'France_NouvelleCaledonie';
        } else {
          regionKey = `France_${alumni.city}`;
        }
      } else {
        // Pour les autres pays, on groupe par ville principale ou région métropolitaine
        regionKey = `${alumni.country}_${alumni.city}`;
      }

      if (!groupedByRegion[regionKey]) {
        // Calculer les coordonnées moyennes pour la région
        groupedByRegion[regionKey] = {
          region: regionKey,
          country: alumni.country,
          mainCity: alumni.city,
          count: 0,
          alumni: [],
          coordinates: alumni.coordinates // Sera mis à jour avec la moyenne
        };
      }

      groupedByRegion[regionKey].count++;
      groupedByRegion[regionKey].alumni.push(alumni);
    });

    // Calculer les coordonnées moyennes pour chaque région
    Object.values(groupedByRegion).forEach(regionGroup => {
      if (regionGroup.count > 1) {
        const avgLat = regionGroup.alumni.reduce((sum, alumni) => sum + alumni.coordinates[0], 0) / regionGroup.count;
        const avgLng = regionGroup.alumni.reduce((sum, alumni) => sum + alumni.coordinates[1], 0) / regionGroup.count;
        regionGroup.coordinates = [avgLat, avgLng];
      }
    });

    return groupedByRegion;
  }

  /**
   * Retourne un alumni par son ID
   */
  getAlumniById(id) {
    return this.alumni.find(alumni => alumni.id === id);
  }

  /**
   * Filtre les alumni par année de diplôme
   */
  getAlumniByGraduationYear(year) {
    return this.alumni.filter(alumni => alumni.graduationYear === year);
  }

  /**
   * Retourne les années de diplôme disponibles
   */
  getAvailableGraduationYears() {
    const years = [...new Set(this.alumni.map(alumni => alumni.graduationYear))];
    return years.sort((a, b) => b - a); // Plus récent en premier
  }

  /**
   * Retourne les pays disponibles
   */
  getAvailableCountries() {
    const countries = [...new Set(this.alumni.map(alumni => alumni.country))];
    return countries.sort();
  }

  /**
   * Retourne les entreprises disponibles
   */
  getAvailableCompanies() {
    const companies = [...new Set(this.alumni.map(alumni => alumni.company))];
    return companies.sort();
  }

  /**
   * Retourne les types de promotion disponibles
   */
  getAvailablePromotionTypes() {
    const promotionTypes = [...new Set(this.alumni.map(alumni => alumni.promotionType))];
    return promotionTypes.sort();
  }

  /**
   * Statistiques générales
   */
  getStatistics() {
    return {
      totalAlumni: this.alumni.length,
      countriesCount: this.getAvailableCountries().length,
      companiesCount: this.getAvailableCompanies().length,
      graduationYearsRange: {
        min: Math.min(...this.alumni.map(a => a.graduationYear)),
        max: Math.max(...this.alumni.map(a => a.graduationYear))
      }
    };
  }
}

// Instance singleton
const alumniService = new AlumniService();

export default alumniService;
