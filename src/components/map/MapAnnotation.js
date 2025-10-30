// src/components/map/MapAnnotations.jsx
import React, { useState, useEffect } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MessageSquare, Heart, Trash2, X, Upload, AlertCircle } from 'lucide-react';
import {
  createAnnotation, 
  getPublicAnnotations, 
  getUserAnnotations,
  getPlantAnnotations,
  deleteAnnotation, 
  likeAnnotation,
  hasUserLiked
} from '../../services/MapAnnotationService';
import { auth } from '../../firebaseConfig';
import './MapAnnotation.css';

/**
 * Componente per gestire le annotazioni sulla mappa
 * ✨ MODIFICHE:
 * - Annotazioni vincolate a centrale selezionata
 * - Like limitato ad 1 per utente (array likedBy)
 * - Disabilitazione layer durante inserimento
 * * Props:
 * - showMyAnnotations: mostra solo le annotazioni dell'utente corrente
 * - isCreating: modalità creazione attiva (click sulla mappa per aggiungere)
 * - onAnnotationCreated: callback quando viene creata un'annotazione
 * - activePlant: ID centrale attualmente selezionata (OBBLIGATORIO per creare)
 * - activePlantData: Dati completi centrale selezionata
 * - onDisableMapInteraction: callback per disabilitare interazione con layer
 */
const MapAnnotations = ({ 
  showMyAnnotations = false, 
  isCreating = false,
  onAnnotationCreated,
  activePlant = null,
  activePlantData = null, // <-- Usato per form e logica
  onDisableMapInteraction
}) => {
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [showPlantWarning, setShowPlantWarning] = useState(false);
  
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
      // Mostra solo annotazioni utente
      unsubscribe = getUserAnnotations((data) => {
        setAnnotations(data);
      });
    } else if (activePlant) {
      // Mostra annotazioni della centrale selezionata
      unsubscribe = getPlantAnnotations(activePlant, (data) => {
        setAnnotations(data);
      });
    } else {
      // Mostra tutte le annotazioni pubbliche
      unsubscribe = getPublicAnnotations((data) => {
        setAnnotations(data);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [showMyAnnotations, user, activePlant]);

  // ✨ Notifica parent quando modalità inserimento cambia (per disabilitare layer)
  useEffect(() => {
    if (onDisableMapInteraction) {
      onDisableMapInteraction(isCreating);
    }
  }, [isCreating, onDisableMapInteraction]);

  // Gestione click sulla mappa per creare annotazione
  useMapEvents({
    click(e) {
      if (!isCreating) return;
      
      if (!user) {
        alert('Devi effettuare il login per creare annotazioni');
        return;
      }

      // ✅ CONTROLLO AGGIORNATO: Centrale deve essere selezionata
      if (!activePlant || !activePlantData) {
        setShowPlantWarning(true);
        setTimeout(() => setShowPlantWarning(false), 3000);
        return; // BLOCCA la creazione se non c'è una centrale selezionata
      }

      // ✅ OK: Crea marker temporaneo nella posizione del click
      setNewAnnotation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
      setShowForm(true);
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

    // ✅ Doppio controllo centrale selezionata (dovrebbe sempre essere true qui)
    if (!activePlant || !activePlantData) {
      alert('Errore: Centrale non selezionata. Riprova.');
      return;
    }

    try {
      // ✅ Passa dati centrale al service
      await createAnnotation({
        ...newAnnotation,
        ...formData,
        plantId: activePlant,
        plantName: activePlantData.name,
        plantType: activePlantData.type || 'unknown'
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
      
      // Callback per notificare la creazione
      if (onAnnotationCreated) {
        onAnnotationCreated();
      }
    } catch (error) {
      console.error('Errore creazione annotazione:', error);
      alert(error.message || 'Errore nella creazione dell\'annotazione');
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
        alert(error.message || 'Errore nell\'eliminazione dell\'annotazione');
      }
    }
  };

  const handleLike = async (annotationId) => {
    if (!user) {
      alert('Devi effettuare il login per mettere like');
      return;
    }

    try {
      await likeAnnotation(annotationId);
    } catch (error) {
      console.error('Errore like:', error);
      alert(error.message || 'Errore nella gestione del like');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data sconosciuta';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data non valida';
    }
  };

  return (
    <>
      {/* ⚠️ Warning: nessuna centrale selezionata - MODIFICATO PER MAGGIORE VISIBILITÀ */}
      {showPlantWarning && (
        <div className="plant-warning-overlay">
          <div className="plant-warning-box">
            <AlertCircle size={24} />
            <p>Seleziona prima una centrale sulla mappa!</p>
            <small>Clicca su uno dei marker a forma di turbina.</small>
          </div>
        </div>
      )}

      {/* Markers delle annotazioni */}
      {annotations.map((annotation) => {
        const userHasLiked = hasUserLiked(annotation.likedBy);
        
        return (
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
                  <span className={`annotation-category category-${annotation.category}`}>
                    {annotation.category}
                  </span>
                </div>

                {/* Info centrale */}
                {annotation.plantName && (
                  <div className="annotation-plant-info">
                    <small>
                      🏭 <strong>{annotation.plantName}</strong>
                    </small>
                  </div>
                )}

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
                    <span className="author-name">
                      👤 {annotation.userName}
                    </span>
                    <span className="annotation-date">
                      {formatDate(annotation.createdAt)}
                    </span>
                  </div>

                  <div className="annotation-actions">
                    {/* Like button con stato */}
                    <button 
                      onClick={() => handleLike(annotation.id)}
                      className={`action-button like-button ${userHasLiked ? 'liked' : ''}`}
                      title={userHasLiked ? 'Rimuovi like' : 'Mi piace'}
                      disabled={!user}
                    >
                      <Heart 
                        size={16} 
                        fill={userHasLiked ? 'currentColor' : 'none'}
                      />
                      <span>{annotation.likes || 0}</span>
                    </button>

                    {/* Delete button (solo proprietario) */}
                    {user && user.uid === annotation.userId && (
                      <button 
                        onClick={() => handleDelete(annotation.id)}
                        className="action-button delete-button"
                        title="Elimina"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

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
              <h3>✨ Nuova annotazione per <strong>{activePlantData.name}</strong></h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setNewAnnotation(null);
                  if (onAnnotationCreated) {
                    onAnnotationCreated();
                  }
                }}
                className="close-button"
                aria-label="Chiudi"
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
                  <span>Rendi visibile a tutti</span>
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
              <div className="form-action">
                <button type="submit" className="submit-button">
                  💾 Salva Annotazione
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setNewAnnotation(null);
                    if (onAnnotationCreated) {
                      onAnnotationCreated();
                    }
                  }}
                  className="cancel-button"
                >
                  ❌ Annulla
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