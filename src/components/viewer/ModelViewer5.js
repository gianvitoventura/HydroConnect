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

  useEffect(() => {
    const init = async () => {
      try {
        await BUI.Manager.init();
        const components = new OBC.Components();

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

        if (modelFiles) {
          const fragments = new OBC.FragmentsManager(components);
          const file = await fetch(modelFiles.geometry);
          const data = await file.arrayBuffer();
          const buffer = new Uint8Array(data);
          const model = fragments.load(buffer);
          modelRef.current = model;
          world.scene.three.add(model);

          const propertiesResponse = await fetch(modelFiles.properties);
          const propertiesData = await propertiesResponse.json();
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
              console.log('frag:', fragmentId);
              const firstSet = selection[fragmentId];
              const elementId = Array.from(firstSet)[0];
              console.log('Element ID:', elementId);
              
              // Ottieni tutte le proprietà locali
              const properties = model.getLocalProperties();
              console.log('Properties:', properties);
              
              if (properties && properties[elementId]) {
                const elementProperties = properties[elementId];
                console.log('Properties:', elementProperties);
                setSelectedElement(elementProperties);
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

        return () => {
          components.dispose();
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        };

      } catch (error) {
        console.error('Error initializing viewer:', error);
      }
    };

    init();
  }, [modelFiles]);

  useEffect(() => {
    if (worldRef.current) {
        const world = worldRef.current;

        world.scene.config.backgroundColor = new THREE.Color(isDarkTheme ? 0x111111 : 0xf5f5f5);
        world.scene.config.ambientLight.intensity = isDarkTheme ? 0.5 : 1.2;
        world.scene.config.directionalLight.intensity = isDarkTheme ? 0.8 : 1.5;
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