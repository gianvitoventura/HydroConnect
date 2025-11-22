// src/components/map/AnnotationsToolbar.jsx
import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Route, Plus, X } from 'lucide-react';
import { auth } from '../../firebaseConfig';
import { getUserFavorites, addFavoritePlant, removeFavoritePlant } from '../../services/MapAnnotationService';
import './AnnotationToolbar.css';

/**
 * Toolbar per gestire le annotazioni, favoriti e percorsi GPS sulla mappa
 */
const AnnotationsToolbar = ({ 
  onToggleAnnotationMode,
  isAnnotationMode,
  onToggleAnnotationsVisibility,
  showAnnotations,
  onToggleMyAnnotations,
  showMyAnnotations,
  activePlant = null,
  plantData = null // <-- activePlantData è ora plantData (già presente)
}) => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Controlla autenticazione
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Carica favoriti
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const unsubscribe = getUserFavorites((data) => {
      setFavorites(data);
      // Controlla se la centrale attiva è nei favoriti
      if (activePlant) {
        const isFav = data.some(fav => fav.plantId === activePlant);
        setIsFavorite(isFav);
      }
    });

    return unsubscribe;
  }, [user, activePlant]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Devi effettuare il login per aggiungere preferiti');
      return;
    }

    if (!activePlant || !plantData) {
      alert('Seleziona prima una centrale sulla mappa');
      return;
    }

    try {
      if (isFavorite) {
        await removeFavoritePlant(activePlant);
      } else {
        await addFavoritePlant(activePlant, plantData);
      }
    } catch (error) {
      console.error('Errore gestione preferito:', error);
      alert('Errore nell\'aggiornamento dei preferiti');
    }
  };

  return (
    <div className="annotations-toolbar">
      <div className="toolbar-section">
        {/* Modalità Creazione Annotazione */}
        <button
          className={`toolbar-button ${isAnnotationMode ? 'active' : ''}`}
          onClick={onToggleAnnotationMode}
          // LOGICA MODIFICATA: Disabilita se NON loggato O se (non è in mod. annulla E non c'è centrale selezionata)
          disabled={!user || (!isAnnotationMode && !activePlant)} 
          title={isAnnotationMode 
            ? 'Annulla Annotazione' 
            : !user ? 'Login richiesto' 
            : activePlant ? 'Aggiungi un’annotazione sulla centrale selezionata' 
            : 'Seleziona una centrale sulla mappa per annotare'} // <-- MESSAGGI GUIDA
        >
          {isAnnotationMode ? <X size={18} /> : <Plus size={18} />}
          <span>{isAnnotationMode ? 'Annulla' : 'Nuova Annotazione'}</span>
        </button>

        {/* Visibilità Annotazioni */}
        {/* <button
          className={`toolbar-button ${showAnnotations ? 'active' : ''}`}
          onClick={onToggleAnnotationsVisibility}
          title="Mostra/Nascondi annotazioni pubbliche"
        >
          {showAnnotations ? <Eye size={18} /> : <EyeOff size={18} />}
          <span>Annotazioni Pubbliche</span>
        </button> */}

        {/* Le Mie Annotazioni */}
        {user && (
          <button
            className={`toolbar-button ${showMyAnnotations ? 'active' : ''}`}
            onClick={onToggleMyAnnotations}
            title="Mostra/Nascondi le mie annotazioni"
          >
            <MessageSquare size={18} />
            <span>Le Mie Note ({favorites.length})</span>
          </button>
        )}

        {/* Aggiungi/Rimuovi Preferito */}
        {activePlant && (
          <button
            className={`toolbar-button favorite-button ${isFavorite ? 'is-favorite' : ''}`}
            onClick={handleToggleFavorite}
            disabled={!user}
            title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          >
            <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            <span>{isFavorite ? 'Rimuovi Preferito' : 'Aggiungi Preferito'}</span>
          </button>
        )}

        {/* Percorsi GPS - Placeholder per futura implementazione */}
        <button
          className="toolbar-button"
          disabled
          title="Funzionalità in arrivo"
        >
          <Route size={18} />
          <span>Percorsi GPS (presto)</span>
        </button>
      </div>

      {/* Info Stato - MODIFICATO PER GUIDA ALL'ANNOTAZIONE */}
      <div className="toolbar-info">
        {!user && (
          <p className="info-message warning">
            ⚠️ Effettua il login per salvare annotazioni
          </p>
        )}
        
        {/* Nuovo messaggio se Annotazione attiva ma centrale non selezionata */}
        {isAnnotationMode && !activePlant && ( 
            <p className="info-message warning">
                ⚠️ **Seleziona una centrale** per collegare l'annotazione.
            </p>
        )}
        
        {/* Messaggio quando la modalità Annotazione è attiva E la centrale è selezionata */}
        {isAnnotationMode && activePlant && ( 
          <p className="info-message active">
            📍 Clicca sulla mappa per aggiungere un'annotazione sulla centrale selezionata.
          </p>
        )}
        
        {/* Messaggio Centrale selezionata (solo se NON siamo in modalità annotazione) */}
        {activePlant && plantData && !isAnnotationMode && ( 
          <p className="info-message">
            🔌 Centrale selezionata: <strong>{plantData.name}</strong>
          </p>
        )}
      </div>

      {/* Lista Preferiti */}
      {user && favorites.length > 0 && (
        <div className="favorites-list">
          <h5>⭐ Centrali Preferite:</h5>
          <ul>
            {favorites.map((fav) => (
              <li key={fav.id}>
                <span className="favorite-name">{fav.plantName}</span>
                <span className="favorite-type">{fav.plantType}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnnotationsToolbar;