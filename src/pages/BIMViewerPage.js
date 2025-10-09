import React, { useState, useEffect, useCallback, useRef } from 'react';
import ModelViewer from '../components/viewer/ModelViewer5';
import { getModelFilesByPlantId, hydroplants } from '../data/HydroData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, PieChart, Pie, Sector } from 'recharts';
import '../styles/Viewer.css';
import '../styles/Charts.css';

// Mappa per tradurre gli ID degli elementi IFC in nomi leggibili
const IFC_TYPE_NAMES = {
  'IFCWALL': 'Muro',
  'IFCSLAB': 'Pavimento/Soffitto',
  'IFCWINDOW': 'Finestra',
  'IFCDOOR': 'Porta',
  'IFCCOLUMN': 'Colonna',
  'IFCBEAM': 'Trave',
  'IFCFURNISHINGELEMENT': 'Arredo',
  'IFCMEMBER': 'Elemento strutturale',
  'IFCPLATE': 'Piastra',
  'IFCBUILDINGELEMENTPROXY': 'Elemento generico',
  'IFCSPACE': 'Spazio',
  'IFCPIPE': 'Tubo',
  'IFCDUCTFITTING': 'Raccordo condotto',
  'IFCPIPEFITTING': 'Raccordo tubo',
  'IFCFLOWCONTROLLER': 'Controllo flusso',
  'IFCFLOWTERMINAL': 'Terminale',
  'IFCELECTRICALDISTRIBUTIONPOINT': 'Punto distribuzione elettrica',
  'IFCELECTRICDISTRIBUTIONBOARD': 'Quadro elettrico',
  'IFCDISTRIBUTIONPORT': 'Porta distribuzione',
  '101040310': 'Elemento strutturale',
  '104500335': 'Componente meccanico',
  '259703031': 'Elemento idraulico',
  '425292144': 'Elemento elettrico',
  // Aggiungi altri mapping in base alle necessità
};

// Colori per categorie specifiche
const CATEGORY_COLORS = {
  'Muro': '#8884d8',
  'Pavimento/Soffitto': '#83a6ed',
  'Finestra': '#8dd1e1',
  'Porta': '#82ca9d',
  'Colonna': '#a4de6c',
  'Trave': '#d0ed57',
  'Arredo': '#ffc658',
  'Elemento strutturale': '#ff8042',
  'Elemento idraulico': '#0088FE',
  'Elemento elettrico': '#FF8042',
  'Componente meccanico': '#00C49F',
  // Aggiungi altri colori in base alle necessità
};

// Funzione per ottenere nomi leggibili dagli ID
const getReadableName = (id) => {
  return IFC_TYPE_NAMES[id] || id;
};

// Funzione per ottenere il colore in base alla categoria
const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#8884d8'; // Colore di default se non trovato
};

