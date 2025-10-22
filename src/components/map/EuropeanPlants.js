import React, { useState, useEffect, useRef } from 'react';
import { Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './EuropeanPlants.css';

// ============================================================================
// COSTANTI
// ============================================================================

const EU_PLANT_COLORS = {
  'HDAM': '#40E0D0',  // Bacino - Turquoise/Acqua
  'HROR': '#10b981',  // Acqua fluente - Verde
  'HPHS': '#8b5cf6'   // Accumulo - Viola
};

const EU_PLANT_TYPES = {
  'HDAM': 'A bacino',
  'HROR': 'Ad acqua fluente',
  'HPHS': 'Ad accumulo'
};

// ============================================================================
// FUNZIONI DI UTILITÀ
// ============================================================================

const cleanString = (str) => {
  if (!str) return '';
  return str.toString().replace(/^"|"$/g, '').trim();
};

const calculateMarkerRadius = (capacity, zoom) => {
  const minPower = 38;
  const maxPower = 2000;
  const normalizedPower = Math.min(Math.max(capacity, minPower), maxPower);
  const powerScale = 0.5 + ((normalizedPower - minPower) / (maxPower - minPower)) * 2.5;
  
  let zoomScale;
  if (zoom <= 5) zoomScale = 10000;
  else if (zoom <= 6) zoomScale = 5000;
  else if (zoom <= 7) zoomScale = 2000;
  else if (zoom <= 8) zoomScale = 1000;
  else if (zoom <= 9) zoomScale = 500;
  else if (zoom <= 10) zoomScale = 300;
  else if (zoom <= 11) zoomScale = 150;
  else if (zoom <= 12) zoomScale = 100;
  else zoomScale = 50;
  
  return zoomScale * powerScale;
};

// ============================================================================
// COMPONENTE CANVAS LAYER
// ============================================================================

const EuropeanPlantsCanvas = ({ plants }) => {
  const map = useMap();
  const canvasLayerRef = useRef(null);

  useEffect(() => {
    if (!map || plants.length === 0) return;

    const CanvasLayer = L.Layer.extend({
      onAdd: function (map) {
        const canvas = L.DomUtil.create('canvas', 'european-plants-canvas');
        const size = map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.style.position = 'absolute';
        canvas.style.pointerEvents = 'none';
        
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        
        map.getPanes().overlayPane.appendChild(canvas);
        
        map.on('move', this._reset, this);
        map.on('moveend', this._reset, this);
        map.on('zoom', this._reset, this);
        map.on('zoomend', this._reset, this);
        map.on('resize', this._resize, this);
        
        this._reset();
      },

      onRemove: function (map) {
        L.DomUtil.remove(this._canvas);
        map.off('move', this._reset, this);
        map.off('moveend', this._reset, this);
        map.off('zoom', this._reset, this);
        map.off('zoomend', this._reset, this);
        map.off('resize', this._resize, this);
      },

      _resize: function () {
        const size = map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;
        this._reset();
      },

      _reset: function () {
        const bounds = map.getBounds();
        const topLeft = map.latLngToContainerPoint(bounds.getNorthWest());
        
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._draw();
      },

      _draw: function () {
        const ctx = this._ctx;
        const canvas = this._canvas;
        const zoom = map.getZoom();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        plants.forEach(plant => {
          const point = map.latLngToContainerPoint([plant.lat, plant.lon]);
          const radius = calculateMarkerRadius(plant.capacity, zoom);
          const radiusPixels = radius / map.distance(
            map.getBounds().getNorthWest(),
            map.getBounds().getNorthEast()
          ) * canvas.width;
          
          const color = EU_PLANT_COLORS[plant.type];
          
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.7;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.9;
          
          ctx.beginPath();
          
          switch(plant.type) {
            case 'HDAM':
              drawTriangle(ctx, point.x, point.y, radiusPixels);
              break;
            case 'HROR':
              drawCircle(ctx, point.x, point.y, radiusPixels);
              break;
            case 'HPHS':
              drawSquare(ctx, point.x, point.y, radiusPixels);
              break;
            default:
              drawCircle(ctx, point.x, point.y, radiusPixels);
          }
          
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.globalAlpha = 0.9;
          ctx.stroke();
        });
        
        ctx.globalAlpha = 1.0;
      }
    });

    const drawTriangle = (ctx, x, y, size) => {
      const height = size * 1.15;
      ctx.moveTo(x, y - height);
      ctx.lineTo(x + size, y + height * 0.5);
      ctx.lineTo(x - size, y + height * 0.5);
      ctx.closePath();
    };

    const drawCircle = (ctx, x, y, size) => {
      ctx.arc(x, y, size, 0, Math.PI * 2);
    };

    const drawSquare = (ctx, x, y, size) => {
      const halfSize = size * 0.85;
      ctx.rect(x - halfSize, y - halfSize, halfSize * 2, halfSize * 2);
    };

    const layer = new CanvasLayer();
    layer.addTo(map);
    canvasLayerRef.current = layer;

    return () => {
      if (canvasLayerRef.current) {
        map.removeLayer(canvasLayerRef.current);
      }
    };
  }, [map, plants]);

  return null;
};

// ============================================================================
// COMPONENTE MARKERS INTERATTIVI
// ============================================================================

const EuropeanPlantMarkers = ({ plants }) => {
  return (
    <>
      {plants.map(plant => (
        <Circle
          key={`eu-marker-${plant.id}`}
          center={[plant.lat, plant.lon]}
          radius={50}
          pathOptions={{
            fillOpacity: 0,
            opacity: 0,
            interactive: true
          }}
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
                      <td>{plant.capacity.toFixed(1)} MW</td>
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
        </Circle>
      ))}
    </>
  );
};

// ============================================================================
// COMPONENTE ICONA LEGENDA
// ============================================================================

const LegendShapeIcon = ({ type, color }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 16;
    const centerX = size / 2;
    const centerY = size / 2;
    const shapeSize = 6;

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    ctx.beginPath();

    switch(type) {
      case 'HDAM':
        ctx.moveTo(centerX, centerY - shapeSize);
        ctx.lineTo(centerX + shapeSize, centerY + shapeSize * 0.5);
        ctx.lineTo(centerX - shapeSize, centerY + shapeSize * 0.5);
        ctx.closePath();
        break;

      case 'HROR':
        ctx.arc(centerX, centerY, shapeSize, 0, Math.PI * 2);
        break;

      case 'HPHS':
        const halfSize = shapeSize * 0.85;
        ctx.rect(centerX - halfSize, centerY - halfSize, halfSize * 2, halfSize * 2);
        break;

      default:
        ctx.arc(centerX, centerY, shapeSize, 0, Math.PI * 2);
    }

    ctx.fill();
    ctx.globalAlpha = 0.9;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

  }, [type, color]);

  return (
    <canvas
      ref={canvasRef}
      width={16}
      height={16}
      style={{ display: 'block' }}
    />
  );
};

