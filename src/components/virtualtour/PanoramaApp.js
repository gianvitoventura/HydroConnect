import React, { useEffect, useRef, useState } from 'react';
import '../../styles/PanoramaApp.css';

// Per importare le dipendenze correttamente in React
import Marzipano from 'marzipano';
import bowser from 'bowser';
import screenfull from 'screenfull';

// Importa i dati da file locale invece di usare window.APP_DATA
import APP_DATA from './data'; // Assicurati che questo file esista

// Importa le immagini necessarie per i controlli
import linkIcon from './img/link.png';
import infoIcon from './img/info.png';
import closeIcon from './img/close.png';
import pauseIcon from './img/pause.png';
import playIcon from './img/play.png';
import windowedIcon from './img/windowed.png';
import fullscreenIcon from './img/fullscreen.png';
import collapseIcon from './img/collapse.png';
import expandIcon from './img/expand.png';
import upIcon from './img/up.png';
import downIcon from './img/down.png';
import leftIcon from './img/left.png';
import rightIcon from './img/right.png';
import plusIcon from './img/plus.png';
import minusIcon from './img/minus.png';

const PanoramaApp = () => {
  const panoRef = useRef(null);
  const [sceneName, setSceneName] = useState('');
  const [isSceneListEnabled, setIsSceneListEnabled] = useState(false);
  const [isAutorotateEnabled, setIsAutorotateEnabled] = useState(false);
  const [isFullscreenEnabled, setIsFullscreenEnabled] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState('');
  
  // Riferimenti alle variabili e funzioni che verranno inizializzate nell'useEffect
  const viewerRef = useRef(null);
  const scenesRef = useRef([]);
  const autorotateRef = useRef(null);
  const controlsInitializedRef = useRef(false);
  
  // Helper functions
  const sanitize = (s) => {
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  };
  
  const startAutorotate = () => {
    if (!isAutorotateEnabled || !viewerRef.current || !autorotateRef.current) {
      return;
    }
    viewerRef.current.startMovement(autorotateRef.current);
    viewerRef.current.setIdleMovement(3000, autorotateRef.current);
  };
  
  const stopAutorotate = () => {
    if (!viewerRef.current) return;
    viewerRef.current.stopMovement();
    viewerRef.current.setIdleMovement(Infinity);
  };
  
  const updateSceneName = (scene) => {
    setSceneName(sanitize(scene.data.name));
  };
  
  const switchScene = (scene) => {
    if (!scene) return;
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    startAutorotate();
    updateSceneName(scene);
    setCurrentSceneId(scene.data.id);
  };
  
  const findSceneById = (id) => {
    for (let i = 0; i < scenesRef.current.length; i++) {
      if (scenesRef.current[i].data.id === id) {
        return scenesRef.current[i];
      }
    }
    return null;
  };
  
  const findSceneDataById = (id) => {
    for (let i = 0; i < APP_DATA.scenes.length; i++) {
      if (APP_DATA.scenes[i].id === id) {
        return APP_DATA.scenes[i];
      }
    }
    return null;
  };
  
  // Prevent touch and scroll events from reaching the parent element.
  const stopTouchAndScrollEventPropagation = (element) => {
    const eventList = [
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'wheel', 'mousewheel'
    ];
    for (let i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event) {
        event.stopPropagation();
      });
    }
  };
  
  const createLinkHotspotElement = (hotspot) => {
    // Create wrapper element to hold icon and tooltip.
    const wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    // Create image element.
    const icon = document.createElement('img');
    icon.src = linkIcon; // Usa l'import invece del percorso statico
    icon.classList.add('link-hotspot-icon');

    // Set rotation transform.
    const transformProperties = ['-ms-transform', '-webkit-transform', 'transform'];
    for (let i = 0; i < transformProperties.length; i++) {
      const property = transformProperties[i];
      icon.style[property] = 'rotate(' + hotspot.rotation + 'rad)';
    }

    // Add click event handler.
    wrapper.addEventListener('click', function() {
      switchScene(findSceneById(hotspot.target));
    });

    // Prevent touch and scroll events from reaching the parent element.
    stopTouchAndScrollEventPropagation(wrapper);

    // Create tooltip element.
    const tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip');
    tooltip.classList.add('link-hotspot-tooltip');
    tooltip.innerHTML = findSceneDataById(hotspot.target).name;

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  };
  
  const createInfoHotspotElement = (hotspot) => {
    // Create wrapper element to hold icon and tooltip.
    const wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('info-hotspot');

    // Create hotspot/tooltip header.
    const header = document.createElement('div');
    header.classList.add('info-hotspot-header');

    // Create image element.
    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    const icon = document.createElement('img');
    icon.src = infoIcon; // Usa l'import invece del percorso statico
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);

    // Create title element.
    const titleWrapper = document.createElement('div');
    titleWrapper.classList.add('info-hotspot-title-wrapper');
    const title = document.createElement('div');
    title.classList.add('info-hotspot-title');
    title.innerHTML = hotspot.title;
    titleWrapper.appendChild(title);

    // Create close element.
    const closeWrapper = document.createElement('div');
    closeWrapper.classList.add('info-hotspot-close-wrapper');
    const closeIcon = document.createElement('img');
    closeIcon.src = closeIcon; // Usa l'import invece del percorso statico
    closeIcon.classList.add('info-hotspot-close-icon');
    closeWrapper.appendChild(closeIcon);

    // Construct header element.
    header.appendChild(iconWrapper);
    header.appendChild(titleWrapper);
    header.appendChild(closeWrapper);

    // Create text element.
    const text = document.createElement('div');
    text.classList.add('info-hotspot-text');
    text.innerHTML = hotspot.text;

    // Place header and text into wrapper element.
    wrapper.appendChild(header);
    wrapper.appendChild(text);

    // Create a modal for the hotspot content to appear on mobile mode.
    const modal = document.createElement('div');
    modal.innerHTML = wrapper.innerHTML;
    modal.classList.add('info-hotspot-modal');
    document.body.appendChild(modal);

    const toggle = function() {
      wrapper.classList.toggle('visible');
      modal.classList.toggle('visible');
    };

    // Show content when hotspot is clicked.
    wrapper.querySelector('.info-hotspot-header').addEventListener('click', toggle);

    // Hide content when close icon is clicked.
    modal.querySelector('.info-hotspot-close-wrapper').addEventListener('click', toggle);

    // Prevent touch and scroll events from reaching the parent element.
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  };
  
  const setupViewControls = (viewer) => {
    // Seleziona gli elementi dal DOM usando i ref di React
    const viewUpElement = document.querySelector('#viewUp');
    const viewDownElement = document.querySelector('#viewDown');
    const viewLeftElement = document.querySelector('#viewLeft');
    const viewRightElement = document.querySelector('#viewRight');
    const viewInElement = document.querySelector('#viewIn');
    const viewOutElement = document.querySelector('#viewOut');
    
    if (!viewUpElement || !viewDownElement || !viewLeftElement || 
        !viewRightElement || !viewInElement || !viewOutElement) {
      console.error("Controlli di vista non trovati nel DOM");
      return;
    }

    // Dynamic parameters for controls.
    const velocity = 0.7;
    const friction = 3;

    // Associate view controls with elements.
    const controls = viewer.controls();
    controls.registerMethod('upElement',    new Marzipano.ElementPressControlMethod(viewUpElement,     'y', -velocity, friction), true);
    controls.registerMethod('downElement',  new Marzipano.ElementPressControlMethod(viewDownElement,   'y',  velocity, friction), true);
    controls.registerMethod('leftElement',  new Marzipano.ElementPressControlMethod(viewLeftElement,   'x', -velocity, friction), true);
    controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(viewRightElement,  'x',  velocity, friction), true);
    controls.registerMethod('inElement',    new Marzipano.ElementPressControlMethod(viewInElement,  'zoom', -velocity, friction), true);
    controls.registerMethod('outElement',   new Marzipano.ElementPressControlMethod(viewOutElement, 'zoom',  velocity, friction), true);
    
    controlsInitializedRef.current = true;
  };
  
  // Detect desktop or mobile mode
  useEffect(() => {
    const setMode = () => {
      if (window.matchMedia("(max-width: 500px), (max-height: 500px)").matches) {
        document.body.classList.remove('desktop');
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
        document.body.classList.add('desktop');
      }
    };
    
    setMode();
    
    const mql = window.matchMedia("(max-width: 500px), (max-height: 500px)");
    if (mql.addEventListener) {
      mql.addEventListener('change', setMode);
    } else if (mql.addListener) {
      // Fallback per vecchi browser
      mql.addListener(setMode);
    }
    
    // Touch detection
    document.body.classList.add('no-touch');
    const touchStartHandler = () => {
      document.body.classList.remove('no-touch');
      document.body.classList.add('touch');
      window.removeEventListener('touchstart', touchStartHandler);
    };
    window.addEventListener('touchstart', touchStartHandler);
    
    // Tooltip fallback mode for older browsers
    if (bowser.msie && parseFloat(bowser.version) < 11) {
      document.body.classList.add('tooltip-fallback');
    }
    
    // Desktop scene list setup
    if (!document.body.classList.contains('mobile')) {
      setIsSceneListEnabled(true);
    }
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', setMode);
      } else if (mql.removeListener) {
        mql.removeListener(setMode);
      }
      window.removeEventListener('touchstart', touchStartHandler);
    };
  }, []);
  
  // Initialize Marzipano
  useEffect(() => {
    if (!panoRef.current) return;
    
    // Viewer options.
    const viewerOpts = {
      controls: {
        mouseViewMode: APP_DATA.settings.mouseViewMode
      }
    };
    
    // Initialize viewer.
    const viewer = new Marzipano.Viewer(panoRef.current, viewerOpts);
    viewerRef.current = viewer;
    
    // Create scenes.
    const scenes = APP_DATA.scenes.map(function(data) {
      // Usa il percorso relativo alla tua struttura file di React
      const urlPrefix = process.env.PUBLIC_URL + "/tiles";
      const source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
        { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" }
      );
      const geometry = new Marzipano.CubeGeometry(data.levels);
      
      const limiter = Marzipano.RectilinearView.limit.traditional(data.faceSize, 100*Math.PI/180, 120*Math.PI/180);
      const view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);
      
      const scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true
      });
      
      // Create link hotspots.
      if (data.linkHotspots) {
        data.linkHotspots.forEach(function(hotspot) {
          const element = createLinkHotspotElement(hotspot);
          scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
        });
      }
      
      // Create info hotspots.
      if (data.infoHotspots) {
        data.infoHotspots.forEach(function(hotspot) {
          const element = createInfoHotspotElement(hotspot);
          scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
        });
      }
      
      return {
        data: data,
        scene: scene,
        view: view
      };
    });
    scenesRef.current = scenes;
    
    // Set up autorotate
    const autorotate = Marzipano.autorotate({
      yawSpeed: 0.03,
      targetPitch: 0,
      targetFov: Math.PI/2
    });
    autorotateRef.current = autorotate;
    
    if (APP_DATA.settings.autorotateEnabled) {
      setIsAutorotateEnabled(true);
    }
    
    // Set up fullscreen mode, if supported.
    if (screenfull.isEnabled && APP_DATA.settings.fullscreenButton) {
      document.body.classList.add('fullscreen-enabled');
      screenfull.on('change', function() {
        setIsFullscreenEnabled(screenfull.isFullscreen);
      });
    } else {
      document.body.classList.add('fullscreen-disabled');
    }
    
    // Display the initial scene.
    if (scenes.length > 0) {
      switchScene(scenes[0]);
    }
    
    return () => {
      // Cleanup
      if (screenfull.isEnabled) {
        screenfull.off('change');
      }
      stopAutorotate();
    };
  }, []);
  
  // Setup view controls after render
  useEffect(() => {
    if (viewerRef.current && !controlsInitializedRef.current) {
      // Mettiamo un timeout per assicurarci che tutti gli elementi siano renderizzati
      const timer = setTimeout(() => {
        setupViewControls(viewerRef.current);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Event handlers
  const handleToggleSceneList = () => {
    setIsSceneListEnabled(!isSceneListEnabled);
  };
  
  const handleToggleAutorotate = () => {
    const newState = !isAutorotateEnabled;
    setIsAutorotateEnabled(newState);
    
    if (newState) {
      viewerRef.current.startMovement(autorotateRef.current);
      viewerRef.current.setIdleMovement(3000, autorotateRef.current);
    } else {
      viewerRef.current.stopMovement();
      viewerRef.current.setIdleMovement(Infinity);
    }
  };
  
  const handleFullscreenToggle = () => {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  };
  
  const handleSceneClick = (sceneId) => {
    const scene = scenesRef.current.find(scene => scene.data.id === sceneId);
    if (scene) {
      scene.view.setParameters(scene.data.initialViewParameters);
      scene.scene.switchTo();
      setSceneName(scene.data.name);
      setCurrentSceneId(scene.data.id);
      
      // On mobile, hide scene list after selecting a scene
      if (document.body.classList.contains('mobile')) {
        setIsSceneListEnabled(false);
      }
    }
  };
  
  return (
    <div className="panorama-container">
      <div id="pano" ref={panoRef}></div>
      <div id="titleBar">
        <h2 className="sceneName">{sceneName}</h2>
      </div>
      
      <a href="#" id="autorotateToggle" onClick={(e) => {
        e.preventDefault();
        handleToggleAutorotate();
      }}>
        <img className={`icon ${isAutorotateEnabled ? 'on' : 'off'}`} src={isAutorotateEnabled ? pauseIcon : playIcon} alt="autorotate" />
      </a>
      
      <a href="#" id="fullscreenToggle" onClick={(e) => {
        e.preventDefault();
        handleFullscreenToggle();
      }}>
        <img className={`icon ${isFullscreenEnabled ? 'on' : 'off'}`} src={isFullscreenEnabled ? windowedIcon : fullscreenIcon} alt="fullscreen" />
      </a>
      
      <a href="#" id="sceneListToggle" onClick={(e) => {
        e.preventDefault();
        handleToggleSceneList();
      }}>
        <img className={`icon ${isSceneListEnabled ? 'on' : 'off'}`} src={isSceneListEnabled ? collapseIcon : expandIcon} alt="scene list" />
      </a>
      
      <a href="#" id="viewUp" className="viewControlButton viewControlButton-1">
        <img className="icon" src={upIcon} alt="view up" />
      </a>
      <a href="#" id="viewDown" className="viewControlButton viewControlButton-2">
        <img className="icon" src={downIcon} alt="view down" />
      </a>
      <a href="#" id="viewLeft" className="viewControlButton viewControlButton-3">
        <img className="icon" src={leftIcon} alt="view left" />
      </a>
      <a href="#" id="viewRight" className="viewControlButton viewControlButton-4">
        <img className="icon" src={rightIcon} alt="view right" />
      </a>
      <a href="#" id="viewIn" className="viewControlButton viewControlButton-5">
        <img className="icon" src={plusIcon} alt="zoom in" />
      </a>
      <a href="#" id="viewOut" className="viewControlButton viewControlButton-6">
        <img className="icon" src={minusIcon} alt="zoom out" />
      </a>

      <div id="sceneList" className={isSceneListEnabled ? 'enabled' : ''}>
      <div className="sceneListContent">
      <h2>Foto 360</h2>
        <ul className="scenes">
          {APP_DATA.scenes.map((scene) => (
            <a 
              href="#"
              key={scene.id}
              className={`scene ${currentSceneId === scene.id ? 'current' : ''}`} 
              data-id={scene.id}
              onClick={(e) => {
                e.preventDefault();
                handleSceneClick(scene.id);
              }}
            >
              <li className="text">{scene.name}</li>
            </a>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
};

export default PanoramaApp;