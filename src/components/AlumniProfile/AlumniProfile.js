import React from 'react';
import './AlumniProfile.css';
import { alumniImages } from '../../assets/images/alumni';

const AlumniProfile = ({ alumni, isOpen, onClose }) => {
  console.log('AlumniProfile rendered with:', { alumni: alumni?.name, isOpen });
  
  if (!alumni) return null;

  const getImageSrc = () => {
    if (alumni.image) {
      // Vérifier si l'image existe dans notre mapping
      if (alumniImages[alumni.image])
        return alumniImages[alumni.image];
      else 
        return '/images/default-avatar.svg';
    }
    return '/images/default-avatar.svg';
  };



  return (
    <div className={`alumni-profile ${isOpen ? 'open' : 'closed'}`}>
      <div className="profile-header">
        <h2>Profil Alumni</h2>
        <button 
          className="close-button"
          onClick={onClose}
          aria-label="Fermer le profil"
        >
          ×
        </button>
      </div>

      <div className="profile-content">
        {/* Photo de profil */}
        <div className="profile-image-section">
          <div className="profile-image-container">
            <img 
              src={getImageSrc()} 
              alt={`${alumni.firstname} ${alumni.name}`}
              onError={(e) => {
                e.target.src = '/images/default-avatar.svg';
              }}
            />
          </div>
          <div className="profile-name">
            <h3>{alumni.firstname} {alumni.name}</h3>
            <p className="graduation-badge">Promotion {alumni.graduationYear}</p>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="profile-section">
          <h4>Informations professionnelles</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Position :</span>
              <span className="info-value">{alumni.position}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Entreprise :</span>
              <span className="info-value">{alumni.company}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Localisation :</span>
              <span className="info-value">{alumni.location}</span>
            </div>
          </div>
        </div>

        {/* Biographie */}
        {alumni.biography && (
          <div className="profile-section">
            <h4>À propos</h4>
            <p className="biography">{alumni.biography}</p>
          </div>
        )}

        {/* Informations académiques */}
        <div className="profile-section">
          <h4>Formation</h4>
          <div className="academic-info">
            <div className="academic-item">
              <span className="academic-year">{alumni.graduationYear}</span>
              <span className="academic-degree">Diplômé(e) en {alumni.promotionType}</span>
            </div>
          </div>
        </div>

        {/* Coordonnées (optionnel) */}
        <div className="profile-section coordinates">
          <h4>Localisation</h4>
          <p className="coordinates-text">
            📍 {alumni.location}
          </p>
          <p className="coordinates-details">
            Lat: {alumni.coordinates[0].toFixed(4)}, 
            Lng: {alumni.coordinates[1].toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;
