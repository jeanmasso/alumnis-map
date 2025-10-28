import React, { useState, useEffect } from 'react';
import './AlumniCard.css';

const AlumniCard = ({ alumni, onClick, isSelected = false, isFlipped = false }) => {
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
    e.stopPropagation();
    onClick(); // Délègue au parent sans argument
  };

  // Gestion tactile pour mobile
  const handleTouchStart = (e) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    onClick(); // Utilise la même logique que le clic
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
