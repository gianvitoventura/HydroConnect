import React, { useState, useEffect } from 'react';
import '../styles/CommunityPage.css';
import ProjectsSection from '../components/community/ProjectSection';
import { useCommunityMetrics } from '../components/hooks/useAnalitics';
import { auth } from '../firebaseConfig';
import { saveWorkshopProgress, loadWorkshopProgress, autoSaveWorkshopProgress,resetWorkshopProgress } from '../services/DesignthinkingService';

const CommunityPage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    empathize: '',
    define: '',
    ideate: '',
    prototype: '',
    test: ''
  });
  const [summary, setSummary] = useState('');
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // 📊 METRICHE REALI DA FIREBASE
  const metrics = useCommunityMetrics();

  // Monitora autenticazione
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadSavedProgress();
      } else {
        // Resetta form se l'utente fa logout
        setFormData({
          empathize: '',
          define: '',
          ideate: '',
          prototype: '',
          test: ''
        });
        setSummary('');
      }
    });
    return unsubscribe;
  }, []);

  // Carica progressi salvati
  const loadSavedProgress = async () => {
    try {
      setLoading(true);
      const savedProgress = await loadWorkshopProgress();
      
      if (savedProgress) {
        setFormData({
          empathize: savedProgress.empathize || '',
          define: savedProgress.define || '',
          ideate: savedProgress.ideate || '',
          prototype: savedProgress.prototype || '',
          test: savedProgress.test || ''
        });
        setSummary(savedProgress.summary || '');
        setLastSaved(savedProgress.lastUpdated?.toDate?.());
        
        showNotification('✅ Progressi caricati!', 'success');
      }
    } catch (error) {
      console.error('Errore caricamento:', error);
      showNotification('⚠️ Errore nel caricamento', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  // Gestione input con auto-save
  const handleInputChange = (stage, value) => {
    if (!user) {
      showNotification('⚠️ Effettua il login per salvare i progressi', 'warning');
      return;
    }

    const newFormData = {
      ...formData,
      [stage]: value
    };
    
    setFormData(newFormData);
    
    // Auto-save dopo 2 secondi di inattività
    autoSaveWorkshopProgress({
      ...newFormData,
      summary
    });
  };

  // Gestione summary
  const handleSummaryChange = (value) => {
    if (!user) {
      showNotification('⚠️ Effettua il login per salvare i progressi', 'warning');
      return;
    }

    setSummary(value);
    
    // Auto-save
    autoSaveWorkshopProgress({
      ...formData,
      summary: value
    });
  };

  // Salvataggio manuale
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showNotification('⚠️ Effettua il login per salvare', 'warning');
      return;
    }

    try {
      setLoading(true);
      await saveWorkshopProgress({
        ...formData,
        summary
      });
      
      setLastSaved(new Date());
      showNotification('✅ Progressi salvati con successo!', 'success');
    } catch (error) {
      console.error('Errore salvataggio:', error);
      showNotification('❌ Errore nel salvataggio', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset progressi
  const handleReset = async () => {
    if (!window.confirm('Sei sicuro di voler ricominciare da capo? Tutti i progressi verranno eliminati.')) {
      return;
    }

    try {
      setLoading(true);
      await resetWorkshopProgress();
      
      setFormData({
        empathize: '',
        define: '',
        ideate: '',
        prototype: '',
        test: ''
      });
      setSummary('');
      setLastSaved(null);
      
      showNotification('🔄 Progressi resettati', 'info');
    } catch (error) {
      console.error('Errore reset:', error);
      showNotification('❌ Errore nel reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mostra notifica
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
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

      {/* Notifiche */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Dashboard Metriche */}
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
                    ? `Media punteggio ${(metrics.totalVotes / metrics.totalProjects).toFixed(1)}`
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

      {/* Design Thinking Workshop */}
      <div className="activities-section">
        <div className="design-thinking-section">
          <div className="section-header-with-actions">
            <div>
              <h2>Design Thinking Workshop</h2>
              {/* {user && lastSaved && (
                <p className="last-saved-info">
                  💾 Ultimo salvataggio: {lastSaved.toLocaleString('it-IT')}
                </p>
              )} */}
              {!user && (
                <p className="login-warning">
                  ⚠️ Effettua il login per salvare i tuoi progressi
                </p>
              )}
            </div>
            {user && (
              <button 
                onClick={handleReset} 
                className="reset-button"
                disabled={loading}
              >
                🔄 Ricomincia
              </button>
            )}
          </div>

          <div className="process-grid">
            {[
              {
                stage: 'empathize',
                title: 'Empatizza',
                description: 'Comprendi i bisogni dell\'intera community',
                icon: '🤝'
              },
              {
                stage: 'define',
                title: 'Definisci',
                description: 'Definisci il problema specifico che vuoi risolvere',
                icon: '🎯'
              },
              {
                stage: 'ideate',
                title: 'Immagina',
                description: 'Esplora e genera un ventaglio di idee e soluzioni innovative',
                icon: '💡'
              },
              {
                stage: 'prototype',
                title: 'Prototipa',
                description: 'Crea un singolo prototipo della soluzione che ti sembra migliore',
                icon: '🛠️'
              },
              {
                stage: 'test',
                title: 'Test',
                description: 'Testa la soluzione e raccogli feedback',
                icon: '🧪'
              }
            ].map(({ stage, title, description, icon }) => (
              <div key={stage} className="process-card">
                <div className="process-card-header">
                  <span className="process-icon">{icon}</span>
                  <h3>{title}</h3>
                </div>
                <p>{description}</p>
                <textarea
                  value={formData[stage]}
                  onChange={(e) => handleInputChange(stage, e.target.value)}
                  placeholder={`Inserisci le tue note per la fase ${title}...`}
                  className="process-input"
                  disabled={loading || !user}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="submit-section">
          <h3>📝 Riassumi i tuoi risultati:</h3>
          <form onSubmit={handleSubmit}>
            <label>
              <textarea
                value={summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                placeholder="Descrivi i risultati e i prossimi passi..."
                className="summary-input"
                disabled={loading || !user}
              />
            </label>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !user}
            >
              {loading ? '⏳ Salvataggio...' : '💾 Salva Progressi'}
            </button>
          </form>
          {/* {user && (
            <p className="auto-save-info">
              ℹ️ I progressi vengono salvati automaticamente dopo pochi secondi di inattività
            </p>
          )} */}
        </div>
      </div>

      {/* Attività in corso */}
      <div className="activities-section">
        <h2>Attività in Corso</h2>
        <div className="activities-grid">
          {currentActivities.map((activity, index) => (
            <div key={index} className="activity-card">
              <div className="activity-header">
                <h3>{activity.title}</h3>
                <span className="activity-status">{activity.status}</span>
              </div>
              <p className="activity-date">📅 {activity.date}</p>
              <p className="activity-participants">
                👥 {activity.participants} partecipanti
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