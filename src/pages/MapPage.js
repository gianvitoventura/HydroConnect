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

// Definizione dei tipi di layer
const LAYER_TYPES = {
  BACINO: 'bacino',
  CATASTO: 'catasto',
  INFRASTRUTTURA: 'infrastruttura',
  OPERE: 'opere',
  INTERESSE: 'interesse'
};

// Stili dei layer
const layerStyles = {
  [LAYER_TYPES.BACINO]: {
    color: 'orange',
    weight: 2,
    opacity: 0.8,
    fillColor: '#FFA500',
    fillOpacity: 0.3,
    className: 'bacino-layer'
  },
  [LAYER_TYPES.CATASTO]: {
    color: 'purple',
    weight: 2,
    opacity: 0.8,
    fillColor: '#800080',
    fillOpacity: 0.3,
    className: 'catasto-layer'
  },
  [LAYER_TYPES.INFRASTRUTTURA]: {
    color: 'yellow',
    weight: 3,
    opacity: 0.8,
    className: 'infrastruttura-layer'
  },
  [LAYER_TYPES.OPERE]: {
    radius: 5,
    fillColor: "red",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
    className: 'opere-layer'
  },
  [LAYER_TYPES.INTERESSE]: {
    radius: 5,
    fillColor: "green",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
    className: 'interesse-layer'
  }
};

// Configurazione dei file da caricare
const layerConfigs = [
  {
    name: 'Bacino idrografico.geojson',
    type: LAYER_TYPES.BACINO,
    label: 'Bacino Idrografico'
  },
  {
    name: 'Catasto.geojson',
    type: LAYER_TYPES.CATASTO,
    label: 'Catasto'
  },
  {
    name: 'Infrastruttura lineare.geojson',
    type: LAYER_TYPES.INFRASTRUTTURA,
    label: 'Infrastruttura'
  },
  {
    name: 'Opere puntuali.geojson',
    type: LAYER_TYPES.OPERE,
    label: 'Opere Puntuali'
  },
  {
    name: 'Punti d\'interesse.geojson',
    type: LAYER_TYPES.INTERESSE,
    label: 'Punti di Interesse'
  }
];

// Helper function per determinare lo stile della legenda
const getLegendStyle = (layerType, style) => {
  switch (layerType) {
    case LAYER_TYPES.OPERE:
    case LAYER_TYPES.INTERESSE:
      return {
        backgroundColor: style.fillColor,
        border: `2px solid ${style.color}`,
        opacity: style.fillOpacity
      };
    case LAYER_TYPES.INFRASTRUTTURA:
      return {
        backgroundColor: style.color,
        opacity: style.opacity
      };
    default:
      return {
        backgroundColor: style.fillColor,
        opacity: style.fillOpacity,
        border: `2px solid ${style.color}`
      };
  }
};