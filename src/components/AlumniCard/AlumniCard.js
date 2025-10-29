import React, { useState, useEffect, useRef } from 'react';
import './AlumniCard.css';
import { alumniImages } from '../../assets/images/alumni';

const AlumniCard = ({ alumni, onClick, isSelected = false, isFlipped = false, cardState = 'front' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isInteractionInProgress, setIsInteractionInProgress] = useState(false);
  const interactionTimeoutRef = useRef(null);

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

  // Gestionnaire unifié avec protection anti-doublon mobile
  const handleCardClick = (e) => {
    e.stopPropagation();
    
    // Protection contre les doubles événements sur mobile
    if (isInteractionInProgress) {
      console.log('Interaction déjà en cours, ignoring click for', alumni.name);
      return;
    }
    
    console.log('AlumniCard clicked:', alumni.name, 'Device:', isMobile ? 'Mobile' : 'Desktop');
    
    // Marquer l'interaction comme en cours
    setIsInteractionInProgress(true);
    
    // Exécuter l'action
    onClick(alumni);
    
    // Reset du flag avec délai plus long sur mobile
    const delay = isMobile ? 300 : 100;
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    
    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteractionInProgress(false);
    }, delay);
  };

  // Gestionnaire tactile - utilise la même logique mais avec flag spécial
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
    
    // Sur mobile, utiliser la même logique que le clic
    console.log('AlumniCard touched (touchEnd):', alumni.name);
    handleCardClick(e);
  };

  // Image par défaut si pas d'image fournie
  const getImageSrc = () => {
    if (alumni.image && alumniImages[alumni.image]) {
      return alumniImages[alumni.image];
    }
    return '/images/default-avatar.svg';
  };

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`alumni-card ${isFlipped ? 'flipped' : ''} ${isSelected ? 'selected' : ''} ${isMobile ? 'mobile' : ''}`}
      data-card-state={cardState}
      onClick={!isMobile ? handleCardClick : undefined}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      style={{ 
        pointerEvents: isInteractionInProgress ? 'none' : 'auto'
      }}
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
