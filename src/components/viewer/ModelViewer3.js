import React, { useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

import { Navigation, setupNavigation } from './ui/Navigation';
import { Plans, setupPlans } from './ui/Plans2';
import { Properties, setupProperties } from './ui/Properties';
import { MiniMap } from './ui/MiniMap2';
import ElementPopup from './ui/ElementPopup';
import { setupPerformance } from './ui/Performance';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
const OPTIMIZATION_CONFIG = {
  rendering: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  },
  geometry: {
    computeBoundingBox: true,
    computeBoundingSphere: true,
  },
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
    maxDistance: 1000,
  },
  performance: {
    lowQualityWhileMoving: true,
    throttleMovement: true,
    movementThreshold: 16, // millisecondi
  },
};

const ModelViewer = ({ modelFiles, setModelFiles }) => {
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const plansRef = useRef(null);
  const currentModelRef = useRef(null);

  const [components, setComponents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [popupPosition, setPopupPosition] = useState(null);
  const [selectedElementInfo, setSelectedElementInfo] = useState(null);

  useEffect(() => {
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

        // Navigation setup
        setupNavigation(world);
        world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

        // Load existing model
        if (modelFiles) {
          await loadModel(comps, world, modelFiles);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing viewer:', error);
        setLoading(false);
      }
    };

    init();
    return () => {
      if (components) {
        components.dispose();
      }
    };
  }, [modelFiles]);

  const loadModel = async (comps, world, files) => {
    try {
      const fragments = comps.get(OBC.FragmentsManager);

      // Carica geometria
      const response = await fetch(files.geometry);
      const buffer = await response.arrayBuffer();
      const model = await fragments.load(new Uint8Array(buffer));
      world.scene.three.add(model);

      // Carica proprietà
      const propsResponse = await fetch(files.properties);
      const properties = await propsResponse.json();
      model.setLocalProperties(properties);

      // Setup additional features
      const plans = await setupPlans(comps, world, model);
      plansRef.current = plans;
      setupProperties(comps, world, model);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  const handlePopupClose = () => {
    setSelectedElementInfo(null);
    setPopupPosition(null);
  };

  return (
    <div className="viewer-container">
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="loading-spinner">Caricamento in corso...</div>
      )}

      {selectedElementInfo && popupPosition && (
        <ElementPopup
          selectedElement={selectedElementInfo}
          position={popupPosition}
          onClose={handlePopupClose}
        />
      )}

      <MiniMap
        world={worldRef.current}
        plans={plansRef.current}
        size={200}
        position="bottom-left"
      />

      <Navigation
        world={worldRef.current}
        cameraMode={NAVIGATION_CONFIG.camera}
      />

      <Plans
        plans={plansRef.current}
        world={worldRef.current}
        activePlan={plansRef.current?.activePlan}
      />

      <Properties element={selectedElementInfo} />
    </div>
  );
};

export default ModelViewer;
