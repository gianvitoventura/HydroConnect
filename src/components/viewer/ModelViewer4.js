import React, { useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui"; 
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

import { Navigation, setupNavigation } from './ui/Navigation';
import { Plans, setupPlans } from './ui/Plans2';
import { Properties, setupProperties } from './ui/Properties';
import { setupPerformance } from './ui/Performance';

const ModelViewer = ({ modelFiles }) => {
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const plansRef = useRef(null);
  
  const [components, setComponents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [cameraMode, setCameraMode] = useState('perspective');
  const [selectedElement, setSelectedElement] = useState(null);

  // Cleanup function
  const cleanup = () => {
    if (components) {
      components.dispose();
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    // Cleanup event listeners
    window.removeEventListener('resize', handleResize);
  };

  // Handle resize
  const handleResize = () => {
    if (worldRef.current?.renderer) {
      worldRef.current.renderer.resize();
    }
    if (worldRef.current?.camera) {
      worldRef.current.camera.updateAspect();
    }
  };

  useEffect(() => {
    // Add resize listener
    window.addEventListener('resize', handleResize);

    const init = async () => {
      try {
        setLoading(true);
        await BUI.Manager.init();
        const comps = new OBC.Components();
        setComponents(comps);

        const worlds = comps.get(OBC.Worlds);
        const world = worlds.create();
        worldRef.current = world;

        // Setup base
        world.scene = new OBC.SimpleScene(comps);
        world.renderer = new OBCF.PostproductionRenderer(comps, containerRef.current);
        world.camera = new OBC.OrthoPerspectiveCamera(comps);

        await comps.init();
        await world.scene.setup();

        // Setup navigation
        const { setupCameraControls } = setupNavigation(comps, world);
        setupCameraControls();

        // Setup resto
        world.renderer.postproduction.enabled = true;
        const grids = comps.get(OBC.Grids);
        grids.create(world);
        
        setupPerformance(world);

        // Carica modello
        if (modelFiles) {
          await loadModel(comps, world, modelFiles);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing viewer:', err);
        setError(err);
        setLoading(false);
      }
    };

    init();
    return () => cleanup();
  }, [modelFiles]);

  const loadModel = async (comps, world, files) => {
    const fragments = comps.get(OBC.FragmentsManager);
    
    // Carica geometria
    const response = await fetch(files.geometry);
    const data = await response.arrayBuffer();
    const buffer = new Uint8Array(data);
    const model = await fragments.load(buffer);
    world.scene.three.add(model);

    // Carica proprietà
    const propsResponse = await fetch(files.properties);
    const properties = await propsResponse.json();
    model.setLocalProperties(properties);

    // Setup features
    const plans = await setupPlans(comps, world, model);
    plansRef.current = plans;

    setupProperties(comps, world, model);
  };

  return (
    <div className="viewer-container relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="loading-spinner" />
        </div>
      )}

      {error && (
        <div className="error-message-container">
          <p className="error-text">Error loading model: {error.message}</p>
        </div>
      )}

      <Navigation 
        world={worldRef.current}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
      />

      <Plans
        plans={plansRef.current}
        activePlan={activePlan}
        setActivePlan={setActivePlan}
        world={worldRef.current} 
      />

      <Properties element={selectedElement} />

    </div>
  );
};

export default ModelViewer;