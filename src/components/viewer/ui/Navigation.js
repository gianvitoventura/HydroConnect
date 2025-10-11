import React from 'react';
import { Camera, Grid, View } from 'lucide-react';

export const setupNavigation = (components, world) => {
  const setupCameraControls = () => {
    if (!world?.camera?.controls) return;
    const controls = world.camera.controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 1;
    controls.maxDistance = 100;
  };

  return { setupCameraControls };
};

const PREDEFINED_VIEWS = {
  top: { position: [0, 20, 0], target: [0, 0, 0] },
  front: { position: [0, 0, 20], target: [0, 0, 0] },
  right: { position: [20, 0, 0], target: [0, 0, 0] },
  left: { position: [-20, 0, 0], target: [0, 0, 0] },
  isometric: { position: [20, 20, 20], target: [0, 0, 0] }
};

export const Navigation = ({ world, cameraMode, setCameraMode }) => {
  const handleViewChange = (viewName) => {
    const camera = world?.camera;
    if (!camera) return;
    
    const view = PREDEFINED_VIEWS[viewName];
    camera.controls.setLookAt(
      ...view.position,
      ...view.target,
      true // animate
    );
  };

  const toggleProjection = () => {
    const camera = world?.camera;
    if (!camera) return;
    
    camera.projection.toggle();
    setCameraMode(camera.projection.current.toLowerCase());
  };

  return (
    <div className="navigation-controls absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
      <div className="flex space-x-2">
        {Object.keys(PREDEFINED_VIEWS).map((viewName) => (
          <button
            key={viewName}
            onClick={() => handleViewChange(viewName)}
            className="p-2 hover:bg-blue-50 rounded-lg"
            title={`View ${viewName}`}
          >
            <View className="w-5 h-5 text-blue-600" />
          </button>
        ))}
      </div>

      <button
        onClick={toggleProjection}
        className="w-full p-2 flex items-center justify-center space-x-2 hover:bg-blue-50 rounded-lg"
        title="Toggle projection mode"
      >
        <Camera className="w-5 h-5 text-blue-600" />
        <span className="text-sm text-gray-600">
          {cameraMode === 'perspective' ? 'Perspective' : 'Orthographic'}
        </span>
      </button>
    </div>
  );
};