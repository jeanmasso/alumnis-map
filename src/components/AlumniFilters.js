import React, { useState, useMemo } from 'react';
import './AlumniFilters.css';

const AlumniFilters = ({ alumni, onFilterChange, isOpen, onToggle }) => {
  const [filters, setFilters] = useState({
    graduationYear: '',
    country: '',
    promotionType: ''
  });

  // Calcul des options de filtres à partir des données alumni
  const filterOptions = useMemo(() => {
    const graduationYears = [...new Set(alumni.map(a => a.graduationYear))].sort((a, b) => b - a);
    const countries = [...new Set(alumni.map(a => a.country))].sort();
    const promotionTypes = [...new Set(alumni.map(a => a.promotionType))].sort();
    
    return {
      graduationYears,
      countries,
      promotionTypes
    };
  }, [alumni]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      graduationYear: '',
      country: '',
      promotionType: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <div className="alumni-filters-container">
      {/* Bouton Burger */}
      <button 
        className={`burger-button ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        aria-label="Toggle filters menu"
      >
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      {/* Panneau de filtres */}
      <div className={`alumni-filters ${isOpen ? 'open' : 'closed'}`}>
        <div className="filters-header">
          <h3>Filtres de recherche</h3>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Effacer tous les filtres
            </button>
          )}
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="graduation-year-filter">Année de promotion</label>
            <select
              id="graduation-year-filter"
              value={filters.graduationYear}
              onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
            >
              <option value="">Toutes les années</option>
              {filterOptions.graduationYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="country-filter">Pays</label>
            <select
              id="country-filter"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="">Tous les pays</option>
              {filterOptions.countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="promotion-type-filter">Type de promotion</label>
            <select
              id="promotion-type-filter"
              value={filters.promotionType}
              onChange={(e) => handleFilterChange('promotionType', e.target.value)}
            >
              <option value="">Tous les types</option>
              {filterOptions.promotionTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="active-filters">
            <h4>Filtres actifs :</h4>
            <div className="filter-tags">
              {filters.graduationYear && (
                <span className="filter-tag">
                  Année: {filters.graduationYear}
                  <button 
                    onClick={() => handleFilterChange('graduationYear', '')}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.country && (
                <span className="filter-tag">
                  Pays: {filters.country}
                  <button 
                    onClick={() => handleFilterChange('country', '')}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.promotionType && (
                <span className="filter-tag">
                  Type: {filters.promotionType}
                  <button 
                    onClick={() => handleFilterChange('promotionType', '')}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniFilters;
