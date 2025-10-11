import React, { useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

const ModelViewer = ({ modelFiles }) => {
  const containerRef = useRef(null);
  const [components, setComponents] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await BUI.Manager.init();
        const components = new OBC.Components();
        setComponents(components);

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();

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
        
        if (modelFiles) {
          const response = await fetch(modelFiles.geometry);
          const data = await response.arrayBuffer();
          const buffer = new Uint8Array(data);
          const model = fragments.load(buffer);
          world.scene.three.add(model);

          const properties = await fetch(modelFiles.properties);
          const propsData = await properties.json();
          model.setLocalProperties(propsData);

          const highlighter = components.get(OBCF.Highlighter);
          await highlighter.setup({ world });
          highlighter.events.select.onHighlight.add((selection) => {
            console.log('Selection:', selection);
            if (selection) {
              highlighter.zoomToSelection = true;
            }
          });
        }

        window.addEventListener('resize', () => {
          world.renderer.resize();
          world.camera.updateAspect();
        });

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

  return (
    <div className="viewer-container">
      <div ref={containerRef} />
    </div>
  );
};

export default ModelViewer;