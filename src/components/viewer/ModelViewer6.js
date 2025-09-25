import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

/**
 * Componente per visualizzare modelli BIM 3D con gestione ottimizzata della memoria
 * @param {Object} modelFiles - File del modello (geometry, properties)
 * @param {boolean} isDarkTheme - Tema dell'interfaccia
 * @param {Function} onElementSelect - Callback per selezione elementi
 * @returns {JSX.Element} Visualizzatore 3D
 */
const ModelViewer = React.memo(({ modelFiles, isDarkTheme, onElementSelect }) => {
  const containerRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  
  // Refs per cleanup
  const worldRef = useRef(null);
  const modelRef = useRef(null);
  const componentsRef = useRef(null);
  const clickHandlerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Funzione per il caricamento chunked di modelli grandi
  const loadModelChunked = useCallback(async (url, chunkSize = 1024 * 1024) => {
    try {
      const response = await fetch(url);
      const contentLength = response.headers.get('content-length');
      
      if (!contentLength) {
        // Fallback al caricamento normale se non abbiamo la dimensione
        const data = await response.arrayBuffer();
        return new Uint8Array(data);
      }

      const total = parseInt(contentLength, 10);
      const chunks = [];
      let receivedLength = 0;

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        // Aggiorna il progresso
        const progress = (receivedLength / total) * 100;
        setLoadingProgress(progress);
      }

      // Combina tutti i chunks
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      return chunksAll;
    } catch (error) {
      console.error('Error loading model chunks:', error);
      throw error;
    }
  }, []);

  // Cleanup function per Three.js e listeners
  const cleanup = useCallback(() => {
    // Cancella animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Rimuovi event listener
    if (clickHandlerRef.current && worldRef.current?.renderer?.three?.domElement) {
      worldRef.current.renderer.three.domElement.removeEventListener('click', clickHandlerRef.current);
    }

    // Disconnetti ResizeObserver
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    // Cleanup del modello
    if (modelRef.current) {
      // Rimuovi il modello dalla scena
      if (worldRef.current?.scene?.three) {
        worldRef.current.scene.three.remove(modelRef.current);
      }

      // Cleanup delle geometrie e materiali
      modelRef.current.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Cleanup dei componenti
    if (componentsRef.current) {
      try {
        componentsRef.current.dispose();
      } catch (error) {
        console.error('Error disposing components:', error);
      }
    }

    // Cleanup del renderer
    if (worldRef.current?.renderer?.three) {
      worldRef.current.renderer.three.dispose();
      worldRef.current.renderer.three.forceContextLoss();
    }

    // Reset refs
    worldRef.current = null;
    modelRef.current = null;
    componentsRef.current = null;
    clickHandlerRef.current = null;

    // Pulisci il container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Verifica WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
          throw new Error('WebGL non supportato in questo browser');
        }

        await BUI.Manager.init();
        const components = new OBC.Components();
        componentsRef.current = components;

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();
        worldRef.current = world;

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
        
        // Camera setup ottimizzato
        world.camera = new OBC.SimpleCamera(components);
        world.camera.three.far = 10000;
        world.camera.three.near = 0.1;
        world.camera.three.updateProjectionMatrix();
        
        world.camera.controls.maxDistance = 1000;
        world.camera.controls.minDistance = 0.1;
        world.camera.controls.enableDamping = true;
        world.camera.controls.dampingFactor = 0.05;

        await components.init();
        await world.scene.setup();
        
        world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

        const grids = components.get(OBC.Grids);
        grids.create(world);

        // Setup ResizeObserver per gestire ridimensionamenti
        resizeObserverRef.current = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (world.renderer?.three) {
              const { width, height } = entry.contentRect;
              world.renderer.three.setSize(width, height);
              world.camera.three.aspect = width / height;
              world.camera.three.updateProjectionMatrix();
            }
          }
        });

        if (containerRef.current) {
          resizeObserverRef.current.observe(containerRef.current);
        }

        if (modelFiles && mounted) {
          const fragments = new OBC.FragmentsManager(components);
          
          // Carica il modello con chunking per file grandi
          const buffer = await loadModelChunked(modelFiles.geometry);
          
          if (!mounted) return;
          
          const model = fragments.load(buffer);
          modelRef.current = model;
          world.scene.three.add(model);

          // Recupera proprietà dal JSON
          const propertiesResponse = await fetch(modelFiles.properties);
          const propertiesData = await propertiesResponse.json();
          model.setLocalProperties(propertiesData);

          const highlighter = components.get(OBCF.Highlighter);
          await highlighter.setup({ world });
          highlighter.zoomToSelection = true;

          // Gestione click con cleanup reference
          clickHandlerRef.current = (event) => {
            const rect = containerRef.current.getBoundingClientRect();
            setPopupPosition({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          };

          world.renderer.three.domElement.addEventListener('click', clickHandlerRef.current);

          // Gestione selezione elementi
          highlighter.events.select.onHighlight.add((selection) => {
            if (selection && Object.keys(selection).length) {
              const fragmentId = Object.keys(selection)[0];
              const firstSet = selection[fragmentId];
              const elementId = Array.from(firstSet)[0];
              
              const properties = model.getLocalProperties();
              
              if (properties && properties[elementId]) {
                const elementProperties = properties[elementId];
                setSelectedElement(elementProperties);
                if (onElementSelect) {
                  onElementSelect(elementProperties);
                }
              }
            } else {
              setSelectedElement(null);
              setPopupPosition(null);
            }
          });

          highlighter.events.select.onClear.add(() => {
            setSelectedElement(null);
            setPopupPosition(null);
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing viewer:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      mounted = false;
      cleanup();
    };
  }, [modelFiles, loadModelChunked, cleanup, onElementSelect]);

  // Gestione tema
  useEffect(() => {
    if (worldRef.current) {
      const world = worldRef.current;

      world.scene.config.backgroundColor = new THREE.Color(isDarkTheme ? 0x111111 : 0xf5f5f5);
      world.scene.config.ambientLight.intensity = isDarkTheme ? 0.5 : 1.2;
      world.scene.config.directionalLight.intensity = isDarkTheme ? 0.8 : 1.5;
    }
  }, [isDarkTheme]);

  // Renderizza stato di errore
  if (error) {
    return (
      <div className="viewer-error-container">
        <div className="error-message">
          <h3>Errore nel caricamento del modello</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Ricarica
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <div ref={containerRef} className="viewer-canvas" />
      
      {/* Loading overlay con progress */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner" />
            <p>Caricamento modello...</p>
            {loadingProgress > 0 && (
              <div className="loading-progress">
                <div 
                  className="loading-progress-bar" 
                  style={{ width: `${loadingProgress}%` }}
                />
                <span>{Math.round(loadingProgress)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    
      {/* Popup proprietà elemento */}
      {selectedElement && popupPosition && (
        <div 
          className="popup-content"
          style={{
            position: 'absolute',
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
          role="dialog"
          aria-label="Proprietà elemento"
        >
          <h3>Proprietà</h3>
          <table className="plant-details">
            <tbody>
              <tr>
                <td>ID:</td>
                <td>{selectedElement.expressID || 'N/A'}</td>
              </tr>
              <tr>
                <td>Nome:</td>
                <td>{selectedElement.Name?.value || 'N/A'}</td>
              </tr>
              {selectedElement.Material && (
                <tr>
                  <td>Materiale:</td>
                  <td>{selectedElement.Material?.value || 'N/A'}</td>
                </tr>
              )}
              {selectedElement.Level && (
                <tr>
                  <td>Livello:</td>
                  <td>{selectedElement.Level?.value || 'N/A'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer;