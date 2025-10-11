import React, { useState, useCallback, useMemo } from 'react';
import { hydroplants } from '../data/HydroData';
import '../styles/ModelsPage.css';

// Preview con immagine reale - mantiene la stessa struttura
const Model3DPreview = React.memo(({ plant }) => {
  const [imageError, setImageError] = useState(false);
  const imagePath = `/images/centrali/${plant.name}.jpg`;
  
  if (imageError) {
    return (
      <div className="preview-placeholder">
        <span>{plant.type}</span>
      </div>
    );
  }
  
  return (
    <img 
      src={imagePath}
      alt={plant.name}
      onError={() => setImageError(true)}
      className="preview-image"
    />
  );
});

Model3DPreview.displayName = 'Model3DPreview';

const ModelPreviewCard = React.memo(({ plant, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(plant.id);
  }, [plant.id, onSelect]);

  return (
    <div className="model-preview-card" onClick={handleClick}>
      <div className="model-preview-header">
        <h3>{plant.name}</h3>
        <Model3DPreview plant={plant} />
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

const ModelsPage = ({ plantId, setCurrentPage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

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

  return (
    <div className="models-page-container">
      <div className="models-overview-container">
        <div className="bim-header-section">
          <h1>Modelli e tour virtuali</h1>
          <p className="models-overview-description">
            Naviga i modelli e accedi alle centrali idroelettriche
          </p>
        </div>

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
              <option value="A derivazione">A derivazione</option>
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