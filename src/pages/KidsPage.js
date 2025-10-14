import React, { useState, useEffect } from 'react';
import { Droplet, Zap, Leaf, Award, Book, Star, Check, X} from 'lucide-react';
import '../styles/KidsPage.css';
import '../styles/KidsFont.css';

// Importazioni dei componenti
const StorybookViewer = React.lazy(() => import('../components/kids/StorybookViewer'));
const QuizGame = React.lazy(() => import('../components/kids/QuizGame'));
const BadgeCertificate = React.lazy(() => import('../components/kids/BadgeCertificate'));
const AchievementPopup = React.lazy(() => import('../components/kids/AchievementPopup'));
// const ProgressTracker = React.lazy(() => import('../components/kids/ProgressTracker'));
const CentraleIdroelettricaKids = React.lazy(() => import('../components/kids/Hydrokids'));

const KidsPage = () => {
  // Stati per la navigazione e il progresso
  const [currentView, setCurrentView] = useState('grid'); // 'grid', 'module', 'quiz', 'badge', 'interactive'
  const [currentModule, setCurrentModule] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Nuovi stati per achievement e gamificazione
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Carica progresso dal localStorage o usa valori predefiniti
  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem('kidsProgress');
    return savedProgress ? JSON.parse(savedProgress) : {
      completedLessons: 0,
      completedQuizzes: 0,
      totalPoints: 0,
      badges: [],
      interactiveCompleted: false, // Nuovo: traccia se ha completato l'interattivo
      moduleProgress: {
        'water-cycle': { completed: false, step: 0, points: 0 },
        'hydro-power': { completed: false, step: 0, points: 0 },
        'clean-energy': { completed: false, step: 0, points: 0 }
      }
    };
  });

  // Salva il progresso nel localStorage quando cambia
  useEffect(() => {
    localStorage.setItem('kidsProgress', JSON.stringify(progress));
  }, [progress]);

  // Definizione dei moduli di apprendimento
  const learningModules = [
    {
      id: 'water-cycle',
      title: 'Il Viaggio dell\'Acqua',
      icon: <Droplet className="module-icon" />,
      description: 'Scopri come l\'acqua viaggia dalla montagna al mare',
      level: 'Principiante',
      points: 100,
      badge: 'explorer',
      totalSteps: 4,
      storybookFile: 'la_gocciolina_esploratrice_1.md',
      character: {
        name: 'Goccia Blu',
        color: '#3b82f6'
      }
    },
    {
      id: 'hydro-power',
      title: 'La Centrale Idroelettrica',
      icon: <Zap className="module-icon" />,
      description: 'Come si trasforma l\'acqua in elettricità',
      level: 'Intermedio',
      points: 150,
      badge: 'engineer',
      totalSteps: 4,
      storybookFile: 'la_gocciolina_e_la_magia_dellelettricit_1.md',
      character: {
        name: 'Goccia Brillante',
        color: '#eab308'
      }
    },
    {
      id: 'clean-energy',
      title: 'Energia Pulita',
      icon: <Leaf className="module-icon" />,
      description: 'Perché l\'energia idroelettrica aiuta l\'ambiente',
      level: 'Avanzato',
      points: 200,
      badge: 'superhero',
      totalSteps: 4,
      storybookFile: 'gocciolina_e_la_magia_dellenergia_pulita_1.md',
      character: {
        name: 'Goccia Verde',
        color: '#22c55e'
      }
    }
  ];

  // Definizione delle attività interattive
  const interactiveActivities = [
    {
      id: 'hydro-plant',
      title: 'Centrale Idroelettrica Interattiva',
      className: "activity-icon",
      description: 'Esplora come funziona una vera centrale idroelettrica!',
      emoji: '🌊',
      points: 100
    }
  ];

  // Definizione dei badge
  const badges = {
    explorer: {
      name: 'Piccolo Esploratore',
      icon: <Award className="badge-icon" />,
      description: 'Hai scoperto il viaggio dell\'acqua dalla montagna al mare!'
    },
    engineer: {
      name: 'Ingegnere provetto',
      icon: <Book className="badge-icon" />,
      description: 'Hai imparato come funziona una centrale idroelettrica!'
    },
    superhero: {
      name: 'Difensore del pianeta',
      icon: <Star className="badge-icon" />,
      description: 'Conosci l\'importanza dell\'energia pulita per il nostro pianeta!'
    }
  };

  // Gestione degli achievement
  const handleAchievementUnlocked = (achievement) => {
    setCurrentAchievement(achievement);
    setShowAchievement(true);
    
    if (achievement.points) {
      setProgress(prevProgress => ({
        ...prevProgress,
        totalPoints: prevProgress.totalPoints + achievement.points
      }));
    }
  };

  const closeAchievement = () => {
    setShowAchievement(false);
    setCurrentAchievement(null);
  };

  // Gestione del completamento dell'attività interattiva
  const handleInteractiveComplete = (pointsEarned) => {
    setProgress(prevProgress => ({
      ...prevProgress,
      totalPoints: prevProgress.totalPoints + pointsEarned,
      interactiveCompleted: true
    }));

    // Mostra un achievement
    handleAchievementUnlocked({
      title: '🎉 Esploratore Completato!',
      description: 'Hai esplorato tutti i componenti della centrale!',
      points: pointsEarned
    });

    // Torna alla griglia dopo un momento
    setTimeout(() => {
      backToGrid();
    }, 2000);
  };

  // Gestione del completamento di un modulo
  const handleModuleComplete = (moduleId, quizScore) => {
    const module = learningModules.find(m => m.id === moduleId);
    const pointsEarned = Math.floor(module.points * (quizScore / 100));

    const isFirstCompletion = !progress.moduleProgress[moduleId]?.completed;
    const previousPoints = progress.moduleProgress[moduleId]?.points || 0;

    const updatedProgress = {
      ...progress,
      completedLessons: isFirstCompletion ? progress.completedLessons + 1 : progress.completedLessons,
      completedQuizzes: isFirstCompletion ? progress.completedQuizzes + 1 : progress.completedQuizzes,
      totalPoints: progress.totalPoints - previousPoints + pointsEarned,
      moduleProgress: {
        ...progress.moduleProgress,
        [moduleId]: {
          completed: true,
          step: module.totalSteps,
          points: pointsEarned
        }
      }
    };

    if (!progress.badges.includes(module.badge)) {
      updatedProgress.badges = [...progress.badges, module.badge];
    }

    setProgress(updatedProgress);
    setCurrentView('badge');
  };

  // Gestione della navigazione a un modulo
  const handleModuleNavigate = (moduleId) => {
    setCurrentModule(moduleId);
    setCurrentStep(0);
    setCurrentView('module');
  };

  // Gestione della navigazione all'attività interattiva
  const handleInteractiveNavigate = () => {
    setCurrentView('interactive');
  };

  // Gestione del progresso nei passi del modulo
  const handleStorybookStep = (newStep) => {
    if (newStep === undefined) {
      setCurrentView('quiz');
      return;
    }

    setCurrentStep(newStep);

    if (newStep > (progress.moduleProgress[currentModule]?.step || 0)) {
      setProgress({
        ...progress,
        moduleProgress: {
          ...progress.moduleProgress,
          [currentModule]: {
            ...progress.moduleProgress[currentModule],
            step: newStep
          }
        }
      });
    }
  };

  // Torna alla vista griglia
  const backToGrid = () => {
    setCurrentView('grid');
    setCurrentModule(null);
    setCurrentStep(0);
  };

  // Renderizza la vista appropriata
  const renderView = () => {
    switch (currentView) {
      case 'interactive':
        return (
          <React.Suspense fallback={<div>Caricamento dell'attività interattiva...</div>}>
            <CentraleIdroelettricaKids
              onBack={backToGrid}
              onComplete={handleInteractiveComplete}
            />
          </React.Suspense>
        );
      case 'module':
        const module = learningModules.find(m => m.id === currentModule);
        if (!module) return <div className="error-message">Modulo non trovato.</div>;
        return (
          <React.Suspense fallback={<div>Caricamento della storia...</div>}>
            <StorybookViewer
              module={module}
              step={currentStep}
              onComplete={handleStorybookStep}
              onBack={backToGrid}
            />
          </React.Suspense>
        );
      case 'quiz':
        return (
          <React.Suspense fallback={<div>Caricamento del quiz...</div>}>
            <QuizGame
              moduleId={currentModule}
              onComplete={handleModuleComplete}
              onBack={() => setCurrentView('module')}
            />
          </React.Suspense>
        );
      case 'badge':
        const badgeId = learningModules.find(m => m.id === currentModule)?.badge;
        return (
          <React.Suspense fallback={<div>Preparazione del certificato...</div>}>
            <BadgeCertificate
              badge={badges[badgeId]}
              moduleId={currentModule}
              onContinue={backToGrid}
            />
          </React.Suspense>
        );
      default:
        return (
          <div className="kids-grid-view">
            {/* Metrics Grid */}
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Lezioni Completate</h3>
                <p className="metric-value">{progress.completedLessons}</p>
                <p className="metric-trend positive">
                  {progress.completedLessons > 0 ? `${progress.completedLessons} su ${learningModules.length}` : 'Inizia ad imparare!'}
                </p>
              </div>
              <div className="metric-card">
                <h3>Quiz Completati</h3>
                <p className="metric-value">{progress.completedQuizzes}</p>
                <p className="metric-trend">
                  {progress.completedQuizzes > 0 ? `${progress.completedQuizzes} su ${learningModules.length}` : 'Completa le lezioni!'}
                </p>
              </div>
              <div className="metric-card">
                <h3>Punti Totali</h3>
                <p className="metric-value">{progress.totalPoints}</p>
                <p className="metric-trend positive">
                  {progress.totalPoints > 0 ? `+${progress.totalPoints} punti` : 'Guadagna punti!'}
                </p>
              </div>
              <div className="metric-card">
                <h3>Badge Ottenuti</h3>
                <p className="metric-value">{progress.badges.length}</p>
                <p className="metric-trend positive">
                  {progress.badges.length > 0 ? `${progress.badges.length} su ${Object.keys(badges).length}` : 'Conquista i badge!'}
                </p>
              </div>
            </div>

            {/* Interactive Activities Section - NUOVA SEZIONE */}
            <div className="activities-section">
              <h2>🎮 Attività Interattiva</h2>
              <div className="interactive-activities-grid">
                {interactiveActivities.map(activity => (
                  <div
                    key={activity.id}
                    className={`interactive-card ${progress.interactiveCompleted ? 'completed' : ''}`}
                    onClick={handleInteractiveNavigate}
                  >
                    <div className="interactive-header">
                      <div className="interactive-emoji">{activity.emoji}</div>
                      {activity.icon}
                      <h3 className="interactive-title">{activity.title}</h3>
                      {progress.interactiveCompleted && <Check className="interactive-completed-icon" />}
                    </div>
                    <p className="interactive-description">{activity.description}</p>
                    <div className="interactive-footer">
                      <span className="interactive-points">
                        {progress.interactiveCompleted ? '✓ Completato' : `🏆 ${activity.points} punti`}
                      </span>
                      <button className="interactive-button">
                        {progress.interactiveCompleted ? 'Gioca Ancora' : 'Inizia!'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Modules Grid */}
            <div className="activities-section">
              <h2>📚 Moduli di Apprendimento</h2>
              <div className="learning-modules-grid">
                {learningModules.map(module => {
                  const moduleProgress = progress.moduleProgress[module.id];
                  const isCompleted = moduleProgress?.completed || false;
                  const currentProgress = moduleProgress?.step || 0;
                  const totalStoryPages = module.totalSteps;
                  const progressPercent = isCompleted ? 100 : (currentProgress / totalStoryPages) * 100;

                  return (
                    <div
                      key={module.id}
                      className={`module-card ${isCompleted ? 'completed' : ''}`}
                      onClick={() => handleModuleNavigate(module.id)}
                    >
                      <div className="module-header">
                        {module.icon}
                        <h3 className="module-title">{module.title}</h3>
                        {isCompleted && <Check className="module-completed-icon" />}
                      </div>
                      <p className="module-description">{module.description}</p>
                      
                      <div className="module-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {isCompleted ? 'Completato!' : (currentProgress > 0 ? `Pagina ${currentProgress}/${totalStoryPages}` : 'Non iniziato')}
                        </span>
                      </div>
                      
                      <div className="module-footer">
                        <span className="module-level">{module.level}</span>
                        <span className="module-points">{module.points} punti</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges Section */}
            <div className="activities-section">
              <h2>🏆 I Tuoi Badge</h2>
              <div className="badges-grid">
                {Object.entries(badges).map(([badgeId, badge]) => {
                  const earned = progress.badges.includes(badgeId);
                  return (
                    <div
                      key={badgeId}
                      className={`badge-item ${earned ? 'earned' : 'locked'}`}
                    >
                      {badge.icon}
                      <span>{badge.name}</span>
                      {earned ?
                        <Check className="badge-status-icon" /> :
                        <X className="badge-status-icon" />
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="kids-page">
      <div className="kids-header-section">
        <h1>Sei pronto a costruire un mondo più pulito?</h1>
        <p className="kids-subtitle">
          Scopri i segreti dell'energia rinnovabile e come funziona una centrale idroelettrica!
        </p>
      </div>

      {/* Progress Tracker - Mostrato solo nella vista griglia
      {currentView === 'grid' && (
        <React.Suspense fallback={<div>Caricamento del tracker...</div>}>
          <ProgressTracker 
            progress={progress} 
            onAchievementUnlocked={handleAchievementUnlocked}
          />
        </React.Suspense>
      )} */}

      {renderView()}

      {/* Achievement Popup */}
      <React.Suspense fallback={null}>
        <AchievementPopup 
          achievement={currentAchievement}
          onClose={closeAchievement}
          show={showAchievement}
        />
      </React.Suspense>
    </div>
  );
};

export default KidsPage;