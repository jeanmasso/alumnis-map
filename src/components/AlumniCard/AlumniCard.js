import React, { useState, useEffect } from 'react';
import './AlumniCard.css';

const AlumniCard = ({ alumni, onClick, isSelected = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCardClick = (e) => {
    e.stopPropagation(); // Empêche la propagation vers la carte Leaflet
    
    if (isMobile) {
      // Sur mobile : premier clic flip, deuxième clic ouvre le profil
      if (!isFlipped) {
        setIsFlipped(true);
        // Auto-retour après 3 secondes si pas de deuxième clic
        setTimeout(() => {
          setIsFlipped(false);
        }, 3000);
      } else {
        onClick(alumni);
      }
    } else {
      // Sur desktop : clic direct ouvre le profil
      onClick(alumni);
    }
  };

  const handleCardHover = () => {
    if (!isMobile) {
      setIsFlipped(true);
    }
  };

  const handleCardLeave = () => {
    if (!isMobile) {
      setIsFlipped(false);
    }
  };

  // Gestion tactile pour mobile
  const handleTouchStart = (e) => {
    if (isMobile) {
      e.stopPropagation();
    }
  };

  const handleTouchEnd = (e) => {
    if (isMobile) {
      e.stopPropagation();
      handleCardClick(e);
    }
  };

  // Image par défaut si pas d'image fournie
  const getImageSrc = () => {
    if (alumni.image) {
      return `/images/alumni/${alumni.image}`;
    }
    return '/images/default-avatar.svg';
  };

  return (
    <div 
      className={`alumni-card ${isFlipped ? 'flipped' : ''} ${isSelected ? 'selected' : ''} ${isMobile ? 'mobile' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={handleCardHover}
      onMouseLeave={handleCardLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="card-content">
        {/* Face avant - Photo */}
        <div className="card-front">
          <div className="card-image-container">
            <img 
              src={getImageSrc()} 
              alt={`${alumni.firstname} ${alumni.name}`}
              onError={(e) => {
                e.target.src = '/images/default-avatar.svg';
              }}
            />
          </div>
          <div className="card-name">
            <span>{alumni.firstname}</span>
            <span>{alumni.name}</span>
          </div>
        </div>

        {/* Face arrière - Informations */}
        <div className="card-back">
          <h3>{alumni.firstname} {alumni.name}</h3>
          <div className="card-info">
            <p className="position">{alumni.position}</p>
            <p className="company">{alumni.company}</p>
            <p className="location">{alumni.location}</p>
            <p className="graduation">Promo {alumni.graduationYear}</p>
          </div>
          <div className="card-bio">
            {alumni.biography && (
              <p>{alumni.biography.substring(0, 100)}...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniCard;
