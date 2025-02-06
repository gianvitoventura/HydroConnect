// src/components/map/LayerManager.js

import { layerStyles } from './MapIcons';

export class LayerManager {
  constructor() {
    this.layers = {};
    this.visibility = {};
  }

  async loadPlantLayers(plantId, plantName) {
    try {
      const layers = {};
      const plantFolder = plantName.toLowerCase();
      const basePath = '/geoData';
      
      const filesToTry = [
        { name: 'Bacino idrografico.geojson', type: 'coverage' },  
        { name: 'Catasto.geojson', type: 'area' },
        { name: 'Infrastruttura lineare.geojson', type: 'line' },
        { name: 'Opere puntuali.geojson', type: 'point' }    
      ];

      for (const file of filesToTry) {
        try {
          const response = await fetch(`${basePath}/${plantFolder}/${file.name}`);
          if (response.ok) {
            const data = await response.json();
            const layerKey = `${plantName}-${file.name.split('.')[0]}`;
            
            layers[layerKey] = {
              data,
              name: file.name.split('.')[0].replace(/-/g, ' '),
              style: layerStyles[file.type],
              type: file.type
            };

            this.visibility[layerKey] = true;
          }
        } catch (error) {
          console.log(`Error loading ${file.name}:`, error);
        }
      }

      this.layers[plantId] = layers;
      return { layers: this.layers[plantId], visibility: this.visibility };

    } catch (error) {
      console.error('Error loading GeoJSON layers:', error);
      return null;
    }
  }

  setLayerVisibility(layerKey, isVisible) {
    this.visibility[layerKey] = isVisible;
    return this.visibility;
  }

  getLayersByPlantId(plantId) {
    return this.layers[plantId] || {};
  }

  getVisibility() {
    return this.visibility;
  }

  clearLayers() {
    this.layers = {};
    this.visibility = {};
  }

  createPopupContent(properties) {
    return `
      <div class="popup-content">
        <h3>${properties.name || 'Dettagli'}</h3>
        <table class="feature-details">
          ${Object.entries(properties)
            .map(([key, value]) => `
              <tr>
                <td><strong>${key}:</strong></td>
                <td>${value}</td>
              </tr>
            `).join('')}
        </table>
      </div>
    `;
  }

  getLegendItems(activePlantId) {
    if (!this.layers[activePlantId]) return [];
    
    return ['point', 'line', 'area', 'coverage'].map(type => {
      const layerEntry = Object.entries(this.layers[activePlantId])
        .find(([_, layer]) => layer.type === type);
      
      if (!layerEntry) return null;
      
      const [key, layer] = layerEntry;
      return {
        key,
        name: layer.name,
        type: layer.type,
        style: layer.style,
        isVisible: this.visibility[key]
      };
    }).filter(Boolean);
  }
}

export const createLayerManager = () => new LayerManager();