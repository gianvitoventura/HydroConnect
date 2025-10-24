import React, { useState } from 'react';
import '../styles/CommunityPage.css';
import ProjectsSection from '../components/community/ProjectSection';
import { useCommunityMetrics } from '../components/hooks/useAnalitics';

const CommunityPage = () => {
  const [formData, setFormData] = useState({
    empathize: '',
    define: '',
    ideate: '',
    prototype: '',
    test: ''
  });
  const [notification, setNotification] = useState('');

  // 📊 METRICHE REALI DA FIREBASE
  const metrics = useCommunityMetrics();

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

  // Formatta trend con freccia e colore
  const formatTrend = (value) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return {
      text: `${isPositive ? '↑' : '↓'} ${Math.abs(value)}% questo mese`,
      className: isPositive ? 'positive' : 'negative'
    };
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
          {/* MEMBRI DELLA COMMUNITY */}
          <div className="metric-card">
            <h3>Membri della community</h3>
            {metrics.loading ? (
              <p className="metric-value">...</p>
            ) : (
              <>
                <p className="metric-value">{metrics.totalUsers}</p>
                {metrics.usersTrend !== 0 && (
                  <p className={`metric-trend ${metrics.usersTrend > 0 ? 'positive' : 'negative'}`}>
                    {metrics.usersTrend > 0 ? '↑' : '↓'} {Math.abs(metrics.usersTrend)}% questo mese
                  </p>
                )}
              </>
            )}
          </div>

          {/* PROGETTI AVVIATI */}
          <div className="metric-card">
            <h3>Progetti totali</h3>
            {metrics.loading ? (
              <p className="metric-value">...</p>
            ) : (
              <>
                <p className="metric-value">{metrics.totalProjects}</p>
                <p className="metric-trend">
                  {metrics.customProjects} creati dalla community
                </p>
              </>
            )}
          </div>

          {/* VOTI TOTALI */}
          <div className="metric-card">
            <h3>Voti raccolti</h3>
            {metrics.loading ? (
              <p className="metric-value">...</p>
            ) : (
              <>
                <p className="metric-value">{metrics.totalVotes}</p>
                <p className="metric-trend positive">
                  {metrics.totalProjects > 0 
                    ? `Media ${(metrics.totalVotes / metrics.totalProjects).toFixed(1)} voti/progetto`
                    : 'Inizia a votare!'}
                </p>
              </>
            )}
          </div>

          {/* COINVOLGIMENTO */}
          <div className="metric-card">
            <h3>Coinvolgimento</h3>
            {metrics.loading ? (
              <p className="metric-value">...</p>
            ) : (
              <>
                <p className="metric-value">{metrics.engagement}%</p>
                <p className="metric-trend positive">
                  {metrics.engagement > 70 ? '↑ Ottimo engagement!' : 'Partecipa anche tu!'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Messaggio di errore se c'è */}
        {metrics.error && (
          <div className="metrics-error">
            ⚠️ Errore nel caricamento delle metriche. Riprova più tardi.
          </div>
        )}
      </div>

      {/* 🗃️ SEZIONE PROGETTI */}
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
                description: 'Definisci il problema specifico che vuoi risolvere'
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