import React, { useState, useEffect } from 'react';
import './AlumniCard.css';

const AlumniCard = ({ alumni, onClick, isSelected = false, isFlipped = false, cardState = 'front' }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Détection améliorée du type d'appareil
  useEffect(() => {
    const checkDeviceType = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Considérer comme mobile si : écran tactile OU petit écran OU user agent mobile
      setIsMobile(hasTouch || isSmallScreen || isMobileUA);
    };
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Gestionnaire unifié - plus de différenciation mobile/desktop
  const handleCardClick = (e) => {
    e.stopPropagation();
    console.log('AlumniCard clicked:', alumni.name);
    onClick(alumni);
  };

  // Gestionnaire tactile simplifié
  const handleTouchStart = (e) => {
    e.stopPropagation();
    
    // Feedback haptique léger
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Même logique que le clic
    console.log('AlumniCard touched:', alumni.name);
    onClick(alumni);
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
      data-card-state={cardState}
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
