import React, { useState, useEffect, useCallback, useRef } from 'react';
import ModelViewer from '../components/viewer/ModelViewer5';
import { hydroplants } from '../data/HydroData';
import { ref, getDownloadURL, getMetadata } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, PieChart, Pie, Sector } from 'recharts';
import '../styles/Viewer.css';
import '../styles/Charts.css';

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
};

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
};

const getReadableName = (id) => IFC_TYPE_NAMES[id] || id;
const getCategoryColor = (category) => CATEGORY_COLORS[category] || '#8884d8';

// Scarica un file con progress tracking via XHR
const downloadWithProgress = (url, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress(event.loaded, event.total);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error(`HTTP ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Errore di rete'));
        xhr.send();
    });
};

const formatBytes = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const BIMViewerPage = ({ plantId, setCurrentPage }) => {
    const [modelFiles, setModelFiles] = useState(null);
    const [modelData, setModelData] = useState(null);
    const [processedData, setProcessedData] = useState(null);
    const [hierarchyData, setHierarchyData] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const [viewMode, setViewMode] = useState('standard');
    const [modelStatistics, setModelStatistics] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [viewSection, setViewSection] = useState('model');
    const [hierarchyType, setHierarchyType] = useState('byType');
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    // Progress tracking
    const [loadingStage, setLoadingStage] = useState('init'); // init, downloading, processing, done
    const [downloadProgress, setDownloadProgress] = useState(0); // 0-100
    const [downloadedBytes, setDownloadedBytes] = useState(0);
    const [totalBytes, setTotalBytes] = useState(0);

    const viewerRef = useRef(null);
    const modelViewerRef = useRef(null);

    const selectedPlant = hydroplants.find(plant => plant.id === plantId);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    const setViewerRef = useCallback((r) => {
        viewerRef.current = r;
        if (modelViewerRef.current) modelViewerRef.current = r;
    }, []);

    const processModelData = useCallback((data) => {
        if (!data) return null;
        const elementCounts = {};
        const materialVolumes = {};
        const levelCounts = {};
        const systemCounts = {};

        Object.entries(data).forEach(([key, value]) => {
            const typeId = value.type || value.ifcType || 'Unknown';
            const typeName = getReadableName(typeId);
            elementCounts[typeName] = (elementCounts[typeName] || 0) + 1;

            const material = value.Material?.value || value.material || 'Sconosciuto';
            const volume = value.volume || 0;
            materialVolumes[material] = (materialVolumes[material] || 0) + volume;

            const level = value.Level?.value || value.level || 'Non specificato';
            levelCounts[level] = (levelCounts[level] || 0) + 1;

            const system = value.System?.value || value.system || 'Generico';
            systemCounts[system] = (systemCounts[system] || 0) + 1;
        });

        const totalElements = Object.values(elementCounts).reduce((a, b) => a + b, 0);
        const topElements = Object.entries(elementCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({
                name, count,
                color: getCategoryColor(name),
                percentage: ((count / totalElements) * 100).toFixed(1)
            }));

        return {
            elements: topElements,
            allElements: Object.entries(elementCounts).map(([name, count]) => ({ name, count })),
            materials: Object.entries(materialVolumes).sort((a, b) => b[1] - a[1]).map(([name, volume]) => ({ name, volume: Math.round(volume * 100) / 100 })),
            levels: Object.entries(levelCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
            systems: Object.entries(systemCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
            totalElements
        };
    }, []);

    const calculateModelStatistics = useCallback((data) => {
        if (!data) return;
        const totalElements = Object.keys(data).length;
        const elementTypes = new Set();
        let totalVolume = 0;
        let totalArea = 0;
        const materials = new Set();
        const levels = new Set();

        Object.values(data).forEach(element => {
            if (element.type) elementTypes.add(element.type);
            if (element.Material?.value) materials.add(element.Material.value);
            if (element.Level?.value) levels.add(element.Level.value);
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
    }, []);

    const generateHierarchyData = useCallback((data) => {
        if (!data) return;
        const byType = {};
        const byLevel = {};
        const bySystem = {};

        Object.entries(data).forEach(([id, element]) => {
            const type = getReadableName(element.type || 'Unknown');
            if (!byType[type]) byType[type] = [];
            byType[type].push({ id, name: element.Name?.value || `ID: ${id}` });

            const level = element.Level?.value || 'Non specificato';
            if (!byLevel[level]) byLevel[level] = [];
            byLevel[level].push({ id, name: element.Name?.value || `ID: ${id}` });

            const system = element.System?.value || 'Generico';
            if (!bySystem[system]) bySystem[system] = [];
            bySystem[system].push({ id, name: element.Name?.value || `ID: ${id}` });
        });

        setHierarchyData({ byType, byLevel, bySystem });
    }, []);

    useEffect(() => {
        const loadFromFirebase = async () => {
            setIsLoadingData(true);
            setLoadError(null);
            setLoadingStage('init');
            setDownloadProgress(0);
            setDownloadedBytes(0);
            setTotalBytes(0);

            try {
                const plant = hydroplants.find(p => p.id === plantId);
                if (!plant) throw new Error('Centrale non trovata');

                const modelName = plant.modelUrl;
                const fragRef = ref(storage, `models/${modelName}.frag`);
                const jsonRef = ref(storage, `models/${modelName}.json`);

                // Step 1: Ottieni URL e metadata
                setLoadingStage('init');
                const [fragUrl, jsonUrl, fragMetadata] = await Promise.all([
                    getDownloadURL(fragRef),
                    getDownloadURL(jsonRef),
                    getMetadata(fragRef)
                ]);

                setTotalBytes(fragMetadata.size);

                // Step 2: Scarica il .frag con progress tracking
                setLoadingStage('downloading');
                const fragBuffer = await downloadWithProgress(fragUrl, (loaded, total) => {
                    setDownloadedBytes(loaded);
                    setDownloadProgress(Math.round((loaded / total) * 100));
                });

                // Step 3: Scarica il JSON (piccolo, no progress)
                setLoadingStage('processing');
                const jsonResponse = await fetch(jsonUrl);
                const data = await jsonResponse.json();

                // Step 4: Prepara il viewer
                setModelFiles({
                    geometryBuffer: fragBuffer,
                    propertiesData: data
                });

                setModelData(data);
                setProcessedData(processModelData(data));
                calculateModelStatistics(data);
                generateHierarchyData(data);

                setLoadingStage('done');
            } catch (error) {
                console.error('Errore caricamento modello da Firebase:', error);
                setLoadError('Modello non disponibile. Assicurati di essere connesso e autenticato.');
            } finally {
                setIsLoadingData(false);
            }
        };

        loadFromFirebase();
    }, [plantId, processModelData, calculateModelStatistics, generateHierarchyData]);

    const handleElementClick = (elementId) => {
        if (!modelData || !elementId) return;
        const element = modelData[elementId];
        if (element) {
            setSelectedElement(element);
            if (viewerRef.current?.highlightElement) viewerRef.current.highlightElement(elementId);
        }
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        if (viewerRef.current?.setViewMode) viewerRef.current.setViewMode(mode);
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(activeCategory === category ? null : category);
        if (viewerRef.current?.highlightByCategory) viewerRef.current.highlightByCategory(category);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value">{`Conteggio: ${payload[0].value}`}</p>
                    {payload[0].payload.percentage && (
                        <p className="tooltip-percentage">{`${payload[0].payload.percentage}% del totale`}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, name, value, percent } = props;
        return (
            <g>
                <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill}>{name}</text>
                <text x={cx} y={cy} textAnchor="middle" fill="#333">{`${value} (${(percent * 100).toFixed(1)}%)`}</text>
                <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
                <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
            </g>
        );
    };

    const renderLoadingOverlay = () => {
        if (!isLoadingData && loadingStage !== 'done') return null;
        if (loadingStage === 'done') return null;

        const stageText = {
            init: 'Inizializzazione...',
            downloading: `Download modello`,
            processing: 'Elaborazione dati...',
        }[loadingStage] || 'Caricamento...';

        return (
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                color: 'white',
                fontFamily: 'sans-serif'
            }}>
                <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '500' }}>
                    🏗️ {stageText}
                </div>

                {loadingStage === 'downloading' && totalBytes > 0 && (
                    <>
                        <div style={{
                            width: '400px',
                            maxWidth: '80vw',
                            height: '8px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                width: `${downloadProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                                transition: 'width 0.2s ease',
                                borderRadius: '4px'
                            }} />
                        </div>

                        <div style={{ fontSize: '14px', opacity: 0.9 }}>
                            {downloadProgress}% — {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
                        </div>
                    </>
                )}

                {(loadingStage === 'init' || loadingStage === 'processing') && (
                    <div style={{
                        width: '400px',
                        maxWidth: '80vw',
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: '40%',
                            height: '100%',
                            background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                            borderRadius: '4px',
                            animation: 'indeterminate 1.5s infinite ease-in-out',
                            position: 'absolute'
                        }} />
                    </div>
                )}

                <style>{`
                    @keyframes indeterminate {
                        0% { left: -40%; }
                        100% { left: 100%; }
                    }
                `}</style>
            </div>
        );
    };

    const renderHierarchyPanel = () => {
        if (!hierarchyData) return <div>Caricamento gerarchia...</div>;
        const currentHierarchy = hierarchyData[hierarchyType] || {};
        return (
            <div className="hierarchy-panel">
                <div className="hierarchy-selector">
                    {[['byType', 'Per Categoria'], ['byLevel', 'Per Livello'], ['bySystem', 'Per Sistema']].map(([type, label]) => (
                        <button key={type} className={hierarchyType === type ? 'active' : ''} onClick={() => setHierarchyType(type)}>{label}</button>
                    ))}
                </div>
                <div className="hierarchy-tree">
                    {Object.entries(currentHierarchy).map(([category, elements]) => (
                        <div key={category} className="hierarchy-category">
                            <div className="category-header" style={{ backgroundColor: getCategoryColor(category) + '40' }} onClick={() => handleCategoryClick(category)}>
                                <span className="category-name">{category}</span>
                                <span className="category-count">{elements.length}</span>
                            </div>
                            {activeCategory === category && (
                                <ul className="element-list">
                                    {elements.map((element) => (
                                        <li key={element.id} onClick={() => handleElementClick(element.id)} className="element-item">{element.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPropertiesPanel = () => {
        if (!selectedElement) return (
            <div className="no-selection-message">
                <p>Seleziona un elemento nel modello o nell'elenco gerarchico per visualizzarne le proprietà.</p>
            </div>
        );

        const propertyGroups = {
            'Informazioni di base': ['expressID', 'Name', 'type', 'ObjectType'],
            'Geometria': ['volume', 'area', 'length', 'width', 'height'],
            'Materiale': ['Material'],
            'Posizione': ['Level', 'Location'],
            'Altro': []
        };

        const groupedProperties = {};
        Object.entries(propertyGroups).forEach(([group, props]) => {
            groupedProperties[group] = {};
            props.forEach(prop => {
                if (selectedElement[prop] !== undefined) groupedProperties[group][prop] = selectedElement[prop];
            });
        });
        Object.entries(selectedElement).forEach(([key, value]) => {
            if (!Object.values(propertyGroups).flat().includes(key)) groupedProperties['Altro'][key] = value;
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
                                                {typeof value === 'object' && value !== null && value.value ? value.value : JSON.stringify(value)}
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

    const renderControlPanel = () => {
        if (loadError) return <div className="control-panel"><p style={{ color: 'red' }}>⚠️ {loadError}</p></div>;
        if (!processedData) return <div className="control-panel">🏗️ Modello in arrivo...</div>;

        return (
            <div className="control-panel">
                <h2>Centrale di {selectedPlant?.name} - Analisi Modello</h2>

                <div className="view-section-tabs">
                    {[['model', 'Modello'], ['hierarchy', 'Gerarchia'], ['properties', 'Proprietà'], ['statistics', 'Statistiche']].map(([section, label]) => (
                        <button key={section} className={viewSection === section ? 'active' : ''} onClick={() => setViewSection(section)}>{label}</button>
                    ))}
                </div>

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
                                            <Cell key={`cell-${index}`} fill={entry.color || getCategoryColor(entry.name)} onClick={() => handleCategoryClick(entry.name)} className={activeCategory === entry.name ? 'active-bar' : ''} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="chart-section">
                            <h4>Distribuzione Elementi</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie activeIndex={processedData.elements.findIndex(e => e.name === activeCategory)} activeShape={renderActiveShape} data={processedData.elements} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="count" nameKey="name" onClick={(data) => handleCategoryClick(data.name)}>
                                        {processedData.elements.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || getCategoryColor(entry.name)} />
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
                            <div className="stat-card"><div className="stat-value">{modelStatistics.totalElements.toLocaleString()}</div><div className="stat-label">Elementi totali</div></div>
                            <div className="stat-card"><div className="stat-value">{modelStatistics.uniqueTypes}</div><div className="stat-label">Tipi di elementi</div></div>
                            <div className="stat-card"><div className="stat-value">{modelStatistics.uniqueMaterials}</div><div className="stat-label">Materiali utilizzati</div></div>
                            <div className="stat-card"><div className="stat-value">{modelStatistics.uniqueLevels}</div><div className="stat-label">Livelli</div></div>
                            {modelStatistics.totalVolume > 0 && <div className="stat-card"><div className="stat-value">{modelStatistics.totalVolume.toLocaleString()} m³</div><div className="stat-label">Volume totale</div></div>}
                            {modelStatistics.totalArea > 0 && <div className="stat-card"><div className="stat-value">{modelStatistics.totalArea.toLocaleString()} m²</div><div className="stat-label">Area totale</div></div>}
                        </div>
                        <div className="model-controls">
                            <h4>Visualizzazione</h4>
                            <div className="view-mode-buttons">
                                {[['standard', 'Standard'], ['wireframe', 'Wireframe'], ['xray', 'X-Ray']].map(([mode, label]) => (
                                    <button key={mode} className={viewMode === mode ? 'active' : ''} onClick={() => handleViewModeChange(mode)}>{label}</button>
                                ))}
                                <button className={isDarkTheme ? 'active' : ''} onClick={toggleTheme}>
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
        <div className={`viewer-root ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} style={{ position: 'relative' }}>
            <button className="back-button" onClick={() => setCurrentPage({ page: 'models' })}>
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
            {renderLoadingOverlay()}
        </div>
    );
};

export default BIMViewerPage;