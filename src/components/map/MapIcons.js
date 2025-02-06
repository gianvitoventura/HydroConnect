import L from 'leaflet';

// Icona turbina idroelettrica
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

// Icona area naturale
const natureSVG = `
  <div class="marker-container">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke="black" stroke-width="0.5">
      <path fill="#10b981" d="M12 2L4 12h3v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-9h3L12 2z"/>
    </svg>
  </div>
`;

export const mapIcons = {
  turbine: L.divIcon({
    html: turbineSVG,
    className: 'turbine-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  }),
  nature: L.divIcon({
    html: natureSVG,
    className: 'nature-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
};

// Stili per i layer della mappa
export const layerStyles = {
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

// Stili delle mappe base
export const mapStyles = {
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