import React, { useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import Stats from "stats.js";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { MiniMap } from './ui/MiniMap2';
import { PlansPanel } from './ui/PlansPanel';
import { Navigation } from './ui/Navigation';
import { Toolbar } from './ui/Toolbar2';
import ElementPopup from './ui/ElementPopup';
import { updateHydroData } from '../../data/HydroData';


// Configurazioni per le ottimizzazioni
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
const OPTIMIZATION_CONFIG = {
  rendering: {
    pixelRatio: Math.min(window.devicePixelRatio, 2)
  },
  geometry: {
    computeBoundingBox: true,
    computeBoundingSphere: true
  }
};

const NAVIGATION_CONFIG = {
  camera: {
    movementSpeed: 1.0,
    rotationSpeed: 1.0,
    dampingFactor: 0.05,
    enableDamping: true,
    enableZoom: true,
    zoomSpeed: 1.0,
    minDistance: 1,
    maxDistance: 1000
  },
  performance: {
    lowQualityWhileMoving: true,
    throttleMovement: true,
    movementThreshold: 16 // millisecondi
  },
  plans: {
    styles: {
      walls: {
        color: new THREE.Color("gray"),
        linewidth: 2,
        opacity: 1
      },
      openings: {
        color: new THREE.Color("black"),
        linewidth: 1,
        opacity: 0.5
      }
    },
    minimap: {
      size: 200,
      position: 'bottom-right',
      updateInterval: 100
    }
  }
};

// Gestione la qualità del rendering
const setupNavigationOptimization = (world) => {
  if (!world || !world.camera || !world.renderer) return;

  // Configura i controlli della camera
  const controls = world.camera.controls;
  controls.enableDamping = NAVIGATION_CONFIG.camera.enableDamping;
  controls.enableZoom = NAVIGATION_CONFIG.camera.enableZoom;
  controls.zoomSpeed = NAVIGATION_CONFIG.camera.zoomSpeed;
  controls.minDistance = NAVIGATION_CONFIG.camera.minDistance;
  controls.maxDistance = NAVIGATION_CONFIG.camera.maxDistance;

  // Imposta la qualità ridotta durante il movimento
  let isMoving = false;
  let lastMoveTime = 0;
  let originalPixelRatio = world.renderer.three.getPixelRatio();

  const setLowQuality = () => {
    if (NAVIGATION_CONFIG.performance.lowQualityWhileMoving) {
      world.renderer.three.setPixelRatio(0.5);
      // Nascondi temporaneamente le mesh meno importanti
      world.scene.three.traverse(child => {
        if (child.isMesh && child.geometry.attributes.position.count > 10000) {
          child.userData.originalDetail = child.geometry;
          const simplifiedGeometry = simplifyGeometry(child.geometry);
          child.geometry = simplifiedGeometry;
        }
      });
    }
  };

  const setHighQuality = () => {
    world.renderer.three.setPixelRatio(originalPixelRatio);
    // Ripristina i dettagli originali
    world.scene.three.traverse(child => {
      if (child.isMesh && child.userData.originalDetail) {
        child.geometry = child.userData.originalDetail;
        delete child.userData.originalDetail;
      }
    });
  };

  // Semplifica la geometria per la navigazione
  const simplifyGeometry = (geometry) => {
    if (!geometry.attributes.position) return geometry;
    
    const positions = geometry.attributes.position.array;
    const stride = 2; // Prendi un vertice ogni due
    const simplifiedPositions = new Float32Array(Math.ceil(positions.length / stride));
    
    for (let i = 0, j = 0; i < positions.length; i += stride * 3, j += 3) {
      simplifiedPositions[j] = positions[i];
      simplifiedPositions[j + 1] = positions[i + 1];
      simplifiedPositions[j + 2] = positions[i + 2];
    }

    const simplified = new THREE.BufferGeometry();
    simplified.setAttribute('position', new THREE.BufferAttribute(simplifiedPositions, 3));
    simplified.computeVertexNormals();
    return simplified;
  };

  // Gestisce l'inizio del movimento
  controls.addEventListener('start', () => {
    isMoving = true;
    lastMoveTime = Date.now();
    setLowQuality();
  });

  // Gestisce la fine del movimento
  controls.addEventListener('end', () => {
    isMoving = false;
    setTimeout(() => {
      if (!isMoving) {
        setHighQuality();
      }
    }, 150); // Piccolo ritardo per evitare cambi troppo frequenti
  });

  // Ottimizza il rendering durante il movimento
  const throttledRender = () => {
    const now = Date.now();
    if (now - lastMoveTime > NAVIGATION_CONFIG.performance.movementThreshold) {
      world.renderer.three.render(world.scene.three, world.camera.three);
      lastMoveTime = now;
    }
  };

  if (NAVIGATION_CONFIG.performance.throttleMovement) {
    world.renderer.three.setAnimationLoop(throttledRender);
  }

  // Aggiungi gesture controls per touch devices
  const addTouchControls = () => {
    const touchElement = world.renderer.three.domElement;
    let touchStartX = 0;
    let touchStartY = 0;

    touchElement.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    touchElement.addEventListener('touchmove', (e) => {
      if (!isMoving) {
        isMoving = true;
        setLowQuality();
      }

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const deltaX = (touchX - touchStartX) * NAVIGATION_CONFIG.camera.rotationSpeed;
      const deltaY = (touchY - touchStartY) * NAVIGATION_CONFIG.camera.rotationSpeed;

      controls.rotateLeft(deltaX * 0.002);
      controls.rotateUp(deltaY * 0.002);

      touchStartX = touchX;
      touchStartY = touchY;
    });

    touchElement.addEventListener('touchend', () => {
      isMoving = false;
      setTimeout(() => {
        if (!isMoving) {
          setHighQuality();
        }
      }, 150);
    });
  };

  addTouchControls();
};

// Funzioni di ottimizzazione
const loadModelProgressively = async (buffer, onProgress) => {
  const chunks = [];
  for (let i = 0; i < buffer.byteLength; i += CHUNK_SIZE) {
    chunks.push(buffer.slice(i, i + CHUNK_SIZE));
  }

  const total = chunks.length;
  const processedChunks = [];

  for (let i = 0; i < total; i++) {
    const processed = await processChunk(chunks[i]);
    processedChunks.push(processed);
    
    if (onProgress) {
      onProgress((i + 1) / total * 100);
    }
  }

  const finalBuffer = new Uint8Array(buffer.byteLength);
  let offset = 0;
  processedChunks.forEach(chunk => {
    finalBuffer.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  });

  return finalBuffer;
};

const processChunk = async (chunk) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(chunk), 0);
  });
};

const optimizeMesh = (mesh) => {
  if (!mesh) return;

  // Ottimizzazioni geometria
  if (mesh.geometry) {
    if (OPTIMIZATION_CONFIG.geometry.computeBoundingBox) {
      mesh.geometry.computeBoundingBox();
    }
    if (OPTIMIZATION_CONFIG.geometry.computeBoundingSphere) {
      mesh.geometry.computeBoundingSphere();
    }
    mesh.geometry.attributes.position.usage = THREE.StaticDrawUsage;
    if (mesh.geometry.index) {
      mesh.geometry.index.usage = THREE.StaticDrawUsage;
    }
  }
  mesh.frustumCulled = true;
};

const ModelViewer = ({ modelFiles, setModelFiles }) => {
  const containerRef = useRef(null);
  const [components, setComponents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const worldRef = useRef(null);
  const plansRef = useRef(null);
  const currentModelRef = useRef(null);
  const [activePlan, setActivePlan] = useState(null);
  const [minimapMode, setMinimapMode] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const [highlighter, setHighlighter] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [selectedElementInfo, setSelectedElementInfo] = useState(null);

  useEffect(() => {
    let world = null;
    
    const init = async () => {
      try {
        await BUI.Manager.init();
        const components = new OBC.Components();
        setComponents(components);

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();
        worldRef.current = world;

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
        world.camera = new OBC.SimpleCamera(components);

        await components.init();
        await world.scene.setup();

        world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

        const grids = components.get(OBC.Grids);
        grids.create(world);
        world.scene.three.background = null;

        const fragments = components.get(OBC.FragmentsManager);
        const fragmentIfcLoader = components.get(OBC.IfcLoader);

        // Elements selection
        const highlighter = components.get(OBCF.Highlighter);
        await highlighter.setup({ world });
        setHighlighter(highlighter);

        console.log('[SETUP] Highlighter initialized:', {
          highlighter,
          world: world,
          components: components
        });

        // Setup performance monitoring
        setupPerformanceMonitor(world);
        setupNavigationOptimization(world);

        // Load existing model
        if (modelFiles) {
          await loadModel(modelFiles, fragments, fragmentIfcLoader, world);
        } else {
        setLoadingError('Nessun modello presente per questa centrale');
        }

        setupWindowResize(world);

        return () => cleanup(components, containerRef);
      } catch (error) {
        console.error('Error initializing viewer:', error);
      }
    };

    init();
  }, [modelFiles]);

  const calculatePopupPosition = (selection) => {
    if (!worldRef.current?.camera || !selection) {
      console.log('[POSITION] Missing dependencies:', { 
        camera: !!worldRef.current?.camera, 
        selection: !!selection 
      });
      return null;
    }
  
    const fragments = components.get(OBC.FragmentsManager);
    const group = Array.from(fragments.groups.values())[0];
    if (!group) {
      console.log('[POSITION] No fragment group available');
      return null;
    }
  
    const bbox = new THREE.Box3();
    const fragmentId = Object.keys(selection)[0];
    const expressId = selection[fragmentId][0];
  
    if (group.getMesh(expressId)) {
      bbox.setFromObject(group.getMesh(expressId));
      console.log('[POSITION] Bounding box:', bbox);
    }
  
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    console.log('[POSITION] Center point (3D):', center);
  
    const vector = center.project(worldRef.current.camera.three);
    console.log('[POSITION] Projected vector:', vector);
  
    const x = (vector.x + 1) / 2 * containerRef.current.clientWidth;
    const y = (-vector.y + 1) / 2 * containerRef.current.clientHeight;
  
    console.log('[POSITION] Final screen coordinates:', { x, y });
    return { x, y };
  };
  


  useEffect(() => {
    console.log('[SETUP] Checking highlighter dependencies:', { 
      highlighter: highlighter,
      components: components,
      isHighlighterActive: !!highlighter?.events?.select
    });
    if (!highlighter || !components) {
      console.log('[HIGHLIGHTER] Missing dependencies:', { highlighter, components });
      return;
    }
  
    const handleHighlight = async (selection) => {
      console.log('[SELECTION FLOW] Highlight triggered, selection:', selection);
  
      if (!selection) {
        console.log('[SELECTION FLOW] No selection data');
        return;
      }
  
      const fragments = components.get(OBC.FragmentsManager);
      if (!fragments) {
        console.log('[SELECTION FLOW] FragmentsManager not available');
        return;
      }
  
      const group = Array.from(fragments.groups.values())[0];
      if (!group) {
        console.log('[SELECTION FLOW] No fragment group found');
        return;
      }
  
      try {
        const props = {};
        for (const fragmentId in selection) {
          const expressIds = selection[fragmentId];
          for (const expressId of expressIds) {
            const properties = group.getLocalProperties()?.[expressId];
            console.log(`[SELECTION FLOW] Properties for expressId ${expressId}:`, properties);
            if (properties) {
              props[expressId] = properties;
            }
          }
        }
  
        const position = calculatePopupPosition(selection);
        console.log('[SELECTION FLOW] Calculated popup position:', position);
  
        setSelectedElementInfo({
          id: Object.values(selection)[0][0],
          type: props[Object.values(selection)[0][0]]?.type || 'IFC Element',
          properties: props[Object.values(selection)[0][0]]
        });
        setPopupPosition(position);
  
      } catch (error) {
        console.error('[SELECTION FLOW] Error processing selection:', error);
      }
    };
  
    console.log('[HIGHLIGHTER] Setting up highlight events');
    highlighter.events.select.onHighlight.add(handleHighlight);
    highlighter.events.select.onClear.add(() => {
      console.log('[SELECTION FLOW] Clear event triggered');
      setSelectedElementInfo(null);
      setPopupPosition(null);
    });
  
    return () => {
      console.log('[HIGHLIGHTER] Cleaning up highlight events');
      highlighter.events.select.onHighlight.reset();
      highlighter.events.select.onClear.reset();
    };
  }, [highlighter, components]);

  // Aggiungi funzione per lo zoom
  const handleZoomToElement = () => {
    if (selectedElementInfo && highlighter) {
      highlighter.zoomToSelection = true;
    }
  };


  const setupPlans = async (model, components, world) => {
    try {
      const plans = plansRef.current;
      // Genera i piani
      await plans.generate(model);
      
      // Setup stili
      const classifier = components.get(OBC.Classifier);
      const edges = components.get(OBCF.ClipEdges);

      // Classifica gli elementi
      classifier.byModel(model.uuid, model);
      classifier.byEntity(model);

      await edges.update(true);
    } catch (error) {
      console.error('Error setting up plans:', error);
    }
  };

  return (
    <div className="viewer-container">
      <div ref={containerRef} />
      <PlansPanel 
        plans={plansRef.current}
        world={worldRef.current}
        activePlan={activePlan}
        onPlanChange={async (planId) => {
          try {
            if (planId === null) {
              // Esci dalla vista in pianta
              plansRef.current?.exitPlanView();
              setActivePlan(null);
              worldRef.current.scene.three.background = null;
            } else {
              // Attiva piano selezionato
              await plansRef.current?.goTo(planId);
              setActivePlan(planId);
              worldRef.current.scene.three.background = new THREE.Color("white");
            }
          } catch (error) {
            console.error('Error changing plan:', error);
          }
        }}
      />
      {/* Minimap */}
      {currentModelRef.current && (
      <MiniMap
        world={worldRef.current}
        plans={plansRef.current}
        mode={minimapMode}
        onModeChange={setMinimapMode}
        size={200}
        position="bottom-right"
      />
    )}
      {selectedElementInfo && popupPosition && (
        <ElementPopup 
          selectedElement={selectedElementInfo}
          position={popupPosition}
          properties={selectedElementInfo.properties}
          onClose={() => {
            console.log('[POPUP] Closing popup');
            console.log('[POPUP] Selected Element Info:', selectedElementInfo);
            console.log('[POPUP] Popup Position:', popupPosition);
            setSelectedElementInfo(null);
            setPopupPosition(null);
            highlighter?.clear();
          }}
          onZoomTo={() => {
            console.log('[POPUP] Zoom to element requested');
            if (highlighter) {
              highlighter.zoomToSelection = true;
            }
          }}
        />
      )}
    </div>
  );
};

// Funzioni di utilità
const setupPerformanceMonitor = (world) => {
  const stats = new Stats();
  stats.showPanel(2);
  document.body.append(stats.dom);
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "unset";
  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());
  return stats;
};

const setupWindowResize = (world) => {
  const handleResize = () => {
    world.renderer?.resize();
    world.camera?.updateAspect();
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
};

const cleanup = (components, containerRef) => {
  components.dispose();
  if (containerRef.current) {
    containerRef.current.innerHTML = '';
  }
};

  const loadModel = async (modelFiles, fragments, fragmentIfcLoader, world) => {
    try {
      await fragmentIfcLoader.setup();
      const response = await fetch(modelFiles.geometry);
      const buffer = await response.arrayBuffer();
      const model = await fragments.load(new Uint8Array(buffer));

      // Caricamento progressivo
      const processedBuffer = await loadModelProgressively(
      buffer,
      progress => console.log(`Loading progress: ${progress}%`)
      );

      // Ottimizza ogni mesh nel modello
       model.traverse(child => {
        if (child.isMesh) {
          optimizeMesh(child);
        }
      });
  
      // Aggiungiamo questi log per debug
      console.log('Model loaded:', model);
      console.log('Model fragments:', model.items);
  
      // Controlliamo il caricamento delle proprietà
      const propsResponse = await fetch(modelFiles.properties);
      console.log('Properties response:', propsResponse);
      
      if (propsResponse.ok) {
        const props = await propsResponse.json();
        console.log('Properties loaded:', props); 
        model.setLocalProperties(props);
        console.log('Properties after set:', model.getLocalProperties()); 
      }
  
      world.scene.three.add(model);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };


export default ModelViewer;