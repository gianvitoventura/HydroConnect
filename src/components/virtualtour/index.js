import React from 'react';
import ReactDOM from 'react-dom/client';
import PanoramaApp from './PanoramaApp';

// Load the required scripts before mounting the React app
document.addEventListener('DOMContentLoaded', () => {
  // Verifica se è già stato caricato e configurato APP_DATA
  if (!window.APP_DATA) {
    console.error('APP_DATA non è stato caricato. Assicurati che data.js sia caricato prima di questo script.');
  }
  
  // Crea il container root per l'app React
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <PanoramaApp />
    </React.StrictMode>
  );
});