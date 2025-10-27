import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, Circle } from 'react-leaflet';
import { hydroplants } from '../data/HydroData';
import GpsTracker from '../components/map/GpsTraker';
import HydroRadarChart from '../components/map/HydroRadarChart';
import MapAnnotations from '../components/map/MapAnnotation';
import AnnotationToolbar from '../components/map/AnnotationToolbar';

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
  cycle: {
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: 'Cycle'
  },
  satelliteEsri: {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri and the GIS User Community',
  name: 'Satellite'
}
};

// Colori e configurazione centrali europee
const EU_PLANT_COLORS = {
  'HDAM': '#00d5ffff',  // Bacino 
  'HROR': '#00ffb7ff',  // Acqua fluente
  'HPHS': '#3300ffff'   // Accumulo
};

const EU_PLANT_TYPES = {
  'HDAM': 'A bacino',
  'HROR': 'Ad acqua fluente',
  'HPHS': 'Ad accumulo'
};

// Configurazione layer con metadati migliorati
const LAYER_CONFIG = {
  'Valle Po': {
    type: 'coverage',
    displayName: 'Valle Po',
    style: {
      color: '#ffa600ff',
      weight: 2,
      opacity: 0.8,
      fillColor: '#ffa600ff',
      fillOpacity: 0.2
    },
    zIndex: 1
  },
  'Catasto': {
    type: 'plots',
    displayName: 'Particelle catastali',
    style: {
      color: '#9c9200ff',
      weight: 2,
      opacity: 0.8,
      fillColor: '#9c9200ff',
      fillOpacity: 0.3
    },
    zIndex: 2
  },
  'Bacino idrografico': {
    type: 'rivers',
    displayName: 'Bacino idrografico',
    style: {
      color: '#0096a7ff',
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
      weight: 4,
      opacity: 0.9
    },
    zIndex: 4
  },
  'Opere puntuali': {
    type: 'works',
    displayName: 'Opere puntuali',
    style: {
      radius: 6,
      fillColor: '#FFF000',
      color: '#9c9200ff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    },
    zIndex: 5
  },
  'MaB UNESCO': {
    type: 'unesco_buffer',
    displayName: 'MaB UNESCO',
    style: {
      color: '#66c474ff',
      weight: 2,
      opacity: 0.8,
      fillColor: '#66c474ff',
      fillOpacity: 0.15,
    },
    zIndex: 6
  },
  'Core zone UNESCO': {
    type: 'unesco_core',
    displayName: 'Core zone UNESCO',
    style: {
      color: '#871616ff',
      weight: 3,
      opacity: 0.9,
      fillColor: '#871616ff',
      fillOpacity: 0.25,
    },
    zIndex: 7
  },
  'Punti interesse': {
    type: 'poi',
    displayName: 'Punti di interesse',
    style: {
      radius: 6,
      fillColor: '#66c474ff',
      color: "#004406ff",
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
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
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

// Componente Circle con radius dinamico in base allo zoom e alla potenza
const DynamicCircle = ({ center, type, capacity, children, ...props }) => {
  const map = useMap();
  const [radius, setRadius] = useState(200);

  useEffect(() => {
    const updateRadius = () => {
      const zoom = map.getZoom();
      
      // Calcola il moltiplicatore basato sulla potenza
      let powerMultiplier = 1;
      
      if (capacity && capacity > 0) {
        // Usa scala logaritmica con range molto più ampio per differenze marcate
        // Potenze tipiche: 1 MW - 2000 MW
        const logCapacity = Math.log10(Math.max(capacity, 1));
        const minLog = 0; // log10(1) = 0
        const maxLog = Math.log10(2000); // ~3.3
        
        // Mappa su range 0.25 - 4.5 per differenze molto visibili
        // Centrali piccole (<10 MW): 0.25x - 0.6x
        // Centrali medie (10-100 MW): 0.6x - 1.8x
        // Centrali grandi (100-500 MW): 1.8x - 3.2x
        // Centrali molto grandi (>500 MW): 3.2x - 4.5x
        powerMultiplier = 0.25 + ((logCapacity - minLog) / (maxLog - minLog)) * 4.25;
        powerMultiplier = Math.max(0.25, Math.min(4.5, powerMultiplier));
      }
      
      // Formula base: più zoom è basso, più il radius è grande
      let baseRadius;
      if (zoom <= 5) {
        baseRadius = 10000;
      } else if (zoom <= 6) {
        baseRadius = 5000;
      } else if (zoom <= 7) {
        baseRadius = 2000;
      } else if (zoom <= 8) {
        baseRadius = 1000;
      } else if (zoom <= 9) {
        baseRadius = 500;
      } else if (zoom <= 10) {
        baseRadius = 300;
      } else if (zoom <= 11) {
        baseRadius = 200;
      } else {
        baseRadius = 150;
      }
      
      // Applica il moltiplicatore di potenza
      const newRadius = baseRadius * powerMultiplier;
      setRadius(newRadius);
    };

    // Aggiorna radius al mount
    updateRadius();
    
    // Aggiorna radius quando cambia lo zoom
    map.on('zoomend', updateRadius);
    
    return () => {
      map.off('zoomend', updateRadius);
    };
  }, [map, capacity]);

  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        fillColor: EU_PLANT_COLORS[type],
        fillOpacity: 0.3,
        color: EU_PLANT_COLORS[type],
        weight: 1,
        opacity: 0.9
      }}
      {...props}
    >
      {children}
    </Circle>
  );
};

const centerMap = [44.4, 7.5];

function MapPage({ setCurrentPage }) {
  // Stati esistenti
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMapStyle, setCurrentMapStyle] = useState('satelliteEsri');
  const [activePlant, setActivePlant] = useState(null);
  const [plantVisible, setPlantVisible] = useState(true);
  const [geoJSONLayers, setGeoJSONLayers] = useState({});
  const [layerVisibility, setLayerVisibility] = useState({});
  const [mapInstance, setMapInstance] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loadingLayers, setLoadingLayers] = useState(false);
  const [layerErrors, setLayerErrors] = useState({});

  // NUOVI Stati per centrali europee
  const [europeanPlants, setEuropeanPlants] = useState([]);
  const [euPlantsVisible, setEuPlantsVisible] = useState(true);
  const [euLoadingError, setEuLoadingError] = useState(null);
  const [euCountryFilter, setEuCountryFilter] = useState('all');
  const [euTypeFilters, setEuTypeFilters] = useState({
    'HDAM': true,
    'HROR': true,
    'HPHS': true
  });
  const [euMinPower, setEuMinPower] = useState(3);
  const [availableCountries, setAvailableCountries] = useState([]);

  // NUOVI STATI annotazioni
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showMyAnnotations, setShowMyAnnotations] = useState(false);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);

  // ⭐ NUOVI STATI per sezioni espandibili
  const [expandedSections, setExpandedSections] = useState({
    interactive: false,
    italian: false,
    european: false
  });

  // Funzione toggle per sezioni
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Funzione per pulire i nomi dalle virgolette escapate
  const cleanString = (str) => {
    if (!str) return '';
    return str.toString().replace(/^"|"$/g, '').trim();
  };

  // AGGIUNGI QUESTO NUOVO useEffect:
  // Ripristina lo stato della mappa quando si torna indietro
  useEffect(() => {
    const savedState = sessionStorage.getItem('mapPageState');
    if (savedState && mapInstance) {
      try {
        const mapState = JSON.parse(savedState);
        // Verifica che lo stato sia recente (max 1 ora)
        if (Date.now() - mapState.timestamp < 3600000) {
          // Imposta la centrale attiva
          setActivePlant(mapState.plantId);
          
          // Centra la mappa sulla centrale con zoom
          setTimeout(() => {
            mapInstance.setView(mapState.center, mapState.zoom || 14);
            
            // Trova e apri il popup del marker
            mapInstance.eachLayer((layer) => {
              if (layer instanceof L.Marker) {
                const position = layer.getLatLng();
                if (position.lat === mapState.center[0] && position.lng === mapState.center[1]) {
                  layer.openPopup();
                }
              }
            });
          }, 100);
          
          // Pulisci lo stato salvato
          sessionStorage.removeItem('mapPageState');
        }
      } catch (error) {
        console.error('Errore nel ripristino dello stato della mappa:', error);
        sessionStorage.removeItem('mapPageState');
      }
    }
  }, [mapInstance]);

  // Caricamento centrali europee
  useEffect(() => {
    const loadEuropeanPlants = async () => {
      try {
        const response = await fetch('/geoData/centraliEU.geojson');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.features) {
          throw new Error('Formato GeoJSON non valido');
        }

        // Processa e pulisci i dati
        const plants = data.features.map((feature, index) => {
          const props = feature.properties;
          
          // Prova TUTTE le possibili varianti
          let capacity = props['"installed_capacity_MW"'] || 
                        props['installed_capacity_MW'] || 
                        props.installed_capacity_MW || 
                        props.capacity ||
                        props.Capacity ||
                        props.CAPACITY ||
                        props['Installed Capacity (MW)'] ||
                        props['Installed_Capacity_MW'] ||
                        props.power ||
                        props.Power || 0;
          
          // Converti in numero
          capacity = parseFloat(capacity) || 0;
          
          return {
            id: cleanString(props['"id"'] || props.id || index),
            name: cleanString(props['"name"'] || props.name || 'Unknown'),
            capacity: capacity,
            pumping: parseFloat(props['"pumping_MW"'] || props.pumping_MW) || 0,
            type: cleanString(props['"type"'] || props.type || 'HDAM'),
            country: cleanString(props['"country_code"'] || props.country_code || 'XX'),
            lat: parseFloat(props['"lat"'] || props.lat || 0),
            lon: parseFloat(props['"lon"'] || props.lon || 0),
            damHeight: parseFloat(props['"dam_height_m"'] || props.dam_height_m) || 0,
            volume: parseFloat(props['"volume_Mm3"'] || props.volume_Mm3) || 0,
            storage: parseFloat(props['"storage_capacity_MWh"'] || props.storage_capacity_MWh) || 0,
            generation: parseFloat(props['"avg_annual_generation_GWh"'] || props.avg_annual_generation_GWh) || 0,
            coordinates: feature.geometry.coordinates
          };
        });

        setEuropeanPlants(plants);

        // Estrai paesi unici
        const countries = [...new Set(plants.map(p => p.country))].sort();
        setAvailableCountries(countries);

      } catch (error) {
        console.error('Errore caricamento centrali europee:', error);
        setEuLoadingError(error.message);
      }
    };

    loadEuropeanPlants();
  }, []);

  // Filtraggio centrali europee
  const filteredEuropeanPlants = europeanPlants.filter(plant => {
    // Filtro paese
    if (euCountryFilter !== 'all' && plant.country !== euCountryFilter) {
      return false;
    }

    // Filtro tipo
    if (!euTypeFilters[plant.type]) {
      return false;
    }

    // Filtro potenza minima
    if (plant.capacity < euMinPower) {
      return false;
    }

    return true;
  });

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
    
    return baseStyle;
  }, []);

  // Caricamento dei layer GeoJSON
  const loadPlantLayers = useCallback(async (plantId) => {
    const plant = hydroplants.find(p => p.id === plantId);
    if (!plant) {
      return;
    }

    setLoadingLayers(true);
    setLayerErrors({});

    try {
      const layers = {};
      const errors = {};
      const plantFolder = plant.name.toLowerCase().replace(/\s+/g, '-');
      const basePath = '/geoData';
      
      const layersToLoad = Object.entries(LAYER_CONFIG).sort((a, b) => a[1].zIndex - b[1].zIndex);

      for (const [fileName, config] of layersToLoad) {
        try {
          const response = await fetch(`${basePath}/${plantFolder}/${fileName}.geojson`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
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

          setLayerVisibility(prev => ({
            ...prev,
            [layerKey]: true
          }));

        } catch (error) {
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
  const onEachFeature = useCallback((feature, layer, layerConfig) => {
    if (feature.properties && Object.keys(feature.properties).length > 0) {
      const props = feature.properties;
      
      let imagePath = null;
      
      if (props.image || props.foto || props.img || props.picture) {
        imagePath = props.image || props.foto || props.img || props.picture;
      } else if ((props.name || props.nome) && layerConfig?.type === 'poi') {
        const fileName = (props.name || props.nome)
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        imagePath = `/images/poi/${fileName}.jpg`;
      }
      
      const popupContent = `
        <div class="popup-content ${layerConfig?.type === 'poi' ? 'poi-popup' : ''}">
          ${imagePath ? `
            <div class="popup-image-container">
              <img 
                src="${imagePath}" 
                alt="${props.name || props.nome || 'Punto di interesse'}"
                class="popup-image"
                onerror="this.parentElement.style.display='none'"
              />
            </div>
          ` : ''}
          
          <h3>${props.name || props.nome || 'Dettagli Feature'}</h3>
          
          ${props.description || props.descrizione ? `
            <div class="popup-description">
              ${props.description || props.descrizione}
            </div>
          ` : ''}
          
          <div class="popup-table-container">
            <table class="plant-details">
              <tbody>
                ${Object.entries(props)
                  .filter(([key, value]) => 
                    value !== null && 
                    value !== undefined && 
                    value !== '' &&
                    !['name', 'nome', 'description', 'descrizione', 'image', 'foto', 'img', 'picture'].includes(key)
                  )
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
        className: `custom-popup ${layerConfig?.type === 'poi' ? 'poi-custom-popup' : ''}`
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
        
        mapInstance.setView(centerMap, 5, {
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

  // AGGIUNGI QUESTA NUOVA FUNZIONE:
  // Funzione per salvare lo stato della mappa prima di navigare
  const saveMapState = (plantId) => {
    if (mapInstance && plantId) {
      const plant = hydroplants.find(p => p.id === plantId);
      if (plant) {
        const mapState = {
          plantId: plantId,
          center: plant.coordinates,
          zoom: mapInstance.getZoom(),
          timestamp: Date.now()
        };
        sessionStorage.setItem('mapPageState', JSON.stringify(mapState));
      }
    }
  };

  // Gestione click sui pulsanti
  const handleHistoricalClick = (plantId) => {
    saveMapState(plantId);  // ✅ Salva stato
    setCurrentPage({ page: 'historical', plantId: plantId });
  };

  const handleTourClick = (plantId) => {
    saveMapState(plantId);  // ✅ Salva stato
    setCurrentPage({ page: '360', plantId: plantId });
  };

  const handleModelClick = (plantId) => {
    saveMapState(plantId);  // ✅ Salva stato
    setCurrentPage({ page: 'bim', plantId: plantId, viewMode: 'viewer' });
  };

  const handleProjectsClick = (plantId) => {
    saveMapState(plantId);  // ✅ Salva stato
    setCurrentPage({ page: 'Community-Hub', plantId: plantId });
  };


  // Colori per il grafico radar
  const CHART_COLORS = {
    'A bacino': '#3b82f6',
    'Ad acqua fluente': '#10b981',
    'Ad accumulo': '#8b5cf6',
  };

  // Categorizzazione dei layer
  const layerCategories = {
    'Infrastruttura': ['Opere lineari', 'Opere puntuali', 'Catasto'],
    'Territorio': ['Core zone UNESCO', 'MaB UNESCO', 'Valle Po', 'Bacino idrografico', 'Punti interesse']
  };

  // ⭐ NUOVA FUNZIONE: Rendering sezione Strumenti Interattivi
  const renderInteractiveToolsSection = () => {
    return (
      <div className="control-section">
        <div className="section-header" onClick={() => toggleSection('interactive')}>
          <h3>🛠️ Strumenti Interattivi</h3>
          <div className="section-header-controls">
            <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={showAnnotations}
                onChange={(e) => setShowAnnotations(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className={`section-arrow ${expandedSections.interactive ? 'expanded' : ''}`}>▼</span>
          </div>
        </div>

        {expandedSections.interactive && (
          <div className="section-content">
            {/* Stile mappa */}
            <div className="map-style-section">
              <h4>Stile mappa</h4>
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

            {/* GPS Tracker */}
            <div className="gps-control">
              <h4>Qui sei tu!</h4>
              <button className={`gps-button ${isTracking ? 'active' : ''}`} onClick={toggleTracking}>
                {isTracking ? '❌ Disattiva GPS' : '📍 Attiva GPS'}
              </button>
            </div>

            {/* Annotazioni */}
            <div className="annotation-control">
              <h4>Strumenti di Annotazione</h4>
              <AnnotationToolbar
                onToggleAnnotationMode={() => setIsAnnotationMode(!isAnnotationMode)}
                isAnnotationMode={isAnnotationMode}
                onToggleAnnotationsVisibility={() => setShowAnnotations(!showAnnotations)}
                showAnnotations={showAnnotations}
                onToggleMyAnnotations={() => setShowMyAnnotations(!showMyAnnotations)}
                showMyAnnotations={showMyAnnotations}
                activePlant={activePlant}
                plantData={activePlant ? hydroplants.find(p => p.id === activePlant) : null}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ⭐ NUOVA FUNZIONE: Rendering legenda layer
  const renderLayerLegend = () => {
    const currentLayers = (activePlant && geoJSONLayers[activePlant]) ? geoJSONLayers[activePlant] : {};

    return (
      <div className="layer-section">
        <div className="layer-header">
          <h4>Controllo Layer</h4>
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

        <div className="layer-list">
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

          {currentLayers ? (
            <div className="layer-categories">
              {Object.entries(layerCategories).map(([categoryName, categoryLayers]) => {
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
              <div className="message-icon">🔭</div>
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

  // ⭐ NUOVA FUNZIONE: Rendering sezione Centrali Italiane
  const renderItalianPlantsSection = () => {
    return (
      <div className="control-section">
        <div className="section-header" onClick={() => toggleSection('italian')}>
          <h3>💧 Parco SIED</h3>
          <div className="section-header-controls">
            <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={plantVisible}
                onChange={(e) => setPlantVisible(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className={`section-arrow ${expandedSections.italian ? 'expanded' : ''}`}>▼</span>
          </div>
        </div>

        {expandedSections.italian && (
          <div className="section-content">
            {/* Ricerca */}
            <div className="search-box">
              <h4>Cerca una centrale</h4>
              <input
                type="text"
                placeholder="Cerca centrali..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtri per tipo */}
            <div className="filter-section">
              <h4>Filtra per tipo</h4>
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

            {/* Legenda Layer */}
            {renderLayerLegend()}

            {/* Grafico radar */}
            <div className="radar-section">
              <h4>Confronto Centrali</h4>
              <HydroRadarChart 
                plants={filteredPlants} 
                COLORS={filteredPlants.map(plant => CHART_COLORS[plant.type])} 
              />
            </div>

            {/* Risultati */}
            <div className="results-section">
              <details className="results-dropdown">
                <summary className="results-summary">
                  <h4>{filteredPlants.length} centrali trovate</h4>
                  <span className="dropdown-arrow">▼</span>
                </summary>
                <ul className="plants-list">
                  {filteredPlants.map(plant => (
                    <li key={plant.id} style={{ color: CHART_COLORS[plant.type] }}>
                      {plant.name} - {plant.type}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ⭐ NUOVA FUNZIONE: Rendering sezione Centrali Europee
  const renderEuropeanPlantsSection = () => {
    return (
      <div className="control-section">
        <div className="section-header" onClick={() => toggleSection('european')}>
          <h3>🌍 Grandi Derivazioni Europee</h3>
          <div className="section-header-controls">
            <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={euPlantsVisible}
                onChange={(e) => setEuPlantsVisible(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className={`section-arrow ${expandedSections.european ? 'expanded' : ''}`}>▼</span>
          </div>
        </div>

        {euLoadingError && (
          <div className="error-message">
            ⚠️ Errore caricamento: {euLoadingError}
          </div>
        )}

        {expandedSections.european && euPlantsVisible && europeanPlants.length > 0 && (
          <div className="section-content">
            <div className="european-controls">
              {/* Filtro paese */}
              <div className="filter-group">
                <label>Filtra per paese:</label>
                <select 
                  value={euCountryFilter} 
                  onChange={(e) => setEuCountryFilter(e.target.value)}
                  className="country-select"
                >
                  <option value="all">Tutti i paesi ({availableCountries.length})</option>
                  {availableCountries.map(country => {
                    const count = europeanPlants.filter(p => p.country === country).length;
                    return (
                      <option key={country} value={country}>
                        {country} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Filtro tipo */}
              <div className="filter-group">
                <label>Filtra per tipo:</label>
                <div className="type-checkboxes">
                  {Object.entries(EU_PLANT_TYPES).map(([typeCode, typeName]) => (
                    <label key={typeCode} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={euTypeFilters[typeCode]}
                        onChange={(e) => setEuTypeFilters(prev => ({
                          ...prev,
                          [typeCode]: e.target.checked
                        }))}
                      />
                      <span 
                        className="type-indicator"
                        style={{ backgroundColor: EU_PLANT_COLORS[typeCode] }}
                      ></span>
                      {typeName}
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro potenza */}
              <div className="filter-group">
                <label>
                  Filtra per potenza minima: {euMinPower} MW
                </label>
                <input
                  type="range"
                  min="3"
                  max="500"
                  step="1"
                  value={euMinPower}
                  onChange={(e) => setEuMinPower(Number(e.target.value))}
                  className="power-slider"
                />
                <div className="slider-labels">
                  <span>3 MW</span>
                  <span>250 MW</span>
                  <span>500 MW</span>
                </div>
              </div>

              {/* Contatore */}
              <div className="plants-counter">
                <strong>📊 Centrali visibili:</strong>
                <span className="counter-value">
                  {filteredEuropeanPlants.length.toLocaleString()} / {europeanPlants.length.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="map-page-container">
      <div className="map-container">
        <MapContainer
          center={centerMap}
          zoom={4}
          className="leaflet-map"
          zoomControl={true}
        >
          <MapController onMapReady={setMapInstance} />
          
          <TileLayer
            url={mapStyles[currentMapStyle].url}
            attribution={mapStyles[currentMapStyle].attribution}
          />

          {isTracking && <GpsTracker isTracking={isTracking} />}

          {/* Centrali italiane */}
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
                  <h3>{plant.name}</h3>
                  
                  <div className="popup-body">
                    {plant.image && (
                      <div className="popup-image-container">
                        <img 
                          src={plant.image} 
                          alt={plant.name}
                          className="popup-image"
                        />
                      </div>
                    )}
                    
                    <div className="popup-actions">
                      <button className="popup-button" onClick={() => handleHistoricalClick(plant.id)}>
                        Storia
                      </button>
                      <button className="popup-button" onClick={() => handleTourClick(plant.id)}>
                        Virtual Tour
                      </button>
                      <button className="popup-button" onClick={() => handleModelClick(plant.id)}>
                        Modello
                      </button>
                      <button className="popup-button" onClick={() => handleProjectsClick(plant.id)}>
                        Progetti
                      </button>
                    </div>
                  </div>
                  
                  <table className="plant-details">
                    <tbody>
                      <tr><td><strong>Tipo:</strong></td><td>{plant.type}</td></tr>
                      <tr><td><strong>Potenza:</strong></td><td>{plant.power}</td></tr>
                      <tr><td><strong>Portata:</strong></td><td>{plant.waterflow}</td></tr>
                      <tr><td><strong>Salto:</strong></td><td>{plant.jump}</td></tr>
                      <tr><td><strong>Macchinari:</strong></td><td>{plant.machine}</td></tr>
                    </tbody>
                  </table>
                  
                  <div className="plant-description">{plant.description}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Centrali europee - CON RADIUS DINAMICO E PROPORZIONALE ALLA POTENZA */}
          {euPlantsVisible && filteredEuropeanPlants.map(plant => (
            <DynamicCircle
              key={`eu-${plant.id}`}
              center={[plant.lat, plant.lon]}
              type={plant.type}
              capacity={plant.capacity}
            >
              <Popup>
                <div className="popup-content eu-popup">
                  <h3>{plant.name}</h3>
                  
                  <div className="eu-plant-badge">
                    <span className="country-badge">{plant.country}</span>
                    <span 
                      className="type-badge"
                      style={{ backgroundColor: EU_PLANT_COLORS[plant.type] }}
                    >
                      {EU_PLANT_TYPES[plant.type]}
                    </span>
                  </div>
                  
                  <table className="plant-details">
                    <tbody>
                      {plant.capacity && (
                        <tr>
                          <td><strong>Potenza installata:</strong></td>
                          <td>{plant.capacity > 0 && plant.capacity.toFixed(1)} MW</td>
                        </tr>
                      )}
                      {plant.pumping && (
                        <tr>
                          <td><strong>Pompaggio:</strong></td>
                          <td>{plant.pumping.toFixed(1)} MW</td>
                        </tr>
                      )}
                      {plant.damHeight && (
                        <tr>
                          <td><strong>Altezza diga:</strong></td>
                          <td>{plant.damHeight.toFixed(0)} m</td>
                        </tr>
                      )}
                      {plant.volume && (
                        <tr>
                          <td><strong>Volume:</strong></td>
                          <td>{plant.volume.toFixed(1)} Mm³</td>
                        </tr>
                      )}
                      {plant.storage && (
                        <tr>
                          <td><strong>Capacità accumulo:</strong></td>
                          <td>{(plant.storage / 1000).toFixed(1)} GWh</td>
                        </tr>
                      )}
                      {plant.generation && (
                        <tr>
                          <td><strong>Produzione annua:</strong></td>
                          <td>{plant.generation.toFixed(0)} GWh</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Popup>
            </DynamicCircle>
          ))}

          {/* Layer GeoJSON - Visibili solo se toggle centrali italiane è ON */}
          {plantVisible && activePlant && geoJSONLayers[activePlant] && 
            Object.entries(geoJSONLayers[activePlant] || {})
              .sort((a, b) => a[1].config.zIndex - b[1].config.zIndex)
              .map(([layerKey, layer]) => {
                const isVisible = layerVisibility[layerKey];
                if (!isVisible) return null;
                return (
                  <GeoJSON
                    key={layerKey}
                    data={layer.data}
                    pointToLayer={(feature, latlng) => pointToLayer(feature, latlng, layer.config)}
                    style={(feature) => createLayerStyle(layer.config, feature)}
                    onEachFeature={(feature, leafletLayer) => onEachFeature(feature, leafletLayer, layer.config)}
                  />
                );
              })}
          
          {/* Componente Annotazioni */}
          {showAnnotations && (
            <MapAnnotations 
              showMyAnnotations={showMyAnnotations}
              isCreating={isAnnotationMode}
              onAnnotationCreated={() => setIsAnnotationMode(false)}
            />
          )}
        </MapContainer>
      </div>

      <div className="map-control-panel">
        <h2>Parco Idroelettrico</h2>

        {/* ⭐ SEZIONE 3: Centrali Europee */}
        {renderEuropeanPlantsSection()}

        {/* ⭐ SEZIONE 2: Centrali Italiane */}
        {renderItalianPlantsSection()}

        {/* ⭐ SEZIONE 1: Strumenti Interattivi */}
        {renderInteractiveToolsSection()}
        
      </div>
    </div>
  );
}

export default MapPage;