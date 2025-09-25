import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import { hydroplants } from '../data/HydroData';
import GpsTracker from '../components/map/GpsTraker';
import HydroRadarChart from '../components/map/HydroRadarChart';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/MapPage.css';

// Stili delle mappe base
const mapStyles = {
  humanitarian: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'Humanitarian'
  },
  terrain: {
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg',
    attribution: '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a>',
    name: 'Terrain'
  },
  toner: {
    url: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a>',
    name: 'Toner'
  },
  watercolor: {
    url: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
    attribution: '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a>',
    name: 'Watercolor'
  },
  cycle: {
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: 'Cycle'
  }
};

// Configurazione layer con metadati migliorati - VERSIONE AGGIORNATA
const LAYER_CONFIG = {
  // Layer esistenti (mantenuti)
  'Valle Po': {
    type: 'coverage',
    displayName: 'Valle Po',
    style: {
      color: '#FF6B35',
      weight: 2,
      opacity: 0.8,
      fillColor: '#FF7401',
      fillOpacity: 0.2
    },
    zIndex: 1
  },
  'Catasto': {
    type: 'plots',
    displayName: 'Particelle catastali',
    style: {
      color: '#8E44AD',
      weight: 2,
      opacity: 0.8,
      fillColor: '#8E44AD',
      fillOpacity: 0.3
    },
    zIndex: 2
  },
  'Bacino idrografico': {
    type: 'rivers',
    displayName: 'Bacino idrografico',
    style: {
      color: '#01E7FF',
      weight: 2,
      opacity: 1,
    },
    zIndex: 3
  },
  'Opere lineari': {
    type: 'infrastructure',
    displayName: 'Opere lineari',
    style: {
      color: '#FFF000',
      weight: 3,
      opacity: 0.9
    },
    zIndex: 4
  },
  'Opere puntuali': {
    type: 'works',
    displayName: 'Opere puntuali',
    style: {
      radius: 4,
      fillColor: "#E74C3C",
      color: "#C0392B",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    },
    zIndex: 5
  },
  
  // NUOVI LAYER AGGIUNTI
    'MaB UNESCO': {
    type: 'unesco_buffer',
    displayName: 'MaB UNESCO',
    style: {
      color: '#ffff00',
      weight: 2,
      opacity: 0.8,
      fillColor: '#ffff00',
      fillOpacity: 0.15,
    },
    zIndex: 6
  },
  'Core zone UNESCO': {
    type: 'unesco_core',
    displayName: 'Core zone UNESCO',
    style: {
      color: '#fd1100',
      weight: 3,
      opacity: 0.9,
      fillColor: '#fd1100',
      fillOpacity: 0.25,
    },
    zIndex: 7
  },
  'Punti interesse': {
    type: 'poi',
    displayName: 'Punti di interesse',
    style: {
      radius: 6,
      fillColor: "#00b00fff",
      color: "#00870bff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    },
    zIndex: 8
  }
};

// SVG per il marker della turbina
const turbineSVG = `
  <div class="marker-container">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke="black" stroke-width="0.5" class="rotating-icon">
      <g transform="translate(2, 2) scale(0.8)">
        <path fill="#3b82f6" d="M12,12 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 M12,12 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0
          M12,12 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0
          M12,2 L14,5 L10,5 Z
          M20.5,7 L17,9 L16,5 Z
          M20.5,17 L17,15 L18,11 Z
          M12,22 L10,19 L14,19 Z
          M3.5,17 L7,15 L6,11 Z
          M3.5,7 L7,9 L8,5 Z"/>
      </g>
    </svg>
  </div>
`;

// Icona della turbina 
const turbineIcon = L.divIcon({
  html: turbineSVG,
  className: 'turbine-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// Componente per il controllo della mappa
const MapController = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
};

const centerMap = [44.4, 7.5];

function MapPage({ setCurrentPage }) {
  // Stati
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMapStyle, setCurrentMapStyle] = useState('terrain');
  const [activePlant, setActivePlant] = useState(null);
  const [plantVisible, setPlantVisible] = useState(true);
  const [geoJSONLayers, setGeoJSONLayers] = useState({});
  const [layerVisibility, setLayerVisibility] = useState({});
  const [mapInstance, setMapInstance] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loadingLayers, setLoadingLayers] = useState(false);
  const [layerErrors, setLayerErrors] = useState({});

  const toggleTracking = () => {
    if (!isTracking) {
      if ("geolocation" in navigator) {
        setIsTracking(true);
      } else {
        alert("GPS non disponibile su questo dispositivo.");
      }
    } else {
      setIsTracking(false);
    }
  };

  // Funzione per creare lo stile dei layer in base al tipo di geometria
  const createLayerStyle = useCallback((layerConfig, feature) => {
    const baseStyle = layerConfig.style;
    
    // Se è un punto, usiamo i marker circolari
    if (feature?.geometry?.type === 'Point') {
      return {
        radius: baseStyle.radius || 6,
        fillColor: baseStyle.fillColor || baseStyle.color,
        color: baseStyle.color,
        weight: baseStyle.weight || 2,
        opacity: baseStyle.opacity || 1,
        fillOpacity: baseStyle.fillOpacity || 0.8
      };
    }
    
    // Per LineString e Polygon
    return baseStyle;
  }, []);

  // Caricamento dei layer GeoJSON migliorato
  const loadPlantLayers = useCallback(async (plantId) => {
    const plant = hydroplants.find(p => p.id === plantId);
    if (!plant) {
      console.error('Pianta non trovata:', plantId);
      return;
    }

    setLoadingLayers(true);
    setLayerErrors({});

    try {
      const layers = {};
      const errors = {};
      const plantFolder = plant.name.toLowerCase().replace(/\s+/g, '-');
      const basePath = '/geoData';
      
      // Ordine di caricamento (dal basso verso l'alto per z-index)
      const layersToLoad = Object.entries(LAYER_CONFIG).sort((a, b) => a[1].zIndex - b[1].zIndex);

      for (const [fileName, config] of layersToLoad) {
        try {
          console.log(`Tentativo di caricamento: ${basePath}/${plantFolder}/${fileName}.geojson`);
          
          const response = await fetch(`${basePath}/${plantFolder}/${fileName}.geojson`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Validazione GeoJSON più robusta
          if (!data || typeof data !== 'object') {
            throw new Error('Risposta non valida dal server');
          }
          
          if (!data.type || data.type !== 'FeatureCollection') {
            throw new Error('Formato GeoJSON non valido - deve essere FeatureCollection');
          }
          
          if (!Array.isArray(data.features)) {
            throw new Error('Formato GeoJSON non valido - features deve essere un array');
          }

          if (data.features.length === 0) {
            console.warn(`Layer ${fileName} è vuoto`);
            continue;
          }

          const layerKey = `${plant.id}-${fileName}`;

          layers[layerKey] = {
            data,
            config,
            displayName: config.displayName,
            fileName: fileName,
            featureCount: data.features.length
          };

          // Imposta la visibilità iniziale
          setLayerVisibility(prev => ({
            ...prev,
            [layerKey]: true
          }));

          console.log(`✅ Caricato con successo: ${fileName} (${data.features.length} features)`);

        } catch (error) {
          console.error(`❌ Errore nel caricamento di ${fileName}:`, error);
          
          // Log dettagliato per errori HTML (404)
          if (error.message.includes('DOCTYPE') || error.message.includes('Unexpected token')) {
            console.warn(`🔍 File non trovato: ${basePath}/${plantFolder}/${fileName}.geojson`);
            console.warn(`   Verifica che il file esista e sia accessibile`);
          }
          
          errors[fileName] = error.message;
        }
      }

      setGeoJSONLayers(prev => ({
        ...prev,
        [plantId]: layers
      }));

      if (Object.keys(errors).length > 0) {
        setLayerErrors(errors);
      }

    } catch (error) {
      console.error('Errore generale nel caricamento dei layer:', error);
      setLayerErrors({ general: error.message });
    } finally {
      setLoadingLayers(false);
    }
  }, []);

  // Funzione per renderizzare i marker dei punti
  const pointToLayer = useCallback((feature, latlng, layerConfig) => {
    const style = createLayerStyle(layerConfig, feature);
    return L.circleMarker(latlng, style);
  }, [createLayerStyle]);

  // Funzione per gestire le feature del layer
  const onEachFeature = useCallback((feature, layer) => {
    if (feature.properties && Object.keys(feature.properties).length > 0) {
      const popupContent = `
        <div class="popup-content">
          <h3>${feature.properties.name || feature.properties.nome || 'Dettagli Feature'}</h3>
          <div class="popup-table-container">
            <table class="plant-details">
              <tbody>
                ${Object.entries(feature.properties)
                  .filter(([key, value]) => value !== null && value !== undefined && value !== '')
                  .map(([key, value]) => `
                    <tr>
                      <td><strong>${key}:</strong></td>
                      <td class="value-cell">${value}</td>
                    </tr>
                  `)
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      
      layer.bindPopup(popupContent, {
        maxWidth: 400,
        className: 'custom-popup'
      });
    }
  }, []);

  // Gestione degli eventi ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && mapInstance) {
        setActivePlant(null);
        setGeoJSONLayers({});
        setLayerVisibility({});
        setPlantVisible(true);
        setLayerErrors({});
        
        mapInstance.setView(centerMap, 7, {
          animate: true,
          duration: 1
        });
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mapInstance]);

  // Effect per zoom sulla centrale selezionata
  useEffect(() => {
    if (mapInstance && activePlant) {
      const plant = hydroplants.find(p => p.id === activePlant);
      if (plant) {
        mapInstance.setView(plant.coordinates, 12, {
          animate: true,
          duration: 1
        });
      }
    }
  }, [activePlant, mapInstance]);

  // Caricamento dei layer quando cambia la centrale attiva
  useEffect(() => {
    if (activePlant) {
      loadPlantLayers(activePlant);
    }
  }, [activePlant, loadPlantLayers]);

  // Filtraggio delle centrali
  const filteredPlants = hydroplants.filter(plant => {
    const matchesFilter = activeFilter === 'all' || plant.type === activeFilter;
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Gestione click sui pulsanti
  const handleHistoricalClick = (plantId) => {
    setCurrentPage({ page: 'historical', plantId: plantId });
  };

  const handleTourClick = (plantId) => {
    setCurrentPage({ page: '360', plantId: plantId });
  };

  const handleModelClick = (plantId) => {
    setCurrentPage({ page: 'bim', plantId: plantId, viewMode: 'viewer' });
  };

  // Colori per il grafico radar
  const CHART_COLORS = {
    'A bacino': '#3b82f6',
    'Ad acqua fluente': '#10b981',
    'Ad accumulo': '#8b5cf6',
    'A derivazione': '#007684ff'
  };

  // Categorizzazione dei layer per una migliore organizzazione
  const layerCategories = {
    'Infrastruttura': ['Opere lineari', 'Opere puntuali', 'Catasto'],
    'Contesto': ['Core zone UNESCO', 'MaB UNESCO', 'Valle Po', 'Bacino idrografico', 'Punti interesse']
  };

  // Rendering della legenda migliorata con categorizzazione
  const renderLegend = () => {
    const currentLayers = (activePlant && geoJSONLayers[activePlant]) ? geoJSONLayers[activePlant] : {};

    return (
      <div className="layer-section">
        <div className="layer-header">
          <h3>Layer Control</h3>
          {loadingLayers && (
            <div className="loading-spinner">
              <div className="spinner-icon">⟳</div>
            </div>
          )}
        </div>
        
        {loadingLayers && (
          <div className="loading-indicator">
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <span className="loading-text">🔄 Caricamento layer...</span>
          </div>
        )}

        {Object.keys(layerErrors).length > 0 && (
          <div className="error-summary">
            <details>
              <summary>⚠️ Errori di caricamento ({Object.keys(layerErrors).length})</summary>
              <div className="error-list">
                {Object.entries(layerErrors).map(([layer, error]) => (
                  <div key={layer} className="error-item">
                    <strong>{layer}:</strong> {error}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        <div className="layer-list">
          {/* Marker della centrale - sempre in cima */}
          {filteredPlants.length > 0 && (
            <div className="layer-category">
              <div 
                className={`layer-item primary-layer ${plantVisible ? 'active' : ''}`}
                onClick={() => setPlantVisible(prev => !prev)}
              >
                <div className="layer-info">
                  <div className="legend-marker turbine-legend" 
                       dangerouslySetInnerHTML={{ __html: turbineSVG }} />
                  <span className="layer-name">Centrale idroelettrica</span>
                  <span className="layer-count">({filteredPlants.length})</span>
                </div>
              </div>
            </div>
          )}

          {/* Layer GeoJSON organizzati per categoria */}
          {currentLayers ? (
            <div className="layer-categories">
              {Object.entries(layerCategories).map(([categoryName, categoryLayers]) => {
                // Filtra i layer di questa categoria che sono effettivamente caricati
                const availableLayers = Object.entries(currentLayers)
                  .filter(([layerKey, layer]) => 
                    categoryLayers.some(catLayer => layer.fileName === catLayer)
                  )
                  .sort((a, b) => b[1].config.zIndex - a[1].config.zIndex);

                if (availableLayers.length === 0) return null;

                return (
                  <div key={categoryName} className="layer-category">
                    <div className="category-header">
                      <h4>{categoryName}</h4>
                      <span className="category-count">({availableLayers.length})</span>
                    </div>
                    
                    {availableLayers.map(([layerKey, layer]) => {
                      const isVisible = layerVisibility[layerKey];
                      const layerType = layer.config.type;
                      
                      return (
                        <div 
                          key={layerKey} 
                          className={`layer-item ${isVisible ? 'active' : 'inactive'} layer-type-${layerType}`}
                          onClick={() => {
                            setLayerVisibility(prev => ({
                              ...prev,
                              [layerKey]: !prev[layerKey]
                            }));
                          }}
                        >
                          <div className="layer-info">
                            <div 
                              className={`legend-${layer.config.type}`} 
                              style={{
                                backgroundColor: layer.config.style.fillColor || layer.config.style.color,
                                borderColor: layer.config.style.color,
                                opacity: isVisible ? 1 : 0.3,
                                borderStyle: layer.config.style.dashArray ? 'dashed' : 'solid'
                              }}
                            />
                            <span className="layer-name">{layer.displayName}</span>
                            <span className="layer-count">({layer.featureCount})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : activePlant ? (
            <div className="no-layers-message">
              <div className="message-icon">📭</div>
              <span>Nessun layer disponibile per questa centrale</span>
              <small>Verifica che i file GeoJSON siano presenti</small>
            </div>
          ) : (
            <div className="no-selection-message">
              <div className="message-icon">👆</div>
              <span>Seleziona una centrale per visualizzare i layer</span>
              <small>Clicca su un marker della mappa</small>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="map-page-container">
      <div className="map-container">
        <MapContainer 
          center={centerMap} 
          zoom={7} 
          scrollWheelZoom={true}
        >
          <MapController onMapReady={setMapInstance} />
          <TileLayer
            url={mapStyles[currentMapStyle].url}
            attribution={mapStyles[currentMapStyle].attribution}
          />
          
          <GpsTracker isTracking={isTracking} />

          {/* Markers delle centrali */}
          {plantVisible && filteredPlants.map(plant => (
            <Marker 
              key={plant.id} 
              position={plant.coordinates}
              icon={turbineIcon}
              eventHandlers={{
                click: () => {
                  setActivePlant(plant.id);
                }
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h3>Centrale di {plant.name}</h3>
                  <table className="plant-details">
                    <tbody>
                      <tr><td><strong>Tipo:</strong></td><td>{plant.type}</td></tr>
                      <tr><td><strong>Potenza:</strong></td><td>{plant.power}</td></tr>
                      <tr><td><strong>Portata:</strong></td><td>{plant.waterflow}</td></tr>
                      <tr><td><strong>Salto:</strong></td><td>{plant.jump}</td></tr>
                      <tr><td><strong>Macchinari:</strong></td><td>{plant.machine}</td></tr>
                    </tbody>
                  </table>
                  <div className="plant-description">{plant.description}
                    <div className="popup-actions">
                      <button className="popup-button" onClick={() => handleHistoricalClick(plant.id)}>
                        Scopri di più
                      </button>
                      <button className="popup-button" onClick={() => handleTourClick(plant.id)}>
                        Virtual tour
                      </button>
                      <button className="popup-button" onClick={() => handleModelClick(plant.id)}>
                        Modello
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Layer GeoJSON renderizzati in ordine di z-index */}
          {activePlant && geoJSONLayers[activePlant] && 
            Object.entries(geoJSONLayers[activePlant] || {})
              .sort((a, b) => a[1].config.zIndex - b[1].config.zIndex)
              .map(([layerKey, layer]) => {
                const isVisible = layerVisibility[layerKey];
                if (!isVisible) return null;
                console.log(`🔍 Rendering layer: ${layerKey} (${layer.featureCount} features)`);
                return (
                  <GeoJSON
                    key={layerKey}
                    data={layer.data}
                    pointToLayer={(feature, latlng) => pointToLayer(feature, latlng, layer.config)}
                    style={(feature) => createLayerStyle(layer.config, feature)}
                    onEachFeature={onEachFeature}
                  />
                );
              })}
        </MapContainer>
      </div>

      <div className="map-control-panel">
        <h2>Hydropower Park</h2>

        <div className="gps-control">
          <h3>GPS Tracking</h3>
          <button className={`gps-button ${isTracking ? 'active' : ''}`} onClick={toggleTracking}>
            {isTracking ? '❌ Disattiva GPS' : '🔍 Attiva GPS'}
          </button>
        </div>

        <div className="search-box">
          <h3>Search Plants</h3>
          <input
            type="text"
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <h3>Filter by Type</h3>
          <div className="filter-buttons">
            <button 
              className={activeFilter === 'all' ? 'active' : ''} 
              onClick={() => setActiveFilter('all')}
            >
              Tutti gli impianti
            </button>
            <button 
              className={activeFilter === 'A bacino' ? 'active' : ''} 
              onClick={() => setActiveFilter('A bacino')}
            >
              A bacino
            </button>
            <button 
              className={activeFilter === 'Ad acqua fluente' ? 'active' : ''} 
              onClick={() => setActiveFilter('Ad acqua fluente')}
            >
              Ad acqua fluente
            </button>
            <button 
              className={activeFilter === 'Ad accumulo' ? 'active' : ''} 
              onClick={() => setActiveFilter('Ad accumulo')}
            >
              Ad accumulo
            </button>
            <button 
              className={activeFilter === 'A derivazione' ? 'active' : ''} 
              onClick={() => setActiveFilter('A derivazione')}
            >
              A derivazione
            </button>
          </div>
        </div>

        {/* Legenda delle infrastrutture */}
        {renderLegend()}

        {/* Grafico radar */}
        <div className="radar-section">
          <HydroRadarChart 
            plants={filteredPlants} 
            COLORS={filteredPlants.map(plant => CHART_COLORS[plant.type])} 
          />
        </div>

        {/* Sezione risultati */}
        <div className="results-section">
          <h3>{filteredPlants.length} plants found:</h3>
          <ul className="plants-list">
            {filteredPlants.map(plant => (
              <li key={plant.id} style={{ color: CHART_COLORS[plant.type] }}>
                {plant.name} - {plant.type}
              </li>
            ))}
          </ul>
        </div>

        <div className="map-style-section">
          <h3>Map Style</h3>
          <div className="map-style-selector">
            {Object.entries(mapStyles).map(([key, style]) => (
              <button
                key={key}
                className={`style-button ${currentMapStyle === key ? 'active' : ''}`}
                onClick={() => setCurrentMapStyle(key)}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;