import React, { useState } from 'react';
import '../styles/CommunityPage.css';
import ProjectsSection from '../components/community/ProjectSection';

const CommunityPage = () => {
  const [formData, setFormData] = useState({
    empathize: '',
    define: '',
    ideate: '',
    prototype: '',
    test: ''
  });
  const [notification, setNotification] = useState('');

  // Dati attività in corso
  const currentActivities = [
    {
      title: "Workshop Energia Sostenibile",
      date: "28 Maggio 2025",
      participants: 25,
      status: "In arrivo"
    },
    {
      title: "Training Tecnico Manutenzione",
      date: "15 Giugno 2025",
      participants: 15,
      status: "Aperto"
    },
    {
      title: "Community Meeting",
      date: "1 Luglio 2025",
      participants: 40,
      status: "Pianificato"
    }
  ];

  const handleInputChange = (stage, value) => {
    setFormData(prev => ({
      ...prev,
      [stage]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotification('Progress saved successfully!');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="community-page">
      <div className="community-header-section">
        <h1>Community-Hub</h1>
        <p className="subtitle">
          Collabora con la community per migliorare la resilienza e la sostenibilità del territorio
        </p>
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

            <div className="dashboard-section">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Membri della community</h3>
            <p className="metric-value">156</p>
            <p className="metric-trend positive">↑ 12% questo mese</p>
          </div>
          <div className="metric-card">
            <h3>Progetti avviati</h3>
            <p className="metric-value">8</p>
            <p className="metric-trend">3 in corso</p>
          </div>
          <div className="metric-card">
            <h3>Ore di formazione</h3>
            <p className="metric-value">240</p>
            <p className="metric-trend positive">↑ 25% quest'anno</p>
          </div>
          <div className="metric-card">
            <h3>Coinvolgimento</h3>
            <p className="metric-value">85%</p>
            <p className="metric-trend positive">↑ questo mese</p>
          </div>
        </div>
      </div>

      {/* 🏗️ SEZIONE PROGETTI */}
      <ProjectsSection />


      <div className="activities-section">
        <div className="design-thinking-section">
          <h2>Design Thinking Workshop</h2>
          <div className="process-grid">
            {[
              {
                stage: 'empathize',
                title: 'Empatizza',
                description: 'Comprendi i bisogni dell\'intera community'
              },
              {
                stage: 'define',
                title: 'Definisci',
                description: 'Definisci il problema specifico che vouoi risolvere'
              },
              {
                stage: 'ideate',
                title: 'Immagina',
                description: 'Esplora e genera un ventaglio di idee e soluzioni innovative'
              },
              {
                stage: 'prototype',
                title: 'Prototipa',
                description: 'Crea un singolo prototipo della soluzione che ti sembra migliore'
              },
              {
                stage: 'test',
                title: 'Test',
                description: 'Testa la soluzione e raccogli feedback'
              }
            ].map(({ stage, title, description }) => (
              <div key={stage} className="process-card">
                <h3>{title}</h3>
                <p>{description}</p>
                <textarea
                  value={formData[stage]}
                  onChange={(e) => handleInputChange(stage, e.target.value)}
                  placeholder={`Inserisci le tue note per la fase ${title}...`}
                  className="process-input"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="submit-section">
          <h3>Riassumi i tuoi risultati:</h3>
          <form onSubmit={handleSubmit}>
            <label>
              <textarea
                placeholder="Descrivi i risultati e i prossimi passi..."
                className="summary-input"
              />
            </label>
            <button type="submit" className="submit-button">
              Salva Progressi
            </button>
          </form>
        </div>
      </div>

              <div className="activities-section">
          <h2>Attività in Corso</h2>
          <div className="activities-grid">
            {currentActivities.map((activity, index) => (
              <div key={index} className="activity-card">
                <div className="activity-header">
                  <h3>{activity.title}</h3>
                  <span className="activity-status">{activity.status}</span>
                </div>
                <p className="activity-date">{activity.date}</p>
                <p className="activity-participants">
                  {activity.participants} partecipanti
                </p>
                <button className="join-button">
                  Partecipa
                </button>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default CommunityPage;