// ============================================================================
// COMPONENTE PANNELLO CONTROLLI
// ============================================================================

export const EuropeanPlantsControls = ({ 
  visible, 
  onVisibilityChange,
  countryFilter,
  onCountryFilterChange,
  typeFilters,
  onTypeFiltersChange,
  minPower,
  onMinPowerChange,
  availableCountries,
  totalPlants,
  filteredCount,
  loadingError
}) => {
  return (
    <div className="european-plants-section">
      <div className="section-header">
        <h3>Grandi derivazioni idroelettriche</h3>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => onVisibilityChange(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {loadingError && (
        <div className="error-message">
          ⚠️ Errore caricamento: {loadingError}
        </div>
      )}

      {visible && totalPlants > 0 && (
        <div className="european-controls">
          {/* Filtro paese */}
          <div className="filter-group">
            <label>Filtra per paese:</label>
            <select 
              value={countryFilter} 
              onChange={(e) => onCountryFilterChange(e.target.value)}
              className="country-select"
            >
              <option value="all">Tutti i paesi</option>
              {availableCountries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.code} ({country.count})
                </option>
              ))}
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
                    checked={typeFilters[typeCode]}
                    onChange={(e) => onTypeFiltersChange({
                      ...typeFilters,
                      [typeCode]: e.target.checked
                    })}
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
              Potenza minima: {minPower} MW
            </label>
            <input
              type="range"
              min="3"
              max="500"
              step="10"
              value={minPower}
              onChange={(e) => onMinPowerChange(Number(e.target.value))}
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
              {filteredCount.toLocaleString()} / {totalPlants.toLocaleString()}
            </span>
          </div>

          {/* Legenda */}
          <div className="eu-legend">
            <h4>Legenda:</h4>
            {Object.entries(EU_PLANT_TYPES).map(([typeCode, typeName]) => (
              <div key={typeCode} className="legend-item">
                <div className="legend-shape">
                  <LegendShapeIcon 
                    type={typeCode}
                    color={EU_PLANT_COLORS[typeCode]}
                  />
                </div>
                <span>{typeName}</span>
              </div>
            ))}
            <div className="legend-note">
              <small>💡 Dimensione = f(zoom, potenza MW)</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPALE MAP LAYER
// ============================================================================

export const EuropeanPlantsLayer = ({ plants, visible }) => {
  if (!visible || plants.length === 0) return null;

  return (
    <>
      <EuropeanPlantsCanvas plants={plants} />
      <EuropeanPlantMarkers plants={plants} />
    </>
  );
};

// ============================================================================
// HOOK PERSONALIZZATO PER GESTIONE STATO
// ============================================================================

export const useEuropeanPlants = (geoJsonPath = '/geoData/centraliEU.geojson') => {
  const [europeanPlants, setEuropeanPlants] = useState([]);
  const [visible, setVisible] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [countryFilter, setCountryFilter] = useState('all');
  const [typeFilters, setTypeFilters] = useState({
    'HDAM': true,
    'HROR': true,
    'HPHS': true
  });
  const [minPower, setMinPower] = useState(0);
  const [availableCountries, setAvailableCountries] = useState([]);

  // Caricamento dati
  useEffect(() => {
    const loadPlants = async () => {
      try {
        const response = await fetch(geoJsonPath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.features) {
          throw new Error('Formato GeoJSON non valido');
        }

        const plants = data.features.map(feature => ({
          id: cleanString(feature.properties['"id"']),
          name: cleanString(feature.properties['"name"']),
          capacity: feature.properties['"installed_capacity_MW"'],
          pumping: feature.properties['"pumping_MW"'],
          type: cleanString(feature.properties['"type"']),
          country: cleanString(feature.properties['"country_code"']),
          lat: feature.properties['"lat"'],
          lon: feature.properties['"lon"'],
          damHeight: feature.properties['"dam_height_m"'],
          volume: feature.properties['"volume_Mm3"'],
          storage: feature.properties['"storage_capacity_MWh"'],
          generation: feature.properties['"avg_annual_generation_GWh"'],
        }));

        setEuropeanPlants(plants);

        // Estrai paesi unici con conteggio
        const countryMap = plants.reduce((acc, p) => {
          acc[p.country] = (acc[p.country] || 0) + 1;
          return acc;
        }, {});
        
        const countries = Object.entries(countryMap)
          .map(([code, count]) => ({ code, count }))
          .sort((a, b) => a.code.localeCompare(b.code));
        
        setAvailableCountries(countries);

        console.log(`✅ Caricate ${plants.length} centrali europee da ${countries.length} paesi`);

      } catch (error) {
        console.error('❌ Errore caricamento centrali europee:', error);
        setLoadingError(error.message);
      }
    };

    loadPlants();
  }, [geoJsonPath]);

  // Filtraggio
  const filteredPlants = europeanPlants.filter(plant => {
    if (countryFilter !== 'all' && plant.country !== countryFilter) {
      return false;
    }
    if (!typeFilters[plant.type]) {
      return false;
    }
    if (plant.capacity < minPower) {
      return false;
    }
    return true;
  });

  return {
    plants: filteredPlants,
    allPlants: europeanPlants,
    visible,
    setVisible,
    loadingError,
    countryFilter,
    setCountryFilter,
    typeFilters,
    setTypeFilters,
    minPower,
    setMinPower,
    availableCountries
  };
};

// Export per utilizzo esterno
export { EU_PLANT_COLORS, EU_PLANT_TYPES };