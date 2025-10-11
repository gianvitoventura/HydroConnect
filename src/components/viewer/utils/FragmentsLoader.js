import * as OBC from "@thatopen/components";

class FragmentsLoader {
  constructor(components) {
    this.components = components;
    this.fragments = components.get(OBC.FragmentsManager);
    this.cache = new Map(); // Cache per evitare di ricaricare modelli già caricati
  }

  async load(modelFiles, options = {}) {
    const { useCache = true, onProgress } = options;
    
    // Verifica se il modello è già in cache
    const cacheKey = `${modelFiles.geometry}-${modelFiles.properties || ''}`;
    if (useCache && this.cache.has(cacheKey)) {
      console.log('Usando modello dalla cache:', modelFiles.geometry);
      return this.cache.get(cacheKey);
    }
    
    try {
      console.log('Caricamento modello frammentato:', modelFiles);
      
      // Fetch del file geometrico
      const geometryResponse = await fetch(modelFiles.geometry);
      if (!geometryResponse.ok) {
        throw new Error(`Impossibile caricare la geometria: ${geometryResponse.status}`);
      }
      
      const geometryBuffer = await geometryResponse.arrayBuffer();
      
      // Carica il modello usando FragmentsManager
      const model = this.fragments.load(new Uint8Array(geometryBuffer));
      
      // Fetch e applicazione delle proprietà se disponibili
      if (modelFiles.properties) {
        try {
          const propertiesResponse = await fetch(modelFiles.properties);
          if (propertiesResponse.ok) {
            const properties = await propertiesResponse.json();
            model.setLocalProperties(properties);
          }
        } catch (error) {
          console.warn('Errore nel caricamento delle proprietà:', error);
        }
      }
      
      // Salva in cache se richiesto
      if (useCache) {
        this.cache.set(cacheKey, model);
      }
      
      return model;
    } catch (error) {
      console.error('Errore in FragmentsLoader:', error);
      throw error;
    }
  }
  
  // Metodo per pulire la cache
  clearCache() {
    this.cache.clear();
  }
}

export default FragmentsLoader;