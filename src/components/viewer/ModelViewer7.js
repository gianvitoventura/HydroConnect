import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

/**
 * ModelViewer Ottimizzato per That Open Engine
 * - Worker-based Fragments per performance
 * - Culling/LOD per modelli pesanti
 * - Gestione memoria corretta
 * - Highlight per categoria
 * - View modes (standard, wireframe, x-ray)
 * - Metodi esposti via useImperativeHandle
 */
const ModelViewer = forwardRef(({ modelFiles, isDarkTheme, onElementSelect }, ref) => {
  const containerRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  
  // Refs per componenti That Open
  const componentsRef = useRef(null);
  const worldRef = useRef(null);
  const fragmentsRef = useRef(null);
  const highlighterRef = useRef(null);
  const hiderRef = useRef(null);
  const modelRef = useRef(null);
  const propertiesRef = useRef(null);
  
  // Stato view mode
  const [viewMode, setViewModeState] = useState('standard');
  const originalMaterialsRef = useRef(new Map());

  /**
   * Setup worker per Fragments (CRITICO per performance con modelli pesanti)
   */
  const setupFragmentsWorker = async (fragments) => {
    try {
      // Usa il worker ufficiale di That Open
      const workerUrl = 'https://thatopen.github.io/engine_fragment/resources/worker.mjs';
      const response = await fetch(workerUrl);
      const workerBlob = await response.blob();
      const workerFile = new File([workerBlob], 'worker.mjs', { type: 'text/javascript' });
      const workerObjectUrl = URL.createObjectURL(workerFile);
      
      await fragments.init(workerObjectUrl);
      console.log('✅ Fragments worker initialized');
    } catch (error) {
      console.warn('⚠️ Worker setup failed, using main thread:', error);
    }
  };

  /**
   * Setup Culling e LOD per ottimizzare rendering modelli pesanti
   */
  const setupCullingAndLOD = useCallback((world, fragments) => {
    if (!world?.camera?.controls || !fragments) return;

    // Culling/LOD si aggiorna quando la camera smette di muoversi
    world.camera.controls.addEventListener('rest', () => {
      fragments.core.update(true);
    });

    console.log('✅ Culling/LOD configured');
  }, []);

  /**
   * Setup gestione modelli caricati
   */
  const setupFragmentsListeners = useCallback((world, fragments) => {
    fragments.list.onItemSet.add(({ value: model }) => {
      // Associa camera per culling/LOD
      model.useCamera(world.camera.three);
      
      // Aggiungi alla scena
      world.scene.three.add(model.object);
      
      // Forza update iniziale
      fragments.core.update(true);
      
      console.log('✅ Model loaded and configured');
    });
  }, []);

  /**
   * Salva materiali originali per view modes
   */
  const saveMaterials = useCallback((model) => {
    model.object.traverse((child) => {
      if (child.isMesh && child.material) {
        originalMaterialsRef.current.set(child.uuid, child.material.clone());
      }
    });
  }, []);

  /**
   * Applica view mode al modello
   */
  const applyViewMode = useCallback((mode) => {
    if (!modelRef.current) return;

    const model = modelRef.current;
    
    model.object.traverse((child) => {
      if (!child.isMesh) return;

      const originalMaterial = originalMaterialsRef.current.get(child.uuid);
      if (!originalMaterial) return;

      switch (mode) {
        case 'wireframe':
          // Modalità wireframe
          child.material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: false
          });
          break;

        case 'xray':
          // Modalità X-Ray (trasparente con outline)
          child.material = originalMaterial.clone();
          child.material.transparent = true;
          child.material.opacity = 0.3;
          child.material.depthWrite = false;
          break;

        case 'standard':
        default:
          // Ripristina materiale originale
          child.material = originalMaterial.clone();
          break;
      }
    });

    console.log(`✅ View mode changed to: ${mode}`);
  }, []);

  /**
   * Highlight elemento singolo per ID
   */
  const highlightElement = useCallback((elementId) => {
    if (!highlighterRef.current || !fragmentsRef.current || !modelRef.current) {
      console.warn('⚠️ Highlighter not ready');
      return;
    }

    try {
      const model = modelRef.current;
      const fragmentMap = model.getFragmentMap([elementId]);
      
      if (fragmentMap && Object.keys(fragmentMap).length > 0) {
        highlighterRef.current.highlightByID('select', fragmentMap);
        console.log(`✅ Highlighted element: ${elementId}`);
      }
    } catch (error) {
      console.error('❌ Error highlighting element:', error);
    }
  }, []);

  /**
   * Highlight multipli elementi per categoria
   */
  const highlightByCategory = useCallback((categoryName) => {
    if (!highlighterRef.current || !propertiesRef.current) {
      console.warn('⚠️ Highlighter or properties not ready');
      return;
    }

    try {
      // Trova tutti gli elementi della categoria
      const properties = propertiesRef.current;
      const elementIds = [];

      Object.entries(properties).forEach(([id, props]) => {
        const typeName = props.type || props.ifcType || 'Unknown';
        // Confronta con il nome tradotto (devi passare la funzione getReadableName)
        if (typeName.includes(categoryName) || props.Name?.value?.includes(categoryName)) {
          elementIds.push(parseInt(id));
        }
      });

      if (elementIds.length > 0) {
        const fragmentMap = modelRef.current.getFragmentMap(elementIds);
        highlighterRef.current.highlightByID('select', fragmentMap);
        console.log(`✅ Highlighted ${elementIds.length} elements in category: ${categoryName}`);
      } else {
        console.warn(`⚠️ No elements found for category: ${categoryName}`);
      }
    } catch (error) {
      console.error('❌ Error highlighting category:', error);
    }
  }, []);

  /**
   * Isola elementi (nasconde tutto il resto)
   */
  const isolateElements = useCallback((elementIds) => {
    if (!hiderRef.current || !modelRef.current) {
      console.warn('⚠️ Hider not ready');
      return;
    }

    try {
      const fragmentMap = modelRef.current.getFragmentMap(elementIds);
      hiderRef.current.set(true, fragmentMap);
      console.log(`✅ Isolated ${elementIds.length} elements`);
    } catch (error) {
      console.error('❌ Error isolating elements:', error);
    }
  }, []);

  /**
   * Mostra tutti gli elementi
   */
  const showAllElements = useCallback(() => {
    if (!hiderRef.current) return;
    hiderRef.current.set(false);
    console.log('✅ All elements visible');
  }, []);

  /**
   * Cambia view mode
   */
  const setViewMode = useCallback((mode) => {
    setViewModeState(mode);
    applyViewMode(mode);
  }, [applyViewMode]);

  /**
   * Cleanup completo
   */
  const cleanup = useCallback(() => {
    console.log('🧹 Starting cleanup...');

    // Clear highlights
    if (highlighterRef.current) {
      highlighterRef.current.clear();
    }

    // Clear hider
    if (hiderRef.current) {
      hiderRef.current.set(false);
    }

    // Dispose modello
    if (fragmentsRef.current && modelRef.current) {
      try {
        const modelId = modelRef.current.uuid;
        fragmentsRef.current.core.disposeModel(modelId);
      } catch (error) {
        console.warn('⚠️ Error disposing model:', error);
      }
    }

    // Dispose componenti
    if (componentsRef.current) {
      try {
        componentsRef.current.dispose();
      } catch (error) {
        console.warn('⚠️ Error disposing components:', error);
      }
    }

    // Clear DOM
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Clear refs
    originalMaterialsRef.current.clear();
    propertiesRef.current = null;
    modelRef.current = null;

    console.log('✅ Cleanup complete');
  }, []);

  /**
   * Espone metodi al componente parent
   */
  useImperativeHandle(ref, () => ({
    highlightElement,
    highlightByCategory,
    isolateElements,
    showAllElements,
    setViewMode,
    clearHighlight: () => highlighterRef.current?.clear(),
    getSelectedElement: () => selectedElement,
    getModel: () => modelRef.current,
    getProperties: () => propertiesRef.current
  }), [
    highlightElement, 
    highlightByCategory, 
    isolateElements, 
    showAllElements, 
    setViewMode, 
    selectedElement
  ]);

  /**
   * Inizializzazione principale
   */
  useEffect(() => {
    let isActive = true;

    const init = async () => {
      if (!containerRef.current) return;

      try {
        // Inizializza BUI Manager
        await BUI.Manager.init();
        
        // Crea componenti
        const components = new OBC.Components();
        componentsRef.current = components;

        // Crea mondo
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();
        worldRef.current = world;

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
        
        // Camera setup per modelli grandi
        world.camera = new OBC.SimpleCamera(components);
        world.camera.three.far = 10000;
        world.camera.three.near = 0.1;
        world.camera.three.updateProjectionMatrix();
        
        // Controlli camera ottimizzati
        world.camera.controls.maxDistance = 2000;
        world.camera.controls.minDistance = 1;
        world.camera.controls.enableDamping = true;
        world.camera.controls.dampingFactor = 0.05;
        world.camera.controls.screenSpacePanning = true;
        world.camera.controls.maxPolarAngle = Math.PI;
        world.camera.controls.minPolarAngle = 0;

        await components.init();
        await world.scene.setup();
        
        // Posizione camera iniziale
        world.camera.controls.setLookAt(50, 50, 50, 0, 0, 0);

        // Griglia
        const grids = components.get(OBC.Grids);
        grids.create(world);

        // Setup FragmentsManager con worker
        const fragments = components.get(OBC.FragmentsManager);
        fragmentsRef.current = fragments;
        
        await setupFragmentsWorker(fragments);
        setupFragmentsListeners(world, fragments);
        setupCullingAndLOD(world, fragments);

        // Setup Highlighter
        const highlighter = components.get(OBCF.Highlighter);
        highlighterRef.current = highlighter;
        await highlighter.setup({ world });
        highlighter.zoomToSelection = true;

        // Setup Hider
        const hider = components.get(OBC.Hider);
        hiderRef.current = hider;

        // Carica modello se disponibile
        if (modelFiles && isActive) {
          console.log('📦 Loading model...');
          
          // Carica geometria
          const fileResponse = await fetch(modelFiles.geometry);
          const data = await fileResponse.arrayBuffer();
          const buffer = new Uint8Array(data);
          const model = fragments.load(buffer);
          
          if (!isActive) return; // Check se componente smontato
          
          modelRef.current = model;
          world.scene.three.add(model);

          // Salva materiali per view modes
          saveMaterials(model);

          // Carica proprietà
          const propertiesResponse = await fetch(modelFiles.properties);
          const propertiesData = await propertiesResponse.json();
          model.setLocalProperties(propertiesData);
          propertiesRef.current = propertiesData;

          console.log('✅ Model loaded successfully');

          // Setup eventi selezione
          highlighter.events.select.onHighlight.add((selection) => {
            if (!selection || Object.keys(selection).length === 0) {
              setSelectedElement(null);
              setPopupPosition(null);
              return;
            }

            const fragmentId = Object.keys(selection)[0];
            const firstSet = selection[fragmentId];
            const elementId = Array.from(firstSet)[0];
            
            const properties = model.getLocalProperties();
            
            if (properties && properties[elementId]) {
              const elementProperties = properties[elementId];
              setSelectedElement(elementProperties);
              
              // Notifica parent
              if (onElementSelect) {
                onElementSelect(elementProperties);
              }
            }
          });

          highlighter.events.select.onClear.add(() => {
            setSelectedElement(null);
            setPopupPosition(null);
            
            if (onElementSelect) {
              onElementSelect(null);
            }
          });

          // Click listener per popup
          world.renderer.three.domElement.addEventListener('click', (event) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setPopupPosition({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          });
        }

      } catch (error) {
        console.error('❌ Error initializing viewer:', error);
      }
    };

    init();

    // Cleanup
    return () => {
      isActive = false;
      cleanup();
    };
  }, [modelFiles, setupFragmentsListeners, setupCullingAndLOD, saveMaterials, onElementSelect, cleanup]);

  /**
   * Aggiorna tema
   */
  useEffect(() => {
    if (!worldRef.current) return;

    const world = worldRef.current;
    
    // Background color
    world.scene.three.background = new THREE.Color(isDarkTheme ? 0x1a1a1a : 0xf5f5f5);
    
    // Ambient light
    const ambientLight = world.scene.three.children.find(child => child.isAmbientLight);
    if (ambientLight) {
      ambientLight.intensity = isDarkTheme ? 0.5 : 1.2;
    }
    
    // Directional light
    const directionalLight = world.scene.three.children.find(child => child.isDirectionalLight);
    if (directionalLight) {
      directionalLight.intensity = isDarkTheme ? 0.8 : 1.5;
    }

    console.log(`🎨 Theme changed to: ${isDarkTheme ? 'dark' : 'light'}`);
  }, [isDarkTheme]);

  return (
    <div className="viewer-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} className="viewer-canvas" style={{ width: '100%', height: '100%' }} />
    
      {selectedElement && popupPosition && (
        <div 
          className="popup-content"
          style={{
            position: 'absolute',
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px',
            backgroundColor: isDarkTheme ? '#2a2a2a' : '#ffffff',
            color: isDarkTheme ? '#ffffff' : '#000000',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            maxWidth: '300px',
            pointerEvents: 'none'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
            Proprietà
          </h3>
          <table className="plant-details" style={{ width: '100%', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>ID:</td>
                <td style={{ padding: '4px' }}>{selectedElement.expressID || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>Nome:</td>
                <td style={{ padding: '4px' }}>{selectedElement.Name?.value || 'N/A'}</td>
              </tr>
              {selectedElement.Material && (
                <tr>
                  <td style={{ padding: '4px', fontWeight: 'bold' }}>Materiale:</td>
                  <td style={{ padding: '4px' }}>{selectedElement.Material?.value || 'N/A'}</td>
                </tr>
              )}
              {selectedElement.Level && (
                <tr>
                  <td style={{ padding: '4px', fontWeight: 'bold' }}>Livello:</td>
                  <td style={{ padding: '4px' }}>{selectedElement.Level?.value || 'N/A'}</td>
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