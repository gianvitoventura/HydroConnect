import React, { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles, X, Award, BookOpen, Target } from 'lucide-react';

const AchievementPopup = ({ achievement, onClose, show }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);
  const [playAnimation, setPlayAnimation] = useState(false);

  useEffect(() => {
    if (show && achievement) {
      setIsVisible(true);
      setPlayAnimation(true);
      
      // Genera particelle per l'effetto celebrativo
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 400,
        y: Math.random() * 300,
        delay: Math.random() * 1000,
        color: ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#10b981', '#3b82f6'][Math.floor(Math.random() * 6)],
        size: Math.random() * 8 + 4
      }));
      setParticles(newParticles);

      // Auto-close dopo 5 secondi
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, achievement]);

  const handleClose = () => {
    setIsVisible(false);
    setPlayAnimation(false);
    setTimeout(() => {
      setParticles([]);
      if (onClose) onClose();
    }, 300);
  };

  // Se non c'è niente da mostrare, non renderizzare
  if (!show && !isVisible) return null;
  if (!achievement) return null;

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'first_lesson': 
        return <BookOpen className="achievement-icon" size={32} />;
      case 'quiz_master': 
        return <Trophy className="achievement-icon" size={32} />;
      case 'explorer': 
        return <Target className="achievement-icon" size={32} />;
      case 'point_collector':
        return <Star className="achievement-icon" size={32} />;
      case 'badge_hunter':
        return <Award className="achievement-icon" size={32} />;
      default: 
        return <Sparkles className="achievement-icon" size={32} />;
    }
  };

  const getAchievementColor = (type) => {
    switch (type) {
      case 'first_lesson': return '#3b82f6';
      case 'quiz_master': return '#f59e0b';
      case 'explorer': return '#10b981';
      case 'point_collector': return '#8b5cf6';
      case 'badge_hunter': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const getBackgroundGradient = (type) => {
    switch (type) {
      case 'first_lesson': 
        return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
      case 'quiz_master': 
        return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
      case 'explorer': 
        return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
      case 'point_collector':
        return 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)';
      case 'badge_hunter':
        return 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      default: 
        return 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)';
    }
  };

  const getEncouragementMessage = (type) => {
    switch (type) {
      case 'first_lesson': 
        return "Il tuo viaggio nell'energia idroelettrica è iniziato!";
      case 'quiz_master': 
        return "Sei diventato un vero esperto dell'energia pulita!";
      case 'explorer': 
        return "Hai esplorato tutti i segreti dell'acqua!";
      case 'point_collector':
        return "Sei un vero collezionista di conoscenza!";
      case 'badge_hunter':
        return "Hai dimostrato di essere un campione dell'apprendimento!";
      default: 
        return "Continua così, stai facendo un lavoro fantastico!";
    }
  };

  return (
    <div className={`achievement-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
      <div className="achievement-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose} aria-label="Chiudi">
          <X size={20} />
        </button>
        
        {/* Particelle animate */}
        <div className="particles-container">
          {particles.map(particle => (
            <div
              key={particle.id}
              className={`particle ${playAnimation ? 'animate' : ''}`}
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                backgroundColor: particle.color,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}ms`
              }}
            />
          ))}
        </div>

        {/* Contenuto principale */}
        <div className="achievement-content">
          {/* Icona principale animata */}
          <div 
            className={`achievement-icon-container ${playAnimation ? 'animate' : ''}`}
            style={{ 
              backgroundColor: getAchievementColor(achievement.type),
              background: getBackgroundGradient(achievement.type),
              border: `3px solid ${getAchievementColor(achievement.type)}`
            }}
          >
            {getAchievementIcon(achievement.type)}
          </div>
          
          {/* Titoli */}
          <div className="achievement-text">
            <h2 className={`achievement-title ${playAnimation ? 'animate' : ''}`}>
              🎉 Congratulazioni! 🎉
            </h2>
            <h3 className={`achievement-name ${playAnimation ? 'animate' : ''}`}>
              {achievement.name || 'Nuovo Traguardo'}
            </h3>
            <p className={`achievement-description ${playAnimation ? 'animate' : ''}`}>
              {achievement.description || 'Hai raggiunto un nuovo traguardo!'}
            </p>
            
            {/* Messaggio di incoraggiamento */}
            <p className={`encouragement-message ${playAnimation ? 'animate' : ''}`}>
              {getEncouragementMessage(achievement.type)}
            </p>
          </div>
          
          {/* Ricompensa punti */}
          {achievement.points && (
            <div className={`achievement-reward ${playAnimation ? 'animate' : ''}`}>
              <Sparkles size={16} />
              <span>+{achievement.points} punti bonus!</span>
              <Sparkles size={16} />
            </div>
          )}
          
          {/* Barra di progresso decorativa */}
          <div className={`achievement-progress-bar ${playAnimation ? 'animate' : ''}`}>
            <div className="progress-fill"></div>
          </div>
          
          {/* Call to action */}
          <button 
            className={`continue-button ${playAnimation ? 'animate' : ''}`}
            onClick={handleClose}
          >
            Continua l'Avventura!
          </button>
        </div>
      </div>

      <style jsx>{`
        .achievement-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.4s ease;
          backdrop-filter: blur(8px);
        }

        .achievement-overlay.visible {
          opacity: 1;
        }

        .achievement-popup {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 2rem;
          padding: 2.5rem;
          max-width: 500px;
          width: 90%;
          text-align: center;
          position: relative;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
          transform: scale(0.5) rotate(-10deg);
          animation: popInBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          border: 3px solid transparent;
          background-clip: padding-box;
        }

        @keyframes popInBounce {
          0% {
            transform: scale(0.5) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(107, 114, 128, 0.1);
          border: none;
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6b7280;
        }

        .close-button:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          transform: rotate(90deg);
        }

        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: 2rem;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
        }

        .particle.animate {
          animation: particleFloat 4s ease-out forwards;
        }

        @keyframes particleFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translateY(-20px) scale(1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.5) rotate(720deg);
          }
        }

        .achievement-content {
          position: relative;
          z-index: 1;
        }

        .achievement-icon-container {
          width: 5rem;
          height: 5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .achievement-icon-container.animate {
          animation: iconCelebration 1s ease-in-out 0.5s;
        }

        .achievement-icon-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes iconCelebration {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(-5deg);
          }
          75% {
            transform: scale(1.1) rotate(5deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        .achievement-icon {
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        .achievement-text {
          margin-bottom: 1.5rem;
        }

        .achievement-title {
          color: #1f2937;
          font-size: 1.75rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          opacity: 0;
        }

        .achievement-title.animate {
          animation: slideInUp 0.6s ease-out 0.3s forwards;
        }

        .achievement-name {
          color: #4f46e5;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          opacity: 0;
        }

        .achievement-name.animate {
          animation: slideInUp 0.6s ease-out 0.5s forwards;
        }

        .achievement-description {
          color: #6b7280;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          opacity: 0;
        }

        .achievement-description.animate {
          animation: slideInUp 0.6s ease-out 0.7s forwards;
        }

        .encouragement-message {
          color: #059669;
          font-size: 1rem;
          font-weight: 500;
          font-style: italic;
          margin-bottom: 1.5rem;
          opacity: 0;
        }

        .encouragement-message.animate {
          animation: slideInUp 0.6s ease-out 0.9s forwards;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .achievement-reward {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          padding: 1rem 1.5rem;
          border-radius: 2rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border: 2px solid #f59e0b;
          opacity: 0;
        }

        .achievement-reward.animate {
          animation: bounceIn 0.6s ease-out 1.1s forwards;
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .achievement-progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          opacity: 0;
        }

        .achievement-progress-bar.animate {
          animation: fadeIn 0.6s ease-out 1.3s forwards;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8, #3b82f6);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: progressFill 2s ease-out, shimmerProgress 3s infinite;
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes shimmerProgress {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .continue-button {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          opacity: 0;
        }

        .continue-button.animate {
          animation: slideInUp 0.6s ease-out 1.5s forwards;
        }

        .continue-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }

        .continue-button:active {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .achievement-popup {
            margin: 1rem;
            padding: 2rem 1.5rem;
            max-width: none;
            width: calc(100% - 2rem);
          }

          .achievement-title {
            font-size: 1.5rem;
          }

          .achievement-name {
            font-size: 1.25rem;
          }

          .achievement-description {
            font-size: 1rem;
          }

          .encouragement-message {
            font-size: 0.9rem;
          }

          .achievement-icon-container {
            width: 4rem;
            height: 4rem;
          }

          .achievement-icon {
            width: 24px;
            height: 24px;
          }
        }

        /* Accessibilità */
        @media (prefers-reduced-motion: reduce) {
          .achievement-popup,
          .achievement-icon-container,
          .particle,
          .achievement-title,
          .achievement-name,
          .achievement-description,
          .encouragement-message,
          .achievement-reward,
          .continue-button {
            animation: none !important;
            transition: none !important;
          }

          .achievement-popup {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }

          .achievement-title,
          .achievement-name,
          .achievement-description,
          .encouragement-message,
          .achievement-reward,
          .achievement-progress-bar,
          .continue-button {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementPopup;