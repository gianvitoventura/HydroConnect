// src/components/map/MapAnnotations.jsx
import React, { useState, useEffect } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MessageSquare, Camera, MapPin, Heart, Trash2, X, Upload } from 'lucide-react';
import {createAnnotation, getPublicAnnotations, getUserAnnotations, deleteAnnotation, likeAnnotation} from '../../services/MapAnnotationServices';
import { auth } from '../../firebaseConfig';
import './MapAnnotation.css';

/**
 * Componente per gestire le annotazioni sulla mappa
 */
const MapAnnotations = ({ showMyAnnotations = false }) => {
  const [annotations, setAnnotations] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    isPublic: true,
    imageFiles: []
  });

  // Controlla autenticazione
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Carica annotazioni
  useEffect(() => {
    let unsubscribe;
    
    if (showMyAnnotations && user) {
      unsubscribe = getUserAnnotations((data) => {
        setAnnotations(data);
      });
    } else {
      unsubscribe = getPublicAnnotations((data) => {
        setAnnotations(data);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [showMyAnnotations, user]);

  // Gestione click sulla mappa per creare annotazione
  useMapEvents({
    click(e) {
      if (isCreating && user) {
        setNewAnnotation({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        });
        setShowForm(true);
      }
    }
  });

  // Icone personalizzate per le annotazioni
  const getAnnotationIcon = (category) => {
    const iconMap = {
      general: '💬',
      photo: '📷',
      issue: '⚠️',
      suggestion: '💡'
    };

    const iconHtml = `
      <div class="annotation-marker annotation-${category}">
        <span class="annotation-icon">${iconMap[category] || '📍'}</span>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'annotation-icon-wrapper',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  // Gestione form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Devi effettuare il login per creare annotazioni');
      return;
    }

    try {
      await createAnnotation({
        ...newAnnotation,
        ...formData
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'general',
        isPublic: true,
        imageFiles: []
      });
      setNewAnnotation(null);
      setShowForm(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Errore creazione annotazione:', error);
      alert('Errore nella creazione dell\'annotazione');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...files]
    }));
  };

  const handleDelete = async (annotationId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa annotazione?')) {
      try {
        await deleteAnnotation(annotationId);
      } catch (error) {
        console.error('Errore eliminazione:', error);
        alert('Errore nell\'eliminazione dell\'annotazione');
      }
    }
  };

  const handleLike = async (annotationId) => {
    try {
      await likeAnnotation(annotationId);
    } catch (error) {
      console.error('Errore like:', error);
    }
  };

  return (
    <>
      {/* Markers delle annotazioni */}
      {annotations.map((annotation) => (
        <Marker
          key={annotation.id}
          position={[annotation.latitude, annotation.longitude]}
          icon={getAnnotationIcon(annotation.category)}
        >
          <Popup className="annotation-popup">
            <div className="annotation-content">
              {/* Header */}
              <div className="annotation-header">
                <h3>{annotation.title || 'Annotazione'}</h3>
                <span className="annotation-category">
                  {annotation.category}
                </span>
              </div>

              {/* Immagini */}
              {annotation.images && annotation.images.length > 0 && (
                <div className="annotation-images">
                  {annotation.images.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Annotazione ${index + 1}`}
                      className="annotation-image"
                    />
                  ))}
                </div>
              )}

              {/* Descrizione */}
              {annotation.description && (
                <p className="annotation-description">
                  {annotation.description}
                </p>
              )}

              {/* Footer */}
              <div className="annotation-footer">
                <div className="annotation-author">
                  <span>👤 {annotation.userName}</span>
                  <span className="annotation-date">
                    {annotation.createdAt?.toDate?.().toLocaleDateString()}
                  </span>
                </div>

                <div className="annotation-actions">
                  <button 
                    onClick={() => handleLike(annotation.id)}
                    className="action-button like-button"
                  >
                    <Heart size={16} />
                    <span>{annotation.likes || 0}</span>
                  </button>

                  {user && user.uid === annotation.userId && (
                    <button 
                      onClick={() => handleDelete(annotation.id)}
                      className="action-button delete-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Marker temporaneo per nuova annotazione */}
      {newAnnotation && showForm && (
        <Marker
          position={[newAnnotation.latitude, newAnnotation.longitude]}
          icon={getAnnotationIcon(formData.category)}
        />
      )}

      {/* Form di creazione annotazione */}
      {showForm && newAnnotation && (
        <div className="annotation-form-overlay">
          <div className="annotation-form">
            <div className="form-header">
              <h3>Nuova Annotazione</h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setNewAnnotation(null);
                }}
                className="close-button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Categoria */}
              <div className="form-group">
                <label>Categoria:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="general">💬 Nota Generale</option>
                  <option value="photo">📷 Foto</option>
                  <option value="issue">⚠️ Segnalazione</option>
                  <option value="suggestion">💡 Suggerimento</option>
                </select>
              </div>

              {/* Titolo */}
              <div className="form-group">
                <label>Titolo:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Dai un titolo all'annotazione"
                  required
                />
              </div>

              {/* Descrizione */}
              <div className="form-group">
                <label>Descrizione:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrivi cosa vuoi segnalare..."
                  rows={4}
                />
              </div>

              {/* Upload immagini */}
              <div className="form-group">
                <label>Immagini (opzionale):</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="upload-button">
                    <Upload size={16} />
                    <span>Aggiungi Immagini</span>
                  </label>
                  {formData.imageFiles.length > 0 && (
                    <span className="file-count">
                      {formData.imageFiles.length} file selezionati
                    </span>
                  )}
                </div>
              </div>

              {/* Visibilità */}
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  <span>Rendi pubblica (visibile a tutti)</span>
                </label>
              </div>

              {/* Coordinate */}
              <div className="coordinates-info">
                <small>
                  📍 Lat: {newAnnotation.latitude.toFixed(6)}, 
                  Lng: {newAnnotation.longitude.toFixed(6)}
                </small>
              </div>

              {/* Bottoni */}
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Salva Annotazione
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setNewAnnotation(null);
                  }}
                  className="cancel-button"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MapAnnotations;