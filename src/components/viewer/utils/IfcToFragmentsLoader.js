import * as THREE from "three";
import * as OBC from "@thatopen/components";

export class IfcToFragmentsLoader {
  constructor(components) {
    this.components = components;
    this.ifcLoader = components.get(OBC.IfcLoader);
    this.fragments = components.get(OBC.FragmentsManager);
    this.properties = {};
    this.cache = new Map();
  }

  async load(config) {
    const { ifcPath, name = "Model", useCache = true, onProgress } = config;
    
    // Controlla se il modello è già in cache
    if (useCache && this.cache.has(ifcPath)) {
      console.log(`Caricamento ${name} dalla cache...`);
      return this.cache.get(ifcPath).model;
    }
    
    console.log(`Inizializzazione caricamento IFC: ${name}`);
    
    try {
      // Carica il file IFC
      if (onProgress) onProgress(10);
      const ifcModel = await this.ifcLoader.load(ifcPath);
      if (onProgress) onProgress(30);
      
      console.log(`IFC caricato: ${name}`);
      
      // Estrai le proprietà
      const modelID = ifcModel.modelID;
      const properties = await this.ifcLoader.properties.serializeAllProperties(modelID);
      this.properties[ifcPath] = properties;
      if (onProgress) onProgress(50);
      
      console.log(`Proprietà estratte: ${name}`);
      
      // Converti in frammenti per ottimizzazione
      const fragmentsGroup = new THREE.Group();
      fragmentsGroup.name = name;
      
      // Crea frammenti dal modello IFC
      const result = await this.fragments.generate({
        geometry: ifcModel.geometry,
        material: ifcModel.material
      });
      
      if (onProgress) onProgress(80);
      
      // Aggiungi i frammenti al gruppo
      for (const fragment of result.fragments) {
        fragmentsGroup.add(fragment.mesh);
      }
      
      // Salva in cache
      if (useCache) {
        this.cache.set(ifcPath, {
          model: fragmentsGroup,
          properties: properties,
          fragments: result.fragments
        });
      }
      
      console.log(`Modello IFC convertito in frammenti: ${name}`);
      if (onProgress) onProgress(100);
      
      return fragmentsGroup;
    } catch (error) {
      console.error(`Errore nel caricamento del modello IFC ${name}:`, error);
      throw error;
    }
  }
  
  // Metodo per ottenere le proprietà di un modello dalla cache
  getCachedModel(ifcPath) {
    return this.cache.get(ifcPath);
  }
  
  // Metodo per pulire la cache
  clearCache() {
    this.cache.clear();
  }
}

export default IfcToFragmentsLoader;