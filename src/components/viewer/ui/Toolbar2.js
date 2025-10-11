// src/components/viewer/ViewerToolbar.js
import { Toolbar } from '@thatopen/ui';
import React, { useState, useCallback } from 'react';
import * as THREE from 'three';

const ViewerToolbar = ({ world, model }) => {
  const [activeTools, setActiveTools] = useState({
    measure: false,
    section: false,
    explode: false,
    wireframe: false,
    properties: false
  });

  // Gestione delle misurazioni
  const toggleMeasure = useCallback(() => {
    setActiveTools(prev => {
      const newState = { ...prev, measure: !prev.measure };
      
      if (!world?.tools?.measurements) return newState;

      const measurements = world.tools.measurements;
      if (newState.measure) {
        measurements.enabled = true;
        measurements.previewEnabled = true;
      } else {
        measurements.enabled = false;
        measurements.previewEnabled = false;
        measurements.removeAll(); // Pulisce le misurazioni esistenti
      }
      
      return newState;
    });
  }, [world]);

  // Gestione delle sezioni
  const toggleSection = useCallback(() => {
    setActiveTools(prev => {
      const newState = { ...prev, section: !prev.section };
      
      if (!world?.tools?.clipper) return newState;

      const clipper = world.tools.clipper;
      if (newState.section) {
        clipper.enabled = true;
        // Crea un piano di sezione al centro del modello
        if (model) {
          const bbox = new THREE.Box3();
          model.items.forEach(mesh => {
            if (mesh && mesh.geometry) {
              bbox.expandByObject(mesh);
            }
          });
          const center = new THREE.Vector3();
          bbox.getCenter(center);
          clipper.createPlane(center);
        }
      } else {
        clipper.enabled = false;
        clipper.removePlanes();
      }
      
      return newState;
    });
  }, [world, model]);

  // Gestione vista esplosa
  const toggleExplode = useCallback(() => {
    setActiveTools(prev => {
      const newState = { ...prev, explode: !prev.explode };
      
      if (!model?.items) return newState;

      const explodeFactor = newState.explode ? 2 : 1;
      model.items.forEach((mesh, index) => {
        if (mesh) {
          // Calcola una direzione casuale ma coerente per ogni mesh
          const angle = (index / model.items.size) * Math.PI * 2;
          const direction = new THREE.Vector3(
            Math.cos(angle),
            Math.sin(angle),
            0.5
          ).normalize();
          
          // Applica l'esplosione
          const distance = explodeFactor * index * 0.5;
          mesh.position.copy(direction.multiplyScalar(distance));
          mesh.updateMatrix();
        }
      });
      
      return newState;
    });
  }, [model]);

  // Toggle wireframe
  const toggleWireframe = useCallback(() => {
    setActiveTools(prev => {
      const newState = { ...prev, wireframe: !prev.wireframe };
      
      if (!model?.items) return newState;

      model.items.forEach(mesh => {
        if (mesh?.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              mat.wireframe = newState.wireframe;
            });
          } else {
            mesh.material.wireframe = newState.wireframe;
          }
        }
      });
      
      return newState;
    });
  }, [model]);

  // Gestione proprietà
  const toggleProperties = useCallback(() => {
    setActiveTools(prev => {
      const newState = { ...prev, properties: !prev.properties };

      if (world?.tools?.properties) {
        world.tools.properties.enabled = newState.properties;
        
        if (newState.properties) {
          world.tools.properties.update();
        } else {
          world.tools.properties.clear();
        }
      }
      
      return newState;
    });
  }, [world]);

  // Screenshot
  const takeScreenshot = useCallback(() => {
    if (!world?.renderer) return;
    
    try {
      // Renderizza la scena
      world.renderer.render(world.scene.three, world.camera.three);
      
      // Crea il link per il download
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.png`;
      link.href = world.renderer.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      link.click();
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  }, [world]);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg flex gap-2 z-50">
      {/* Misurazioni */}
      <button
        onClick={toggleMeasure}
        className={`toolbar-button p-2 rounded transition-colors ${
          activeTools.measure 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Misurazioni"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
        </svg>
      </button>

      {/* Sezioni */}
      <button
        onClick={toggleSection}
        className={`toolbar-button p-2 rounded transition-colors ${
          activeTools.section 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Sezioni"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12M8 12h12M8 17h12M4 7h0M4 12h0M4 17h0" />
        </svg>
      </button>

      {/* Vista Esplosa */}
      <button
        onClick={toggleExplode}
        className={`toolbar-button p-2 rounded transition-colors ${
          activeTools.explode 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Vista Esplosa"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>

      {/* Wireframe */}
      <button
        onClick={toggleWireframe}
        className={`toolbar-button p-2 rounded transition-colors ${
          activeTools.wireframe 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Wireframe"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>

      {/* Proprietà */}
      <button
        onClick={toggleProperties}
        className={`toolbar-button p-2 rounded transition-colors ${
          activeTools.properties 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Proprietà"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* Screenshot */}
      <button
        onClick={takeScreenshot}
        className="toolbar-button p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        title="Screenshot"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
};

export default Toolbar;