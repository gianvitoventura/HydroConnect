import React, { useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

const ModelViewer = ({ modelFiles, isDarkTheme }) => {
  const containerRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const worldRef = useRef(null);
  const modelRef = useRef(null);
  const componentsRef = useRef(null);

  const handleClosePopup = () => {
    setSelectedElement(null);
    setPopupPosition(null);
  };

  useEffect(() => {
    // Non inizializzare senza modelFiles
    if (!modelFiles) return;

    let isMounted = true;

    const init = async () => {
      try {
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

        if (!isMounted) {
          components.dispose();
          return;
        }

        const fragments = new OBC.FragmentsManager(components);

        // Supporta sia il nuovo formato (buffer diretto) che il vecchio (URL)
        let buffer;
        let propertiesData;

        if (modelFiles.geometryBuffer) {
          // Nuovo formato: buffer già scaricati da Firebase
          buffer = new Uint8Array(modelFiles.geometryBuffer);
          propertiesData = modelFiles.propertiesData;
        } else if (modelFiles.geometry) {
          // Vecchio formato: URL (compatibilità)
          const file = await fetch(modelFiles.geometry);
          const data = await file.arrayBuffer();
          buffer = new Uint8Array(data);
          const propertiesResponse = await fetch(modelFiles.properties);
          propertiesData = await propertiesResponse.json();
        } else {
          console.warn('modelFiles non valido');
          return;
        }

        if (!isMounted) {
          components.dispose();
          return;
        }

        const model = fragments.load(buffer);
        modelRef.current = model;
        world.scene.three.add(model);
        model.setLocalProperties(propertiesData);

        const highlighter = components.get(OBCF.Highlighter);
        await highlighter.setup({ world });
        highlighter.zoomToSelection = true;

        world.renderer.three.domElement.addEventListener('click', (event) => {
          const rect = containerRef.current.getBoundingClientRect();
          setPopupPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          });
        });

        highlighter.events.select.onHighlight.add((selection) => {
          if (selection && Object.keys(selection)) {
            const fragmentId = Object.keys(selection)[0];
            const firstSet = selection[fragmentId];
            const elementId = Array.from(firstSet)[0];

            const properties = model.getLocalProperties();
            if (properties && properties[elementId]) {
              setSelectedElement(properties[elementId]);
            }
          } else {
            setSelectedElement(null);
            setPopupPosition(null);
          }
        });

        highlighter.events.select.onClear.add(() => {
          setSelectedElement(null);
        });

      } catch (error) {
        console.error('Error initializing viewer:', error);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (componentsRef.current) {
        try {
          componentsRef.current.dispose();
        } catch (e) {
          console.warn('Errore durante dispose:', e);
        }
        componentsRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      worldRef.current = null;
      modelRef.current = null;
    };
  }, [modelFiles]);

  useEffect(() => {
    if (worldRef.current) {
      const world = worldRef.current;
      try {
        world.scene.config.backgroundColor = new THREE.Color(isDarkTheme ? 0x111111 : 0xf5f5f5);
        world.scene.config.ambientLight.intensity = isDarkTheme ? 0.5 : 1.2;
        world.scene.config.directionalLight.intensity = isDarkTheme ? 0.8 : 1.5;
      } catch (e) {
        // ignora errori se il mondo non è ancora pronto
      }
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
          <button
            className="popup-close-button"
            onClick={handleClosePopup}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              border: 'none',
              background: 'transparent',
              fontSize: '1.2em',
              cursor: 'pointer',
              fontWeight: 'bold',
              lineHeight: '1',
            }}
          >
            &times;
          </button>
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
};

export default ModelViewer;