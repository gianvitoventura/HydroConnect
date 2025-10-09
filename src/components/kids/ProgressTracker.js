import React, { useState, useEffect } from 'react';
import { Trophy, Star, Droplet, Zap, Leaf, Target, BookOpen, Award } from 'lucide-react';

const ProgressTracker = ({ progress, onAchievementUnlocked }) => {
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  
  // Funzione per assicurarsi che progress sia sempre un oggetto valido
  const getSafeProgress = () => {
    if (!progress || typeof progress !== 'object') {
      return {
        completedLessons: 0,
        completedQuizzes: 0,
        totalPoints: 0,
        badges: [],
        moduleProgress: {}
      };
    }
    
    return {
      completedLessons: progress.completedLessons || 0,
      completedQuizzes: progress.completedQuizzes || 0,
      totalPoints: progress.totalPoints || 0,
      badges: Array.isArray(progress.badges) ? progress.badges : [],
      moduleProgress: progress.moduleProgress || {}
    };
  };
  
  useEffect(() => {
    const safeProgress = getSafeProgress();
    
    // Calcola gli obiettivi settimanali
    const goals = calculateWeeklyGoals(safeProgress);
    setWeeklyGoals(goals);
    
    // Calcola la streak (giorni consecutivi di attività)
    const streak = calculateStreak();
    setStreakDays(streak);
    
    // Verifica nuovi achievement
    checkForNewAchievements(safeProgress);
  }, [progress]);

  const calculateWeeklyGoals = (userProgress) => {
    return [
      {
        id: 'lessons',
        icon: <BookOpen size={20} />,
        title: 'Lezioni Completate',
        current: userProgress.completedLessons,
        target: 3,
        color: '#3b82f6',
        description: 'Completa 3 lezioni questa settimana'
      },
      {
        id: 'quizzes',
        icon: <Target size={20} />,
        title: 'Quiz Superati',
        current: userProgress.completedQuizzes,
        target: 3,
        color: '#f59e0b',
        description: 'Supera 3 quiz con successo'
      },
      {
        id: 'points',
        icon: <Star size={20} />,
        title: 'Punti Raccolti',
        current: userProgress.totalPoints,
        target: 300,
        color: '#10b981',
        description: 'Raccogli 300 punti totali'
      },
      {
        id: 'badges',
        icon: <Award size={20} />,
        title: 'Badge Ottenuti',
        current: userProgress.badges.length,
        target: 3,
        color: '#8b5cf6',
        description: 'Ottieni tutti e 3 i badge'
      }
    ];
  };

  const calculateStreak = () => {
    try {
      // In una app reale, questo verrebbe calcolato dai dati di login/attività
      const lastActivity = localStorage.getItem('lastActivityDate');
      const today = new Date().toDateString();
      
      if (lastActivity === today) {
        return parseInt(localStorage.getItem('currentStreak') || '1');
      }
      return 0;
    } catch (error) {
      // Fallback se localStorage non è disponibile
      return 0;
    }
  };

  const checkForNewAchievements = (userProgress) => {
    const achievements = [
      {
        id: 'first_lesson',
        condition: userProgress.completedLessons >= 1,
        name: 'Primo Passo',
        description: 'Hai completato la tua prima lezione!',
        points: 50,
        type: 'first_lesson'
      },
      {
        id: 'quiz_master',
        condition: userProgress.completedQuizzes >= 3,
        name: 'Maestro dei Quiz',
        description: 'Hai superato tutti i quiz disponibili!',
        points: 100,
        type: 'quiz_master'
      },
      {
        id: 'point_collector',
        condition: userProgress.totalPoints >= 300,
        name: 'Collezionista',
        description: 'Hai raccolto 300 punti!',
        points: 75,
        type: 'explorer'
      },
      {
        id: 'badge_hunter',
        condition: userProgress.badges.length >= 3,
        name: 'Cacciatore di Badge',
        description: 'Hai ottenuto tutti i badge disponibili!',
        points: 150,
        type: 'quiz_master'
      }
    ];

    const unlockedAchievements = achievements.filter(achievement => {
      try {
        const isConditionMet = achievement.condition;
        const isAlreadyUnlocked = localStorage.getItem(`achievement_${achievement.id}`);
        return isConditionMet && !isAlreadyUnlocked;
      } catch (error) {
        return false;
      }
    });

    unlockedAchievements.forEach(achievement => {
      try {
        localStorage.setItem(`achievement_${achievement.id}`, 'true');
        if (onAchievementUnlocked && typeof onAchievementUnlocked === 'function') {
          onAchievementUnlocked(achievement);
        }
      } catch (error) {
        console.warn('Could not save achievement to localStorage', error);
      }
    });
  };

  const getProgressPercentage = (current, target) => {
    if (!current || !target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getLevelInfo = () => {
    const safeProgress = getSafeProgress();
    const totalPoints = safeProgress.totalPoints;
    const level = Math.floor(totalPoints / 100) + 1;
    const pointsForNextLevel = level * 100;
    const pointsInCurrentLevel = totalPoints % 100;
    
    return {
      level,
      pointsForNextLevel,
      pointsInCurrentLevel,
      progressToNextLevel: (pointsInCurrentLevel / 100) * 100
    };
  };

  const levelInfo = getLevelInfo();
  const safeProgress = getSafeProgress();

  return (
    <div className="progress-tracker">
      <h3 className="goals-title">🎯 Progesso attività</h3>
      {/* Sezione Livello Utente */}
      <div className="level-section">
        <div className="level-badge">
          <Trophy className="level-icon" />
          <div className="level-info">
            <span className="level-number">Livello {levelInfo.level}</span>
            <div className="level-progress">
              <div className="level-bar">
                <div 
                  className="level-fill"
                  style={{ width: `${levelInfo.progressToNextLevel}%` }}
                ></div>
              </div>
              <span className="level-text">
                {levelInfo.pointsInCurrentLevel}/100 XP
              </span>
            </div>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="streak-counter">
          <div className="streak-icon">🔥</div>
          <div className="streak-info">
            <span className="streak-number">{streakDays}</span>
            <span className="streak-label">giorni di seguito</span>
          </div>
        </div>
      </div>

      {/* Obiettivi Settimanali */}
      <div className="weekly-goals">
        <h3 className="goals-title">
          <Target size={20} />
          Obiettivi Settimanali
        </h3>
        <div className="goals-grid">
          {weeklyGoals.map(goal => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <div className="goal-icon" style={{ color: goal.color }}>
                  {goal.icon}
                </div>
                <div className="goal-info">
                  <h4 className="goal-title">{goal.title}</h4>
                  <p className="goal-description">{goal.description}</p>
                </div>
              </div>
              
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(goal.current, goal.target)}%`,
                      backgroundColor: goal.color 
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {goal.current}/{goal.target}
                </span>
              </div>
              
              {goal.current >= goal.target && (
                <div className="goal-completed">
                  <Star className="completed-icon" />
                  <span>Completato!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statistiche Rapide */}
      {/* <div className="quick-stats">
        <h3 className="stats-title">Le Tue Statistiche</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <Droplet className="stat-icon water" />
            <div className="stat-info">
              <span className="stat-number">{safeProgress.completedLessons}</span>
              <span className="stat-label">Avventure di Goccia</span>
            </div>
          </div>
          
          <div className="stat-item">
            <Zap className="stat-icon energy" />
            <div className="stat-info">
              <span className="stat-number">{safeProgress.completedQuizzes}</span>
              <span className="stat-label">Quiz Energetici</span>
            </div>
          </div>
          
          <div className="stat-item">
            <Leaf className="stat-icon eco" />
            <div className="stat-info">
              <span className="stat-number">{safeProgress.badges.length}</span>
              <span className="stat-label">Badge Eco-Friendly</span>
            </div>
          </div>
          
          <div className="stat-item">
            <Star className="stat-icon points" />
            <div className="stat-info">
              <span className="stat-number">{safeProgress.totalPoints}</span>
              <span className="stat-label">Punti Guadagnati</span>
            </div>
          </div>
        </div>
      </div> */}

      <style jsx>{`
        .progress-tracker {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
        }

        .level-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .level-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          flex: 1;
          min-width: 0;
        }

        .level-icon {
          color: #fbbf24;
          flex-shrink: 0;
        }

        .level-info {
          flex: 1;
          min-width: 0;
        }

        .level-number {
          display: block;
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .level-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .level-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
        }

        .level-fill {
          height: 100%;
          background: #fbbf24;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .level-text {
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .streak-counter {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 1rem;
          border-radius: 1rem;
          text-align: center;
        }

        .streak-icon {
          font-size: 1.5rem;
        }

        .streak-info {
          display: flex;
          flex-direction: column;
        }

        .streak-number {
          font-size: 1.25rem;
          font-weight: bold;
        }

        .streak-label {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .weekly-goals {
          margin-bottom: 2rem;
        }

        .goals-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .goal-card {
          background: white;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          position: relative;
          transition: all 0.2s ease;
        }

        .goal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .goal-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .goal-icon {
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 0.5rem;
        }

        .goal-info {
          flex: 1;
        }

        .goal-title {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #374151;
        }

        .goal-description {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        .goal-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.8rem;
          font-weight: 500;
          color: #6b7280;
        }

        .goal-completed {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #10b981;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .completed-icon {
          width: 16px;
          height: 16px;
        }

        .quick-stats {
          margin-top: 2rem;
        }

        .stats-title {
          color: #374151;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .stat-icon {
          width: 20px;
          height: 20px;
        }

        .stat-icon.water { color: #3b82f6; }
        .stat-icon.energy { color: #f59e0b; }
        .stat-icon.eco { color: #10b981; }
        .stat-icon.points { color: #8b5cf6; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1f2937;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        @media (max-width: 640px) {
          .level-section {
            flex-direction: column;
          }

          .goals-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .level-badge,
          .streak-counter {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressTracker;