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
   * Groupe les alumni par pays
   */
  getAlumniByCountry() {
    const groupedByCountry = {};

    this.alumni.forEach(alumni => {
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
  getAlumniByCity() {
    const groupedByCity = {};

    this.alumni.forEach(alumni => {
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
