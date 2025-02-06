import React, { useState, useEffect } from 'react';
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

// Stili dei layer
const layerStyles = {
  coverage: {
    color: 'orange',
    weight: 2,
    opacity: 0.8,
    fillColor: '#FFA500',
    fillOpacity: 0.3
  },
  line: {
    color: 'yellow',
    weight: 3,
    opacity: 0.8
  },
  point: {
    radius: 5,
    fillColor: "red",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  },
  area: {
    color: "purple",
    weight: 2,
    opacity: 0.8,
    fillColor: "#800080",
    fillOpacity: 0.3
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

  // Caricamento dei layer GeoJSON
  const loadPlantLayers = async (plantId) => {
    const plant = hydroplants.find(p => p.id === plantId);
    if (!plant) return;

    try {
      const layers = {};
      const plantFolder = plant.name.toLowerCase();
      const basePath = '/geoData';
      
      const filesToTry = [
        { name: 'Bacino idrografico.geojson', type: 'coverage' },  
        { name: 'Catasto.geojson', type: 'area' },
        { name: 'Infrastruttura lineare.geojson', type: 'line' },
        { name: 'Opere puntuali.geojson', type: 'point' },
        { name: 'Percorso ciclabile.geojson', type: 'point' }       
      ];

      for (const file of filesToTry) {
        try {
          const response = await fetch(`${basePath}/${plantFolder}/${file.name}`);
          if (response.ok) {
            const data = await response.json();
            const layerKey = `${plant.name}-${file.name.split('.')[0]}`;

            layers[layerKey] = {
              data,
              name: file.name.split('.')[0].replace(/-/g, ' '),
              style: layerStyles[file.type],
              type: file.type
            };

            setLayerVisibility(prev => ({
              ...prev,
              [layerKey]: true
            }));
          }
        } catch (error) {
          console.log(`Error loading ${file.name}:`, error);
        }
      }

      setGeoJSONLayers(prev => ({
        ...prev,
        [plantId]: layers
      }));

    } catch (error) {
      console.error('Error loading GeoJSON layers:', error);
    }
  };

  // Gestione degli eventi ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && mapInstance) {
        setActivePlant(null);
        setGeoJSONLayers({});
        setLayerVisibility({});
        setPlantVisible(true);
        
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
  }, [activePlant]);

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
    setCurrentPage({ page: '360', plantId: plantId});
  };

  const handleModelClick = (plantId) => {
    setCurrentPage({ page: 'bim', plantId: plantId, viewMode: 'viewer' });
  };

  // Colori per il grafico radar
  const CHART_COLORS = {
    'A bacino': '#3b82f6',
    'Ad acqua fluente': '#10b981',
    'Ad accumulo': '#8b5cf6'
  };

  // Rendering della legenda
  const renderLegend = () => (
    <div className="layer-section">
      <h3>Infrastructure Layers Legend</h3>
      <div className="layer-list">
        {/* Hydroelectric Plant marker - sempre in cima */}
        {filteredPlants.length > 0 && (
          <div 
            className={`layer-item ${plantVisible ? 'active' : ''}`}
            onClick={() => setPlantVisible(prev => !prev)}
          >
            <div className="layer-info">
              <div className="legend-marker" dangerouslySetInnerHTML={{ __html: turbineSVG }} />
              <span className="layer-name">Hydroelectric Plant</span>
            </div>
          </div>
        )}
  
        {/* Layer GeoJSON - renderizzati in ordine dal basso verso l'alto */}
        {activePlant && geoJSONLayers[activePlant] && ['point', 'line', 'area', 'coverage'].map(type => {
          const layerEntry = Object.entries(geoJSONLayers[activePlant])
            .find(([_, layer]) => layer.type === type);
          
          if (!layerEntry) return null;
          const [key, layer] = layerEntry;
          
            return (
              <div 
                key={key} 
                className={`layer-item ${layerVisibility[key] ? 'active' : ''}`}
                onClick={() => {
                  setLayerVisibility(prev => ({
                    ...prev,
                    [key]: !prev[key]
                  }));
                }}
              >
                <div className="layer-info">
                  <div 
                    className={`legend-${layer.type}`} 
                    style={{
                      ...(layer.type === 'point' ? {
                        backgroundColor: layerStyles.point.fillColor,
                        border: `2px solid ${layerStyles.point.color}`,
                        opacity: layerStyles.point.fillOpacity
                      } : layer.type === 'line' ? {
                        backgroundColor: layerStyles.line.color,
                        opacity: layerStyles.line.opacity
                      } : {
                        backgroundColor: layer.style.fillColor,
                        opacity: layer.style.fillOpacity,
                        border: `2px solid ${layer.style.color}`
                      })
                    }}
                  />
                  <span className="layer-name">{layer.name}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

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
                    <div className="popup-actions-button">
                      <button onClick={() => handleHistoricalClick(plant.id)}>
                        Scopri di più
                      </button>
                    </div>
                      <div className="popup-actions-button">
                      <button onClick={() => handleTourClick(plant.id)}>
                        Virtual tour
                      </button>
                    </div>
                    <div className="popup-actions-button">
                      <button onClick={() => handleModelClick(plant.id)}>
                        Modello
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Layer GeoJSON */}
          {activePlant && geoJSONLayers[activePlant] && 
            Object.entries(geoJSONLayers[activePlant]).map(([key, layer]) => (
              layerVisibility[key] && (
                <GeoJSON
                  key={key}
                  data={layer.data}
                  pointToLayer={(feature, latlng) => {
                    if (layer.type === 'point') {
                      return L.circleMarker(latlng, layer.style);
                    }
                    return L.marker(latlng);
                  }}
                  style={layer.style}
                  onEachFeature={(feature, layer) => {
                    if (feature.properties) {
                      const popupContent = `
                        <div class="popup-content">
                          <h3>${feature.properties.name || 'Dettagli'}</h3>
                          <table class="plant-details">
                            <tbody>
                              ${Object.entries(feature.properties)
                                .map(([key, value]) => `
                                  <tr>
                                    <td><strong>${key}:</strong></td>
                                    <td>${value}</td>
                                  </tr>
                                `)
                                .join('')}
                            </tbody>
                          </table>
                        </div>
                      `;
                      layer.bindPopup(popupContent, {
                        maxWidth: 400,
                        className: 'custom-popup'
                      });
                    }
                  }}
                />
              )
            ))}
        </MapContainer>
      </div>

      <div className="map-control-panel">
        <h2>Hydropower Park</h2>

        <div className="gps-control">
          <h3>GPS Tracking</h3>
          <button className={`gps-button ${isTracking ? 'active' : ''}`} onClick={toggleTracking}>
            {isTracking ? '❌ Disattiva GPS' : '📍 Attiva GPS'}
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