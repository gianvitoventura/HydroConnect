import Stats from 'stats.js';

export const setupPerformance = (world) => {
  // Performance monitoring
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  stats.dom.style.position = 'absolute';
  stats.dom.style.top = '0px';
  stats.dom.style.left = '0px';

  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());

  // Ottimizzazioni rendering
  const setupRenderingOptimizations = () => {
    // Imposta pixel ratio ottimale
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    world.renderer.three.setPixelRatio(pixelRatio);

    // Abilita frustum culling
    world.scene.three.traverse((obj) => {
      if (obj.isMesh) {
        obj.frustumCulled = true;
      }
    });

    // Ottimizza geometrie
    world.scene.three.traverse((obj) => {
      if (obj.geometry) {
        obj.geometry.computeBoundingSphere();
        obj.geometry.computeBoundingBox();
      }
    });
  };

  // Event handlers
  const setupEventHandlers = () => {
    let isMoving = false;
    let lastMoveTime = 0;

    world.camera.controls.addEventListener('start', () => {
      isMoving = true;
      if (world.renderer.postproduction.enabled) {
        world.renderer.postproduction.enabled = false;
      }
    });

    world.camera.controls.addEventListener('end', () => {
      isMoving = false;
      setTimeout(() => {
        if (!isMoving) {
          world.renderer.postproduction.enabled = true;
        }
      }, 150);
    });

    // Throttle rendering durante il movimento
    const throttledRender = () => {
      const now = Date.now();
      if (now - lastMoveTime > 16) { // ~60fps
        world.renderer.three.render(world.scene.three, world.camera.three);
        lastMoveTime = now;
      }
    };

    if (isMoving) {
      throttledRender();
    }
  };

  setupRenderingOptimizations();
  setupEventHandlers();

  return { stats };
};