const BIMViewerPage = ({ plantId, setCurrentPage }) => {
    const [modelFiles, setModelFiles] = useState(getModelFilesByPlantId(plantId));
    const [modelData, setModelData] = useState(null);
    const [processedData, setProcessedData] = useState(null);
    const [hierarchyData, setHierarchyData] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const [viewMode, setViewMode] = useState('standard'); // standard, wireframe, xray
    const [modelStatistics, setModelStatistics] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedProperties, setSelectedProperties] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [viewSection, setViewSection] = useState('model'); // model, hierarchy, properties, statistics
    const viewerRef = useRef(null);
    
    // Stato per gestire il tipo di gerarchia visualizzata
    const [hierarchyType, setHierarchyType] = useState('byType');
    
    const selectedPlant = hydroplants.find(plant => plant.id === plantId);
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    // Creiamo un riferimento al componente ModelViewer
    const modelViewerRef = useRef(null);

    const toggleTheme = () => {
        setIsDarkTheme(prev => !prev);
    };

    const setViewerRef = useCallback((ref) => {
        viewerRef.current = ref;
        if (modelViewerRef.current) {
            modelViewerRef.current = ref;
        }
    }, []);

    // Caricamento dei dati del modello
    useEffect(() => {
        const loadModelData = async () => {
            setIsLoadingData(true);
            try {
                const response = await fetch(modelFiles.properties);
                const data = await response.json();
                setModelData(data);
                
                // Processa i dati del modello
                const processed = processModelData(data);
                setProcessedData(processed);
                
                // Calcola le statistiche
                calculateModelStatistics(data);
                
                // Genera dati gerarchici
                generateHierarchyData(data);
                
                setIsLoadingData(false);
            } catch (error) {
                console.error('Error loading model data:', error);
                setIsLoadingData(false);
            }
        };

        if (modelFiles) {
            loadModelData();
        }
    }, [modelFiles]);


    // Funzione per processare i dati del modello
    const processModelData = (data) => {
        if (!data) return null;

        // Creiamo array per i grafici
        const elementCounts = {};
        const materialVolumes = {};
        const levelCounts = {};
        const systemCounts = {};

        // Processiamo ogni elemento nel modello
        Object.entries(data).forEach(([key, value]) => {
            // Tipo di elemento (converti in nome leggibile)
            const typeId = value.type || value.ifcType || 'Unknown';
            const typeName = getReadableName(typeId);
            elementCounts[typeName] = (elementCounts[typeName] || 0) + 1;

            // Materiale
            const material = value.Material?.value || value.material || 'Sconosciuto';
            const volume = value.volume || 0;
            materialVolumes[material] = (materialVolumes[material] || 0) + volume;

            // Livello
            const level = value.Level?.value || value.level || 'Non specificato';
            levelCounts[level] = (levelCounts[level] || 0) + 1;

            // Sistema
            const system = value.System?.value || value.system || 'Generico';
            systemCounts[system] = (systemCounts[system] || 0) + 1;
        });

        // Ordina e limita gli elementi al top 10 per leggibilità
        const topElements = Object.entries(elementCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({
                name,
                count,
                color: getCategoryColor(name)
            }));

        // Calcola le percentuali per ogni elemento
        const totalElements = Object.values(elementCounts).reduce((a, b) => a + b, 0);
        topElements.forEach(element => {
            element.percentage = ((element.count / totalElements) * 100).toFixed(1);
        });

        return {
            elements: topElements,
            allElements: Object.entries(elementCounts).map(([name, count]) => ({ name, count })),
            materials: Object.entries(materialVolumes)
                .sort((a, b) => b[1] - a[1])
                .map(([name, volume]) => ({ name, volume: Math.round(volume * 100) / 100 })),
            levels: Object.entries(levelCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => ({ name, count })),
            systems: Object.entries(systemCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => ({ name, count })),
            totalElements
        };
    };

    // Calcola statistiche del modello
    const calculateModelStatistics = (data) => {
        if (!data) return;
        
        const totalElements = Object.keys(data).length;
        const elementTypes = new Set();
        let totalVolume = 0;
        let totalArea = 0;
        const materials = new Set();
        const levels = new Set();

        // Analizza tutti gli elementi
        Object.values(data).forEach(element => {
            if (element.type) elementTypes.add(element.type);
            if (element.Material?.value) materials.add(element.Material.value);
            if (element.Level?.value) levels.add(element.Level.value);
            
            // Calcola volumi e aree se disponibili
            if (element.volume) totalVolume += parseFloat(element.volume);
            if (element.area) totalArea += parseFloat(element.area);
        });

        setModelStatistics({
            totalElements,
            uniqueTypes: elementTypes.size,
            uniqueMaterials: materials.size,
            uniqueLevels: levels.size,
            totalVolume: Math.round(totalVolume * 100) / 100,
            totalArea: Math.round(totalArea * 100) / 100
        });
    };

    // Genera dati gerarchici per la visualizzazione ad albero
    const generateHierarchyData = (data) => {
        if (!data) return;
        
        // Organizza per tipo/categoria
        const byType = {};
        const byLevel = {};
        const bySystem = {};
        
        Object.entries(data).forEach(([id, element]) => {
            // Per tipo
            const type = getReadableName(element.type || 'Unknown');
            if (!byType[type]) byType[type] = [];
            byType[type].push({ id, name: element.Name?.value || `ID: ${id}` });
            
            // Per livello
            const level = element.Level?.value || 'Non specificato';
            if (!byLevel[level]) byLevel[level] = [];
            byLevel[level].push({ id, name: element.Name?.value || `ID: ${id}` });
            
            // Per sistema
            const system = element.System?.value || 'Generico';
            if (!bySystem[system]) bySystem[system] = [];
            bySystem[system].push({ id, name: element.Name?.value || `ID: ${id}` });
        });
        
        setHierarchyData({
            byType,
            byLevel,
            bySystem
        });
    };

    // Gestisce il click su un elemento dalla gerarchia
    const handleElementClick = (elementId) => {
        if (!modelData || !elementId) return;
        
        const element = modelData[elementId];
        if (element) {
            setSelectedElement(element);
            
            // Evidenzia l'elemento nel visualizzatore se la funzione è disponibile
            if (viewerRef.current && viewerRef.current.highlightElement) {
                viewerRef.current.highlightElement(elementId);
            }
        }
    };

    // Gestisce il cambio della modalità di visualizzazione
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        
        // Applica la modalità al visualizzatore se la funzione è disponibile
        if (viewerRef.current && viewerRef.current.setViewMode) {
            viewerRef.current.setViewMode(mode);
        }
    };

    // Gestisce il click su una categoria nel grafico
    const handleCategoryClick = (category) => {
        setActiveCategory(activeCategory === category ? null : category);
        
        // Evidenzia tutti gli elementi di questa categoria se la funzione è disponibile
        if (viewerRef.current && viewerRef.current.highlightByCategory) {
            viewerRef.current.highlightByCategory(category);
        }
    };

    // Componente per il tooltip personalizzato del grafico
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{`${label}`}</p>
                    <p className="tooltip-value">{`Conteggio: ${payload[0].value}`}</p>
                    {payload[0].payload.percentage && (
                        <p className="tooltip-percentage">{`${payload[0].payload.percentage}% del totale`}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    // Componente per il settore attivo nel grafico a torta
    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, name, value, percent } = props;
      
        return (
            <g>
                <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill}>
                    {name}
                </text>
                <text x={cx} y={cy} textAnchor="middle" fill="#333">
                    {`${value} (${(percent * 100).toFixed(1)}%)`}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 6}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
            </g>
        );
    };

    // Renderizza il pannello della gerarchia
    const renderHierarchyPanel = () => {
        if (!hierarchyData) return <div>Caricamento gerarchia...</div>;
        
        const currentHierarchy = hierarchyData[hierarchyType] || {};
        
        return (
            <div className="hierarchy-panel">
                <div className="hierarchy-selector">
                    <button 
                        className={hierarchyType === 'byType' ? 'active' : ''} 
                        onClick={() => setHierarchyType('byType')}
                    >
                        Per Categoria
                    </button>
                    <button 
                        className={hierarchyType === 'byLevel' ? 'active' : ''} 
                        onClick={() => setHierarchyType('byLevel')}
                    >
                        Per Livello
                    </button>
                    <button 
                        className={hierarchyType === 'bySystem' ? 'active' : ''} 
                        onClick={() => setHierarchyType('bySystem')}
                    >
                        Per Sistema
                    </button>
                </div>
                
                <div className="hierarchy-tree">
                    {Object.entries(currentHierarchy).map(([category, elements]) => (
                        <div key={category} className="hierarchy-category">
                            <div 
                                className="category-header"
                                style={{ backgroundColor: getCategoryColor(category) + '40' }} // Colore con trasparenza
                                onClick={() => handleCategoryClick(category)}
                            >
                                <span className="category-name">{category}</span>
                                <span className="category-count">{elements.length}</span>
                            </div>
                            
                            {activeCategory === category && (
                                <ul className="element-list">
                                    {elements.map((element) => (
                                        <li 
                                            key={element.id}
                                            onClick={() => handleElementClick(element.id)}
                                            className="element-item"
                                        >
                                            {element.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Renderizza il pannello delle proprietà
    const renderPropertiesPanel = () => {
        if (!selectedElement) return (
            <div className="no-selection-message">
                <p>Seleziona un elemento nel modello o nell'elenco gerarchico per visualizzarne le proprietà.</p>
            </div>
        );
        
        // Organizza le proprietà per gruppi
        const propertyGroups = {
            'Informazioni di base': ['expressID', 'Name', 'type', 'ObjectType'],
            'Geometria': ['volume', 'area', 'length', 'width', 'height'],
            'Materiale': ['Material'],
            'Posizione': ['Level', 'Location'],
            'Altro': []
        };
        
        // Distribuisci le proprietà nei gruppi
        const groupedProperties = {};
        Object.entries(propertyGroups).forEach(([group, props]) => {
            groupedProperties[group] = {};
            props.forEach(prop => {
                if (selectedElement[prop] !== undefined) {
                    groupedProperties[group][prop] = selectedElement[prop];
                }
            });
        });
        
        // Aggiungi le proprietà rimanenti al gruppo "Altro"
        Object.entries(selectedElement).forEach(([key, value]) => {
            if (!Object.values(propertyGroups).flat().includes(key)) {
                groupedProperties['Altro'][key] = value;
            }
        });
        
        return (
            <div className="properties-panel">
                <h3>Proprietà Elemento</h3>
                
                {Object.entries(groupedProperties).map(([group, properties]) => {
                    if (Object.keys(properties).length === 0) return null;
                    
                    return (
                        <div key={group} className="property-group">
                            <h4 className="group-title">{group}</h4>
                            <table className="property-table">
                                <tbody>
                                    {Object.entries(properties).map(([key, value]) => (
                                        <tr key={key} className="property-row">
                                            <td className="property-name">{key}:</td>
                                            <td className="property-value">
                                                {typeof value === 'object' && value !== null && value.value 
                                                    ? value.value 
                                                    : JSON.stringify(value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Renderizza il pannello di controllo
    const renderControlPanel = () => {
        if (isLoadingData) return <div className="control-panel">Caricamento dati modello...</div>;
        if (!processedData) return <div className="control-panel">Nessun dato disponibile</div>;

        return (
            <div className="control-panel">
                <h2>Centrale di {selectedPlant?.name} - Analisi Modello</h2>
                
                {viewSection === 'model' && (
                    <>
                        <div className="chart-section">
                            <h4>Elementi per Categoria</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={processedData.elements}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" nameKey="name">
                                        {processedData.elements.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color || getCategoryColor(entry.name)} 
                                                onClick={() => handleCategoryClick(entry.name)}
                                                className={activeCategory === entry.name ? 'active-bar' : ''}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="chart-section">
                            <h4>Distribuzione Elementi</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        activeIndex={processedData.elements.findIndex(e => e.name === activeCategory)}
                                        activeShape={renderActiveShape}
                                        data={processedData.elements}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        dataKey="count"
                                        nameKey="name"
                                        onClick={(data) => handleCategoryClick(data.name)}
                                    >
                                        {processedData.elements.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color || getCategoryColor(entry.name)} 
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
                
                {viewSection === 'hierarchy' && renderHierarchyPanel()}
                
                {viewSection === 'properties' && renderPropertiesPanel()}
                
                {viewSection === 'statistics' && modelStatistics && (
                    <div className="statistics-section">
                        <h3>Statistiche del Modello</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{modelStatistics.totalElements.toLocaleString()}</div>
                                <div className="stat-label">Elementi totali</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{modelStatistics.uniqueTypes}</div>
                                <div className="stat-label">Tipi di elementi</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{modelStatistics.uniqueMaterials}</div>
                                <div className="stat-label">Materiali utilizzati</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{modelStatistics.uniqueLevels}</div>
                                <div className="stat-label">Livelli</div>
                            </div>
                            {modelStatistics.totalVolume > 0 && (
                                <div className="stat-card">
                                    <div className="stat-value">{modelStatistics.totalVolume.toLocaleString()} m³</div>
                                    <div className="stat-label">Volume totale</div>
                                </div>
                            )}
                            {modelStatistics.totalArea > 0 && (
                                <div className="stat-card">
                                    <div className="stat-value">{modelStatistics.totalArea.toLocaleString()} m²</div>
                                    <div className="stat-label">Area totale</div>
                                </div>
                            )}
                        </div>
                        
                        <div className="model-controls">
                            <h4>Visualizzazione</h4>
                            <div className="view-mode-buttons">
                                <button 
                                    className={viewMode === 'standard' ? 'active' : ''} 
                                    onClick={() => handleViewModeChange('standard')}
                                >
                                    Standard
                                </button>
                                <button 
                                    className={viewMode === 'wireframe' ? 'active' : ''} 
                                    onClick={() => handleViewModeChange('wireframe')}
                                >
                                    Wireframe
                                </button>
                                <button 
                                    className={viewMode === 'xray' ? 'active' : ''} 
                                    onClick={() => handleViewModeChange('xray')}
                                >
                                    X-Ray
                                </button>
                                <button 
                                    className={isDarkTheme ? 'active' : ''} 
                                    onClick={toggleTheme}
                                >
                                    {isDarkTheme ? '🌙 Tema scuro' : '☀️ Tema chiaro'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`viewer-root ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
            <button 
                className="back-button"
                onClick={() => setCurrentPage({ page: 'models' })}
            >
                ← Torna ai modelli
            </button>
    
            <div className="viewer-container">
                <ModelViewer 
                    ref={setViewerRef}
                    modelFiles={modelFiles} 
                    isDarkTheme={isDarkTheme}
                    onElementSelect={(element) => setSelectedElement(element)}
                />
                {renderControlPanel()}
            </div>
        </div>
    );
};

export default BIMViewerPage;