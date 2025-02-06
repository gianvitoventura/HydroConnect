import React, { useState, useEffect } from 'react';
import { Droplet, Zap, Leaf, Award, Book, Star } from 'lucide-react';
import '../styles/KidsPage.css';

const KidsPage = () => {
  const [currentModule, setCurrentModule] = useState(null);
  const [progress, setProgress] = useState({
    completedLessons: 3,
    totalPoints: 250,
    badges: ['explorer', 'scientist', 'master']
  });

  const learningModules = [
    {
      id: 'water-cycle',
      title: 'Il Viaggio dell\'Acqua',
      icon: <Droplet className="module-icon" />,
      description: 'Scopri come l\'acqua viaggia dalla montagna al mare',
      level: 'Principiante',
      points: 100
    },
    {
      id: 'hydro-power',
      title: 'La Centrale Idroelettrica',
      icon: <Zap className="module-icon" />,
      description: 'Come si trasforma l\'acqua in elettricità',
      level: 'Intermedio',
      points: 150
    },
    {
      id: 'clean-energy',
      title: 'Energia Pulita',
      icon: <Leaf className="module-icon" />,
      description: 'Perché l\'energia idroelettrica aiuta l\'ambiente',
      level: 'Avanzato',
      points: 200
    }
  ];

  const badges = {
    explorer: {
      name: 'Esploratore dell\'Acqua',
      icon: <Award className="badge-icon" />
    },
    scientist: {
      name: 'Ingegnere provetto',
      icon: <Book className="badge-icon" />
    },
    master: {
      name: 'Piccolo Scienziato',
      icon: <Star className="badge-icon" />
    }
  };

  return (
    <div className="kids-page">
      <div className="kids-header-section">
        <h1>Sei pronto a costruire un mondo più pulito?</h1>
        <p className="kids-subtitle">
          Unisciti a SIED nella sua avventura per scoprire i segreti dell'energia idroelettrica e della sostenibilità
        </p>
      </div>

      {/* Metrics Grid - simile alla Community page */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Lezioni Completate</h3>
          <p className="metric-value">{progress.completedLessons}</p>
          <p className="metric-trend positive">↑ 2 questa settimana</p>
        </div>
        <div className="metric-card">
          <h3>Punti Totali</h3>
          <p className="metric-value">{progress.totalPoints}</p>
          <p className="metric-trend">+50 punti oggi</p>
        </div>
        <div className="metric-card">
          <h3>Badge Ottenuti</h3>
          <p className="metric-value">{progress.badges.length}</p>
          <p className="metric-trend positive">Nuovo badge sbloccato!</p>
        </div>
      </div>

      {/* Learning Modules Grid */}
      <div className="activities-section">
        <h2>Moduli di Apprendimento</h2>
        <div className="learning-modules-grid">
          {learningModules.map(module => (
            <div 
              key={module.id} 
              className="module-card"
              onClick={() => setCurrentModule(module.id)}
            >
              <div className="module-header">
                {module.icon}
                <h3 className="module-title">{module.title}</h3>
              </div>
              <p className="module-description">{module.description}</p>
              <div className="module-footer">
                <span className="module-level">{module.level}</span>
                <span className="module-points">{module.points} punti</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Section */}
      <div className="activities-section">
        <h2>I Tuoi Badge</h2>
        <div className="badges-grid">
          {progress.badges.map(badgeId => {
            const badge = badges[badgeId];
            return (
              <div key={badgeId} className="badge-item">
                {badge.icon}
                <span>{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KidsPage;