import * as OBC from "@thatopen/components";
import FragmentsLoader from "./FragmentsLoader";
import IfcToFragmentsLoader from "./IfcToFragmentsLoader";

class ModelManager {
  constructor(components) {
    this.components = components;
    this.fragmentsLoader = new FragmentsLoader(components);
    this.ifcToFragmentsLoader = new IfcToFragmentsLoader(components);
    this.loadedModels = new Map();
  }
  
  /**
   * Carica un modello da file IFC o frammenti
   * @param {Object} config - Configurazione del modello
   * @param {string} config.name - Nome del modello
   * @param {string} config.path - Percorso al file (IFC o FRAG)
   * @param {string} config.type - Tipo di file ('ifc' o 'fragments')
   * @param {boolean} config.convertToFragments - Se convertire IFC in frammenti
   * @param {boolean} config.saveFragments - Se salvare i frammenti generati
   */
  async loadModel(config) {
    const { name, path, type = 'fragments', convertToFragments = true } = config;
    
    try {
      // Controlla se il modello è già caricato
      if (this.loadedModels.has(name)) {
        return this.loadedModels.get(name);
      }
      
      let model;
      
      // Carica in base al tipo di file
      if (type === 'ifc') {
        if (convertToFragments) {
          // Converti IFC in frammenti e carica
          model = await this.ifcToFragmentsLoader.load({
            ifcPath: path,
            name: name,
            saveToFiles: config.saveFragments
          });
        } else {
          // Carica direttamente IFC (non consigliato per file grandi)
          const ifcLoader = this.components.get(OBC.IfcLoader);
          const response = await fetch(path);
          const buffer = await response.arrayBuffer();
          model = await ifcLoader.load(new Uint8Array(buffer));
        }
      } else {
        // Carica direttamente i frammenti
        model = await this.fragmentsLoader.load({
          geometry: path,
          properties: config.propertiesPath
        });
      }
      
      // Salva il modello caricato
      this.loadedModels.set(name, model);
      
      return model;
    } catch (error) {
      console.error(`Errore nel caricamento del modello ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Ottiene un modello già caricato
   */
  getModel(name) {
    return this.loadedModels.get(name);
  }
  
  /**
   * Rimuove un modello
   */
  removeModel(name) {
    const model = this.loadedModels.get(name);
    if (model) {
      // Rimuovi il modello dalla scena se necessario
      if (model.parent) {
        model.parent.remove(model);
      }
      
      // Rimuovi dalla mappa dei modelli caricati
      this.loadedModels.delete(name);
      
      return true;
    }
    return false;
  }
  
  /**
   * Pulisce tutti i modelli
   */
  clearAll() {
    this.loadedModels.forEach((model, name) => {
      this.removeModel(name);
    });
    
    this.fragmentsLoader.clearCache();
    this.ifcToFragmentsLoader.clearCache();
  }
}

export default ModelManager;