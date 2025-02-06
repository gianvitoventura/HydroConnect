import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { hydroplants } from '../data/HydroData';
import '../styles/ModelsPage.css';

// Componente per il cubo 3D di preview ottimizzato
const PreviewCube = React.memo(() => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#3b82f6" roughness={0.5} metalness={0.5} />
    </mesh>
  );
});

PreviewCube.displayName = 'PreviewCube';

// Componente per il visualizzatore 3D di preview
const Model3DPreview = React.memo(({ plantType }) => {
  // Configurazione basata sul tipo di centrale
  const config = useMemo(() => {
    const configs = {
      default: { position: [5, 5, 5]}
    };
    return configs[plantType] || configs.default;
  }, [plantType]);

  return (
    <Canvas camera={{ position: config.position, fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <PreviewCube />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={4}
      />
      <Environment preset="city" />
    </Canvas>
  );
});

Model3DPreview.displayName = 'Model3DPreview';

// Componente per la card di preview del modello
const ModelPreviewCard = React.memo(({ plant, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(plant.id);
  }, [plant.id, onSelect]);

  return (
    <div className="model-preview-card" onClick={handleClick}>
      <div className="model-preview-header">
        <h3>{plant.name}</h3>
        <span className="model-type">{plant.type}</span>
      </div>
      <div className="model-thumbnail">
        <Model3DPreview plantType={plant.type} />
      </div>
      <div className="model-info">
        <div className="info-grid">
          {['power', 'jump', 'waterflow'].map((field) => (
            <div key={field} className="info-row">
              <span className="info-label">
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </span>
              <span className="info-value">{plant[field]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ModelPreviewCard.displayName = 'ModelPreviewCard';

// Componente principale della pagina
const ModelsPage = ({ plantId, setCurrentPage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filtraggio e ordinamento dei modelli
  const filteredModels = useMemo(() => {
    return hydroplants
      .filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || plant.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'power':
            return parseFloat(a.power) - parseFloat(b.power);
          case 'jump':
            return parseFloat(a.jump) - parseFloat(b.jump);
          case 'waterflow':
            return parseFloat(a.waterflow) - parseFloat(b.waterflow);
          default:
            return 0;
        }
      });
  }, [searchTerm, filterType, sortBy]);

  const handleSelectModel = useCallback((id) => {
    setCurrentPage({ page: 'bim', plantId: id });
  }, [setCurrentPage]);

  // Rendering della griglia dei modelli
  return (
    <div className="models-page-container">
      <div className="models-overview-container">
        <div className="header-section">
          <h1>BIM Models</h1>
            <p className="models-overview-description">
            Naviga i modelli BIM e accedi alle centrali idroelettriche
          </p>
        </div>

        {/* Controlli di ricerca e filtro */}
        <div className="controls-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Cerca modello..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tutti gli impianti</option>
              <option value="A bacino">A bacino</option>
              <option value="Ad acqua fluente">Ad acqua fluente</option>
              <option value="Ad accumulo">Ad accumulo</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Nome</option>
              <option value="power">Potenza</option>
              <option value="jump">Salto</option>
              <option value="waterflow">Flusso d'acqua</option>
            </select>
          </div>
        </div>

        {/* Griglia dei modelli */}
        {filteredModels.length > 0 ? (
          <div className="models-grid">
            {filteredModels.map(plant => (
              <ModelPreviewCard
                key={plant.id}
                plant={plant}
                onSelect={handleSelectModel}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Nessun modello trovato</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelsPage;