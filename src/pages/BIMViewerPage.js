import React, { useState, useEffect } from 'react';
import ModelViewer from '../components/viewer/ModelViewer5';
import { getModelFilesByPlantId, hydroplants } from '../data/HydroData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import '../styles/Viewer.css';
import '../styles/Charts.css';

const BIMViewerPage = ({ plantId, setCurrentPage }) => {
    const [modelFiles, setModelFiles] = useState(getModelFilesByPlantId(plantId));
    const [modelData, setModelData] = useState(null);
    const [selectedProperties, setSelectedProperties] = useState(null);
    const selectedPlant = hydroplants.find(plant => plant.id === plantId);
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const toggleTheme = () => {
        setIsDarkTheme(prev => !prev);
    };

    useEffect(() => {
        const loadModelData = async () => {
            try {
                const response = await fetch(modelFiles.properties);
                const data = await response.json();
                // console.log('Loaded model data:', data);
                setModelData(data);
            } catch (error) {
                console.error('Error loading model data:', error);
            }
        };

        if (modelFiles) {
            loadModelData();
        }
    }, [modelFiles]);

    const handleModelUpdate = async (newModelFiles, newModelData) => {
        try {
            // Aggiorna i file del modello locale
            setModelFiles(newModelFiles);
            setModelData(newModelData);

            // Trova l'indice della centrale corrente
            const plantIndex = hydroplants.findIndex(p => p.id === plantId);
            if (plantIndex === -1) {
                throw new Error('Plant not found');
            }

            // Aggiorna HydroData
            hydroplants[plantIndex] = {
                ...hydroplants[plantIndex],
                models: {
                    geometry: newModelFiles.geometry,
                    properties: newModelFiles.properties
                }
            };

            // Opzionalmente, salva il backup del modello precedente
            const timestamp = new Date().toISOString();
            const backupFileName = `backup_${selectedPlant.name}_${timestamp}`;
            Storage.setItem(backupFileName, JSON.stringify({
                modelFiles: modelFiles,
                modelData: modelData
            }));

            // Mostra una notifica di successo
            alert('Modello aggiornato con successo!');

        } catch (error) {
            console.error('Error updating model:', error);
            alert('Errore durante l\'aggiornamento del modello');
        }
    };

    const handleRestoreOriginal = async () => {
        if (window.confirm('Vuoi ripristinare il modello originale?')) {
            const originalFiles = getModelFilesByPlantId(plantId);
            setModelFiles(originalFiles);
            const response = await fetch(originalFiles.properties);
            const data = await response.json();
            setModelData(data);
        }
    };

    // Aggiunta del pannello dei backup
    const renderBackupsPanel = () => {
        const backups = Object.keysStorage
            .filter(key => key.startsWith(`backup_${selectedPlant.name}`))
            .map(key => ({
                name: key,
                date: key.split('_').pop().replace('.json', '')
            }));

        if (backups.length === 0) return null;

        return (
            <div className="backups-panel">
                <h4>Versioni precedenti</h4>
                <ul>
                    {backups.map(backup => (
                        <li key={backup.name}>
                            <span>{new Date(backup.date).toLocaleString()}</span>
                            <button 
                                onClick={() => {
                                    const backupData = JSON.parseStorage.getItem(backup.name);
                                    setModelFiles(backupData.modelFiles);
                                    setModelData(backupData.modelData);
                                }}
                            >
                                Ripristina
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const processModelData = (data) => {
        if (!data) return null;

        // Creiamo array per i grafici
        const elementCounts = {};
        const materialVolumes = {};

        // Processiamo ogni elemento nel modello
        Object.entries(data).forEach(([key, value]) => {
            // Contiamo i tipi di elementi
            const type = value.type || 'Unknown';
            elementCounts[type] = (elementCounts[type] || 0) + 1;

            // Sommiamo i volumi per materiale
            const material = value.material || 'Unknown';
            const volume = value.volume || 0;
            materialVolumes[material] = (materialVolumes[material] || 0) + volume;
        });

        return {
            elements: Object.entries(elementCounts).map(([name, count]) => ({ name, count })),
            materials: Object.entries(materialVolumes).map(([name, volume]) => ({ name, volume: Math.round(volume * 100) / 100 }))
        };
    };

    const renderControlPanel = () => {
        const processedData = processModelData(modelData);
        if (!processedData) return <div className="control-panel">Loading model data...</div>;

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

        return (
            <div className="control-panel">
                <h2>Centrale di {selectedPlant?.name} - Analisi Modello </h2>

                <div className="chart-section">
                    <h4>Elements</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={processedData.elements}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8">
                                {processedData.elements.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="model-stats">
                    <h3>Statistiche del Modello</h3>
                    <ul>
                        <li>Numero totale elementi: {processedData.elements.reduce((acc, curr) => acc + curr.count, 0)}</li>
                        <li>Tipi di elementi: {processedData.elements.length}</li>
                        <li>Materiali utilizzati: {processedData.materials.length}</li>
                    </ul>
                </div>
                <div className="model-stats">
                    <h2>Tema</h2>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkTheme ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
                </div>
            </div>
        );
        };
   
        return (
            <div className="viewer-root">
                <button 
                    className="back-button"
                    onClick={() => setCurrentPage({ page: 'models' })}
                >
                    ← Torna ai modelli
                </button>
        
                <div className="control-bar">
                </div>
        
                <div className="viewer-container">
                    <ModelViewer 
                        modelFiles={modelFiles} 
                        isDarkTheme={isDarkTheme} // Passiamo il tema al viewer
                    />
                    {renderControlPanel()}
                </div>
            </div>
        );
};

export default BIMViewerPage;