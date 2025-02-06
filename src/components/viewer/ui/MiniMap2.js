import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const MiniMap = ({ 
  world, 
  plans,
  mode = 'dynamic', 
  onModeChange, 
  size = 200, 
  position = 'bottom-right',
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!world?.scene?.three || isInitialized) return;

    const setupMiniMap = () => {
      try {
        console.log('Setting up minimap...');
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        });
        
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0xffffff, 0);
        
        containerRef.current?.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Camera setup
        const camera = new THREE.OrthographicCamera(
          size / -2, size / 2,
          size / 2, size / -2,
          1, 1000
        );
        camera.position.set(0, 100, 0);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        cameraRef.current = camera;

        // Animation loop
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);
          
          if (mode === 'dynamic') {
            updateDynamicView();
          }

          if (renderer && camera && world.scene.three) {
            renderer.render(world.scene.three, camera);
          }
        };

        animate();
        setIsInitialized(true);
        console.log('Minimap initialized successfully');

      } catch (error) {
        console.error('Error setting up minimap:', error);
      }
    };

    setupMiniMap();

    // Cleanup
    return () => {
      console.log('Cleaning up minimap...');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      setIsInitialized(false);
    };
  }, [world, size, mode]);

  const updateDynamicView = () => {
    if (!world?.camera?.three || !cameraRef.current) return;

    try {
      const mainPosition = world.camera.three.position.clone();
      const targetPosition = new THREE.Vector3();
      world.camera.controls.getTarget(targetPosition);

      cameraRef.current.position.set(
        mainPosition.x,
        Math.max(mainPosition.y + 100, 150),
        mainPosition.z
      );
      cameraRef.current.lookAt(targetPosition);
    } catch (error) {
      console.error('Error updating dynamic view:', error);
    }
  };

  const handleClick = (event) => {
    if (!world?.camera?.controls || !containerRef.current) return;

    try {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / size) * 2 - 1;
      const z = -((event.clientY - rect.top) / size) * 2 + 1;

      const worldX = x * 50;
      const worldZ = z * 50;

      world.camera.controls.setLookAt(
        worldX,
        world.camera.three.position.y,
        worldZ,
        worldX,
        0,
        worldZ,
        true
      );
    } catch (error) {
      console.error('Error handling minimap click:', error);
    }
  };

  const positionStyles = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' }
  }[position];

  return (
    <div 
      className="minimap-container" 
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        overflow: 'hidden',
        ...positionStyles
      }}
    >
      <div 
        ref={containerRef} 
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
      />
      <button
        onClick={() => onModeChange?.(mode === 'fixed' ? 'dynamic' : 'fixed')}
        className="minimap-toggle"
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          padding: '4px',
          background: 'white',
          border: '1px solid #3b82f6',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1
        }}
      >
        {mode === 'fixed' ? '📍' : '🔄'}
      </button>
    </div>
  );
};

export default MiniMap;