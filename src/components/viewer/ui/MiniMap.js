import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const MiniMap = ({ world, mode = 'fixed', size = 200, position = 'bottom-right' }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!world?.scene?.three) return;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0.1);
    containerRef.current?.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.OrthographicCamera(
      size / -2, size / 2,
      size / 2, size / -2,
      1, 1000
    );
    camera.position.set(0, 100, 0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (mode === 'dynamic') {
        updateDynamicView();
      }
      
      renderer.render(world.scene.three, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      containerRef.current?.innerHTML = '';
    };
  }, [world, size, mode]);

  const updateDynamicView = () => {
    if (!world?.camera?.three || !cameraRef.current) return;
    
    const mainPosition = world.camera.three.position.clone();
    const target = new THREE.Vector3();
    world.camera.controls.getTarget(target);

    cameraRef.current.position.set(
      mainPosition.x,
      Math.max(mainPosition.y + 100, 150),
      mainPosition.z
    );
    cameraRef.current.lookAt(target);
  };

  return (
    <div 
      ref={containerRef}
      className="minimap"
      style={{
        position: 'absolute',
        [position.includes('bottom') ? 'bottom' : 'top']: '20px',
        [position.includes('right') ? 'right' : 'left']: '20px',
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <button 
        className="minimap-toggle"
        onClick={() => onModeChange?.(mode === 'fixed' ? 'dynamic' : 'fixed')}
      >
        {mode === 'fixed' ? '📍' : '🔄'}
      </button>
    </div>
  );
};