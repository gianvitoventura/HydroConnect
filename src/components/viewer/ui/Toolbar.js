// ui/Toolbar.js
import React, { useState } from 'react';
import * as THREE from 'three';

const Toolbar = ({ world }) => {
  const [activeTools, setActiveTools] = useState({
    measure: false,
    section: false,
    explode: false,
    wireframe: false
  });

  const handleMeasure = () => {
    setActiveTools(prev => {
      const newState = { ...prev, measure: !prev.measure };
      
      if (!world?.tools?.measurements) return newState;

      const measurements = world.tools.measurements;
      measurements.enabled = newState.measure;
      measurements.previewEnabled = newState.measure;
      
      if (!newState.measure) {
        measurements.removeAll();
      }
      
      return newState;
    });
  };

  const handleSection = () => {
    setActiveTools(prev => {
      const newState = { ...prev, section: !prev.section };
      
      if (!world?.tools?.clipper) return newState;

      const clipper = world.tools.clipper;
      clipper.enabled = newState.section;
      
      if (newState.section) {
        const center = new THREE.Vector3();
        world.scene.three.children.forEach(child => {
          if (child.geometry) {
            child.geometry.computeBoundingSphere();
            if (child.geometry.boundingSphere) {
              center.add(child.geometry.boundingSphere.center);
            }
          }
        });
        center.divideScalar(world.scene.three.children.length);
        clipper.createPlane(center);
      } else {
        clipper.removeAll();
      }
      
      return newState;
    });
  };

  const handleExplode = () => {
    setActiveTools(prev => {
      const newState = { ...prev, explode: !prev.explode };
      
      if (!world?.scene?.three) return newState;

      const explodeFactor = newState.explode ? 2 : 0;
      world.scene.three.children.forEach((child, index) => {
        if (child.isMesh) {
          const direction = new THREE.Vector3(
            Math.cos(index),
            Math.sin(index),
            0.5
          ).normalize();
          
          const distance = explodeFactor * index * 0.5;
          child.position.copy(direction.multiplyScalar(distance));
          child.updateMatrix();
        }
      });
      
      return newState;
    });
  };

  const handleWireframe = () => {
    setActiveTools(prev => {
      const newState = { ...prev, wireframe: !prev.wireframe };
      
      if (!world?.scene?.three) return newState;

      world.scene.three.traverse(child => {
        if (child.isMesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.wireframe = newState.wireframe;
            });
          } else {
            child.material.wireframe = newState.wireframe;
          }
        }
      });
      
      return newState;
    });
  };

  const takeScreenshot = () => {
    if (!world?.renderer) return;
    
    try {
      world.renderer.render(world.scene.three, world.camera.three);
      
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.png`;
      link.href = world.renderer.domElement
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      link.click();
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };

  if (!world) return null;

  const tools = [
    {
      id: 'measure',
      icon: '📏',
      label: 'Misurazioni',
      onClick: handleMeasure,
      active: activeTools.measure
    },
    {
      id: 'section',
      icon: '✂️',
      label: 'Sezioni',
      onClick: handleSection,
      active: activeTools.section
    },
    {
      id: 'explode',
      icon: '💥',
      label: 'Vista Esplosa',
      onClick: handleExplode,
      active: activeTools.explode
    },
    {
      id: 'wireframe',
      icon: '🔲',
      label: 'Wireframe',
      onClick: handleWireframe,
      active: activeTools.wireframe
    },
    {
      id: 'screenshot',
      icon: '📸',
      label: 'Screenshot',
      onClick: takeScreenshot,
      active: false
    }
  ];

  return (
    <div className="viewer-toolbar">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`toolbar-button ${tool.active ? 'active' : ''}`}
          onClick={tool.onClick}
          title={tool.label}
        >
          <span className="tool-icon">{tool.icon}</span>
          <span className="tool-label">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Toolbar;