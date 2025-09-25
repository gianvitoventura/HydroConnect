// components/viewer/BIMGISViewer.js - Versione pulita e corretta
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

const BIMGISViewer = ({ modelFiles, isDarkTheme, gisContext, hydroPlantData }) => {
  const containerRef = useRef(null);
  const cesiumContainerRef = useRef(null);
  const bimContainerRef = useRef(null);
  
  const [viewMode, setViewMode] = useState('bim');
  const [selectedElement, setSelectedElement] = useState(null);
  const [bimWorld, setBimWorld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inizializzazione BIM
  const initializeBIM = async () => {
    try {
      setLoading(true);
      await BUI.Manager.init();
      const components = new OBC.Components();
      const worlds = components.get(OBC.Worlds);
      const world = worlds.create();

      // Setup BIM world
      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, bimContainerRef.current);
      world.camera = new OBC.SimpleCamera(components);

      await components.init();
      await world.scene.setup();

      world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

      setBimWorld(world);

      // Carica il modello BIM se disponibile
      if (modelFiles) {
        await loadBIMModel(world, components);
      }

      setLoading(false);
      return { world, components };
    } catch (error) {
      console.error('Error initializing BIM viewer:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Caricamento modello BIM
  const loadBIMModel = async (world, components) => {
    try {
      const fragments = new OBC.FragmentsManager(components);
      const file = await fetch(modelFiles.geometry);
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const model = fragments.load(buffer);
      
      world.scene.three.add(model);

      // Carica proprietà se disponibili
      if (modelFiles.properties) {
        const propertiesResponse = await fetch(modelFiles.properties);
        const propertiesData = await propertiesResponse.json();
        model.setLocalProperties(propertiesData);
      }

      // Setup highlighter per selezione elementi
      const highlighter = components.get(OBCF.Highlighter);
      await highlighter.setup({ world });

      highlighter.events.select.onHighlight.add((selection) => {
        if (selection && Object.keys(selection).length > 0) {
          const fragmentId = Object.keys(selection)[0];
          const properties = extractElementProperties(fragmentId, model);
          setSelectedElement(properties);
        }
      });

      highlighter.events.select.onClear.add(() => {
        setSelectedElement(null);
      });

      return model;
    } catch (error) {
      console.error('Error loading BIM model:', error);
      throw error;
    }
  };

  // Estrazione proprietà elementi (funzione interna)
  const extractElementProperties = (fragmentId, model) => {
    try {
      if (!model) return null;
      
      const properties = model.getLocalProperties();
      if (!properties) return null;

      // Prova diversi modi per ottenere l'Express ID
      let expressId = fragmentId;
      if (typeof fragmentId === 'string' && fragmentId.includes('-')) {
        expressId = fragmentId.split('-')[1];
      }

      const rawProperties = properties[expressId];
      if (!rawProperties) return null;

      return {
        id: expressId,
        name: rawProperties?.name || rawProperties?.Name || 'Unnamed Element',
        type: rawProperties?.type || rawProperties?.Type || 'Unknown Type',
        material: rawProperties?.material || rawProperties?.Material,
        level: rawProperties?.level || rawProperties?.Level
      };
    } catch (error) {
      console.error('Error extracting properties:', error);
      return null;
    }
  };

  // Layout responsive per diverse modalità di visualizzazione
  const getContainerStyle = () => {
    switch (viewMode) {
      case 'bim':
        return {
          cesium: { display: 'none' },
          bim: { width: '100%', height: '100%' }
        };
      case 'gis':
        return {
          cesium: { width: '100%', height: '100%' },
          bim: { display: 'none' }
        };
      case 'hybrid':
        return {
          cesium: { width: '50%', height: '100%', position: 'absolute', left: 0 },
          bim: { width: '50%', height: '100%', position: 'absolute', right: 0 }
        };
      default:
        return {
          cesium: { display: 'none' },
          bim: { width: '100%', height: '100%' }
        };
    }
  };

  // Effetti per inizializzazione
  useEffect(() => {
    const init = async () => {
      await initializeBIM();
    };

    init();

    return () => {
      // Cleanup
      if (bimWorld) {
        try {
          bimWorld.dispose();
        } catch (error) {
          console.warn('Error disposing BIM world:', error);
        }
      }
    };
  }, [modelFiles]);

  // Controlli UI
  const renderControls = () => (
    <div className="bim-gis-controls" style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 1000,
      background: 'rgba(255,255,255,0.9)',
      padding: '15px',
      borderRadius: '8px',
      minWidth: '220px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="view-mode-controls">
        <h4 style={{ margin: '0 0 10px 0', color: '#003d9e' }}>Modalità Vista</h4>
        
        <button 
          className={viewMode === 'bim' ? 'active' : ''}
          onClick={() => setViewMode('bim')}
          style={{ 
            display: 'block', 
            width: '100%', 
            margin: '5px 0', 
            padding: '10px',
            backgroundColor: viewMode === 'bim' ? '#003d9e' : '#f0f0f0',
            color: viewMode === 'bim' ? 'white' : 'black',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: viewMode === 'bim' ? '600' : '400'
          }}
        >
          🏗️ Solo BIM
        </button>
        
        <button 
          onClick={() => alert('Funzionalità GIS in arrivo!')}
          disabled
          style={{ 
            display: 'block', 
            width: '100%', 
            margin: '5px 0', 
            padding: '10px',
            backgroundColor: '#e0e0e0',
            color: '#999',
            border: 'none',
            borderRadius: '6px',
            cursor: 'not-allowed',
            fontSize: '0.9rem'
          }}
        >
          🌍 Solo GIS (Presto)
        </button>
        
        <button 
          onClick={() => alert('Modalità ibrida in arrivo!')}
          disabled
          style={{ 
            display: 'block', 
            width: '100%', 
            margin: '5px 0', 
            padding: '10px',
            backgroundColor: '#e0e0e0',
            color: '#999',
            border: 'none',
            borderRadius: '6px',
            cursor: 'not-allowed',
            fontSize: '0.9rem'
          }}
        >
          🌍+🏗️ Ibrida (Presto)
        </button>
      </div>

      {hydroPlantData && (
        <div className="plant-info" style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#e8f5e8',
          borderRadius: '6px',
          border: '1px solid #c6f6c6'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#065f46' }}>
            {hydroPlantData.name}
          </h4>
          <p style={{ margin: '3px 0', fontSize: '0.85rem', color: '#047857' }}>
            💡 Potenza: {hydroPlantData.capacity}MW
          </p>
          <p style={{ margin: '3px 0', fontSize: '0.85rem', color: '#047857' }}>
            ⚙️ Tipo: {hydroPlantData.type}
          </p>
        </div>
      )}
    </div>
  );

  // Stati di loading ed errore
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px'
          }}></div>
          <h3>Caricamento BIM Viewer...</h3>
          <p>Preparazione modello 3D in corso</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        background: '#fee2e2'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Errore nel caricamento
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  const containerStyles = getContainerStyle();

  return (
    <div ref={containerRef} className="bim-gis-viewer" style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {renderControls()}
      
      {/* Container Cesium (placeholder per futuro) */}
      <div 
        ref={cesiumContainerRef} 
        className="cesium-container"
        style={{
          ...containerStyles.cesium,
          background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
          display: containerStyles.cesium.display === 'none' ? 'none' : 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: '500'
        }}
      >
        🌍 Vista GIS - Prossimamente
      </div>
      
      {/* Container BIM */}
      <div 
        ref={bimContainerRef} 
        className="bim-container"
        style={containerStyles.bim}
      />
      
      {/* Panel proprietà elementi selezionati */}
      {selectedElement && (
        <div className="element-properties" style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          background: 'rgba(255,255,255,0.98)',
          padding: '18px',
          borderRadius: '12px',
          maxWidth: '320px',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,61,158,0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#003d9e',
            borderBottom: '2px solid #003d9e',
            paddingBottom: '6px'
          }}>
            Elemento Selezionato
          </h4>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#374151' }}>Nome:</strong> 
            <span style={{ marginLeft: '8px' }}>{selectedElement.name}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#374151' }}>Tipo:</strong> 
            <span style={{ marginLeft: '8px' }}>{selectedElement.type}</span>
          </div>
          {selectedElement.material && (
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#374151' }}>Materiale:</strong> 
              <span style={{ marginLeft: '8px' }}>{selectedElement.material}</span>
            </div>
          )}
          {selectedElement.level && (
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#374151' }}>Livello:</strong> 
              <span style={{ marginLeft: '8px' }}>{selectedElement.level}</span>
            </div>
          )}
          <button 
            onClick={() => setSelectedElement(null)}
            style={{
              padding: '8px 16px',
              background: '#003d9e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#002a6b'}
            onMouseOut={(e) => e.target.style.background = '#003d9e'}
          >
            Chiudi
          </button>
        </div>
      )}
    </div>
  );
};

export default BIMGISViewer;