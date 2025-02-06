import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { historicalData } from '../data/HistoricalData';
import { hydroplants } from '../data/HydroData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/HistoricalDetailPage.css';

const MediaCarousel = React.memo(({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextMedia = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const prevMedia = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  const getCaption = useCallback((url) => {
    const fileName = url.split('/').pop();
    const caption = fileName.split('.')[0];
    return caption.split(' ')
      .map(word => word.charAt(0) + word.slice(1))
      .join(' ');
  }, []);

  const renderMedia = useCallback((item) => {
    if (item.type === 'video') {
      return (
        <video 
          src={item.url}
          controls
          onError={(e) => console.error('Errore caricamento video:', e)}
          onLoadedData={() => console.log('Video caricato con successo')}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        >
          <source src={item.url} type="video/mp4" />
          Il tuo browser non supporta il tag video.
        </video>
      );
    }
    return (
      <img 
        src={item.url} 
        alt={getCaption(item.url)}
        loading="lazy"
      />
    );
  }, [getCaption]);

  return (
    <div className="timeline-image-carousel">
      <div className="carousel-container">
        {renderMedia(media[currentIndex])}
        {media.length > 1 && (
          <>
            <button 
              className="carousel-button prev" 
              onClick={prevMedia}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="carousel-button next" 
              onClick={nextMedia}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
            <div className="carousel-indicators">
              {media.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        <p className="media-caption">{getCaption(media[currentIndex].url)}</p>
      </div>
    </div>
  );
});

const HistoricalDetailPage = ({ plantId, setCurrentPage }) => {
  const [activeEra, setActiveEra] = useState('all');
  const plantData = historicalData[plantId];
  const plant = hydroplants.find(p => p.id === plantId);

  const filteredTimeline = useMemo(() => {
    return plantData.timeline.filter(event => activeEra === 'all' || event.category === activeEra);
  }, [plantData, activeEra]);

  if (!plantData || !plant) {
    return (
      <div className="historical-page-container">
        <h1>Dati storici non disponibili</h1>
        <button 
          className="back-button floating"
          onClick={() => setCurrentPage({ page: 'map' })}
        >
          ← Torna alla mappa
        </button>
      </div>
    );
  }

  return (
    <div className="historical-page-container">
      <button 
        className="back-button floating"
        onClick={() => setCurrentPage({ page: 'map' })}
      >
        ← Torna alla mappa
      </button>

      <div className="historical-header">
        <h1>{plant.name} - Storia e sviluppo</h1>
        <p className="subtitle">
          Scoprire le origini per capire come affrontare le sfide del futuro della centrale idroelettrica
        </p>
      </div>

      <div className="era-filters">
        <button 
          className={`era-filter-button ${activeEra === 'all' ? 'active' : ''}`}
          onClick={() => setActiveEra('all')}
        >
          Tutto
        </button>
        <button 
          className={`era-filter-button ${activeEra === 'past' ? 'active' : ''}`}
          onClick={() => setActiveEra('past')}
        >
          Le origini
        </button>
        <button 
          className={`era-filter-button ${activeEra === 'today' ? 'active' : ''}`}
          onClick={() => setActiveEra('today')}
        >
          Gli ultimi anni
        </button>
        <button 
          className={`era-filter-button ${activeEra === 'future' ? 'active' : ''}`}
          onClick={() => setActiveEra('future')}
        >
          Le sfide del futuro
        </button>
      </div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {filteredTimeline.map((event, index) => (
          <div 
            key={index}
            className={`timeline-event ${index % 2 === 0 ? 'left' : 'right'}`}
          >
            <div className="timeline-dot"></div>
            <div className="timeline-year">
              <h3>{event.year}</h3>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
            </div>
            <div className="timeline-content">
              <div className="timeline-card">
                <MediaCarousel media={event.media} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="extra-info">
        <h2>Approfondimenti</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Valore Culturale</h3>
            <p>{plantData.extraInfo.culturalValue}</p>
          </div>
          <div className="info-card">
            <h3>Caratteristiche Architettoniche</h3>
            <p>{plantData.extraInfo.architecturalFeatures}</p>
          </div>
          <div className="info-card">
            <h3>Evoluzione Tecnologica</h3>
            <p>{plantData.extraInfo.technologicalEvolution}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalDetailPage;