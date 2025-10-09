import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

let globalComponents = null;
let initPromise = null;

const ModelViewer = forwardRef(({ modelFiles, isDarkTheme, onElementSelect }, ref) => {
  const containerRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  
  const worldRef = useRef(null);
  const fragmentsRef = useRef(null);
  const clickHandlerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    highlightElement: (elementId) => console.log('Highlight element:', elementId),
    setViewMode: (mode) => console.log('Set view mode:', mode),
    highlightByCategory: (category) => console.log('Highlight by category:', category)
  }));

  useEffect(() => {
    let isActive = true;

    const init = async () => {
      try {
        console.log('🚀 Inizializzazione viewer (That Open 3.x)...');
        
        if (!globalComponents) {
          if (!initPromise) {
            initPromise = (async () => {
              await BUI.Manager.init();
              globalComponents = new OBC.Components();
              await globalComponents.init();
            })();
          }
          await initPromise;
        }

        if (!isActive) return;

        const components = globalComponents;
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();
        worldRef.current = world;

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
        
        world.camera = new OBC.SimpleCamera(components);
        world.camera.three.far = 10000;
        world.camera.three.near = 0.1;
        world.camera.three.updateProjectionMatrix();
        
        world.camera.controls.maxDistance = 1000;
        world.camera.controls.minDistance = 0.1;
        world.camera.controls.enableDamping = true;
        world.camera.controls.smoothTime = 0.25;

        await world.scene.setup();

        const grids = components.get(OBC.Grids);
        grids.create(world);

        if (!isActive || !modelFiles) return;

        const fragments = components.get(OBC.FragmentsManager);
        fragmentsRef.current = fragments;

        // Setup worker (opzionale)
        try {
          const workerUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
          const fetchedUrl = await fetch(workerUrl);
          const workerBlob = await fetchedUrl.blob();
          const workerFile = new File([workerBlob], "worker.mjs", { type: "text/javascript" });
          fragments.init(URL.createObjectURL(workerFile));
          console.log('✅ Worker inizializzato');
        } catch (err) {
          console.warn('⚠️ Worker non disponibile:', err);
        }

        // Update fragments su camera rest
        world.camera.controls.addEventListener("rest", () => {
          if (isActive && fragmentsRef.current?.core) {
            fragmentsRef.current.core.update(true);
          }
        });

        // LISTENER per modelli caricati (API 3.x)
        fragments.list.onItemSet.add(({ value: model }) => {
          model.useCamera(world.camera.three);
          world.scene.three.add(model.object);
          if (fragmentsRef.current?.core) {
            fragmentsRef.current.core.update(true);
          }
          console.log('✅ Modello aggiunto automaticamente alla scena');
        });

        // CARICA modello con API 3.x
        console.log('📦 Caricamento fragments...');
        const file = await fetch(modelFiles.geometry);
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        
        const modelId = modelFiles.geometry.split('/').pop()?.split('.')[0] || 'model';
        await fragments.core.load(buffer, { modelId });

        if (!isActive) return;

        const model = fragments.list.get(modelId);
        if (!model) {
          console.error('❌ Modello non trovato nella lista');
          return;
        }

        console.log('✅ Modello caricato:', modelId);

        // Carica proprietà SE il file esiste
        if (modelFiles.properties) {
          try {
            const propertiesResponse = await fetch(modelFiles.properties);
            const propertiesData = await propertiesResponse.json();
            model.setLocalProperties(propertiesData);
            console.log('✅ Proprietà caricate da file JSON');
          } catch (err) {
            console.log('⚠️ File proprietà non trovato, uso proprietà embedded nel .frag');
          }
        } else {
          console.log('✅ Uso proprietà embedded nel .frag');
}

        // Posiziona camera
        const bbox = new THREE.Box3().setFromObject(model.object);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z) || 100;
        const fov = world.camera.three.fov * (Math.PI / 180);
        const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

        world.camera.controls.setLookAt(
          center.x + cameraDistance,
          center.y + cameraDistance,
          center.z + cameraDistance,
          center.x,
          center.y,
          center.z
        );

        console.log('📷 Camera posizionata');

        // Setup highlighter
        const highlighter = components.get(OBCF.Highlighter);
        await highlighter.setup({ world });
        highlighter.zoomToSelection = true;

        const clickHandler = (event) => {
          if (!isActive) return;
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setPopupPosition({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
        };
        clickHandlerRef.current = clickHandler;
        world.renderer.three.domElement.addEventListener('click', clickHandler);

        highlighter.events.select.onHighlight.add((selection) => {
          if (!isActive) return;
          
          if (selection && Object.keys(selection).length > 0) {
            const fragmentId = Object.keys(selection)[0];
            const firstSet = selection[fragmentId];
            const elementId = Array.from(firstSet)[0];
            const properties = model.getLocalProperties();
            
            if (properties?.[elementId]) {
              setSelectedElement(properties[elementId]);
              onElementSelect?.(properties[elementId]);
            }
          } else {
            setSelectedElement(null);
            setPopupPosition(null);
            onElementSelect?.(null);
          }
        });

        highlighter.events.select.onClear.add(() => {
          if (!isActive) return;
          setSelectedElement(null);
          onElementSelect?.(null);
        });

        console.log('✅ Viewer inizializzato completamente');

      } catch (error) {
        console.error('❌ Errore durante inizializzazione:', error);
      }
    };

    init();

    return () => {
      isActive = false;
      console.log('🧹 Cleanup viewer...');
      
      if (clickHandlerRef.current && worldRef.current?.renderer?.three?.domElement) {
        worldRef.current.renderer.three.domElement.removeEventListener('click', clickHandlerRef.current);
      }

      // FIX: Verifica che FragmentsManager sia inizializzato prima di usare .core o .list
      if (fragmentsRef.current?.core) {
        try {
          for (const [modelId] of fragmentsRef.current.list) {
            fragmentsRef.current.core.disposeModel(modelId);
          }
        } catch (err) {
          console.warn('Errore durante dispose modelli:', err);
        }
      }

      if (worldRef.current) {
        try {
          worldRef.current.dispose?.();
        } catch (err) {
          console.warn('Errore durante dispose world:', err);
        }
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      setSelectedElement(null);
      setPopupPosition(null);
    };
  }, [modelFiles, onElementSelect]);

  useEffect(() => {
    if (worldRef.current?.scene) {
      worldRef.current.scene.config.backgroundColor = new THREE.Color(isDarkTheme ? 0x111111 : 0xf5f5f5);
      worldRef.current.scene.config.ambientLight.intensity = isDarkTheme ? 0.5 : 1.2;
      worldRef.current.scene.config.directionalLight.intensity = isDarkTheme ? 0.8 : 1.5;
    }
  }, [isDarkTheme]);

  return (
    <div className="viewer-container">
      <div ref={containerRef} className="viewer-canvas" />
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
        >
          <h3>Proprietà</h3>
          <table className="plant-details">
            <tbody>
              <tr><td>ID:</td><td>{selectedElement.expressID || 'N/A'}</td></tr>
              <tr><td>Nome:</td><td>{selectedElement.Name?.value || 'N/A'}</td></tr>
              {selectedElement.Material && <tr><td>Materiale:</td><td>{selectedElement.Material?.value || 'N/A'}</td></tr>}
              {selectedElement.Level && <tr><td>Livello:</td><td>{selectedElement.Level?.value || 'N/A'}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer;