import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Droplets, Zap, ArrowLeft, Volume2, VolumeX, X } from 'lucide-react';
import './Hydrokids.css';

const CentraleIdroelettricaKids = ({ onBack, onComplete }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [flowIntensity, setFlowIntensity] = useState(60);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [exploredComponents, setExploredComponents] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false);
  
  // Display values - aggiornati SOLO ogni 3 secondi
  const [displayWaterLevel, setDisplayWaterLevel] = useState(80);
  const [displayEnergy, setDisplayEnergy] = useState(0);
  
  // Valori reali per animazioni - NON causano re-render
  const waterLevelRef = useRef(80);
  const turbineRotationRef = useRef(0);

  // Aggiorna display solo ogni 3 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayWaterLevel(Math.round(waterLevelRef.current));
      const energy = Math.round((flowIntensity / 100) * (waterLevelRef.current / 100) * 850);
      setDisplayEnergy(energy);
    }, 3000);
    return () => clearInterval(interval);
  }, [flowIntensity]);

  // Animazione waterLevel con requestAnimationFrame
  useEffect(() => {
    if (!isRunning) return;
    
    let animationFrame;
    let lastUpdate = Date.now();
    
    const animate = () => {
      const now = Date.now();
      if (now - lastUpdate > 100) {
        waterLevelRef.current = Math.max(20, waterLevelRef.current - 0.05);
        
        // Aggiorna l'SVG direttamente
        const waterRect = document.getElementById('water-level-rect');
        if (waterRect) {
          waterRect.setAttribute('y', 150 + (100 - waterLevelRef.current));
          waterRect.setAttribute('height', waterLevelRef.current);
        }
        
        lastUpdate = now;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isRunning]);

  // Animazione turbine con requestAnimationFrame
  useEffect(() => {
    if (!isRunning) return;
    
    let animationFrame;
    let lastUpdate = Date.now();
    
    const animate = () => {
      const now = Date.now();
      if (now - lastUpdate > 50) {
        turbineRotationRef.current = (turbineRotationRef.current + (flowIntensity / 10)) % 360;
        
        // Aggiorna l'SVG direttamente
        const turbineGroup = document.getElementById('turbine-animation');
        if (turbineGroup) {
          turbineGroup.setAttribute('transform', `translate(460, 340) rotate(${turbineRotationRef.current})`);
        }
        
        lastUpdate = now;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isRunning, flowIntensity]);

  useEffect(() => {
    if (selectedComponent || showCongrats) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedComponent, showCongrats]);

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
    
    if (!exploredComponents.includes(component)) {
      const newExplored = [...exploredComponents, component];
      setExploredComponents(newExplored);
      
      if (newExplored.length === 5) {
        setTimeout(() => setShowCongrats(true), 500);
      }
    }
  };

  const componentData = {
    dam: {
      title: "🏔️ Diga e Bacino",
      emoji: "💧",
      description: "La diga è come una grande vasca che raccoglie l'acqua della pioggia e della neve dalle montagne!",
      funFacts: [
        "L'acqua qui dentro pesa moltissimo!",
        "Più alta è l'acqua, più energia possiamo fare!",
        "Alcune dighe sono alte come grattacieli!",
        "Ci vogliono anni per costruire una diga"
      ],
      simpleExplanation: "È come quando metti l'acqua in alto: quando la fai scendere ha molta forza!"
    },
    pipes: {
      title: "🔵 Tubi Giganti",
      emoji: "🚰",
      description: "Questi tubi enormi portano l'acqua giù velocissima, come uno scivolo d'acqua gigante!",
      funFacts: [
        "L'acqua va veloce come un'auto da corsa!",
        "I tubi sono così grandi che ci potresti entrare dentro!",
        "Sono fatti di metallo super resistente",
        "L'acqua fa un rumore WOOOSH!"
      ],
      simpleExplanation: "Più l'acqua scende veloce, più energia avremo!"
    },
    turbine: {
      title: "⚙️ Turbina Magica",
      emoji: "🌀",
      description: "La turbina gira girissima quando l'acqua la colpisce! È come un mulino a vento ma con l'acqua!",
      funFacts: [
        "Gira velocissima, centinaia di volte al minuto!",
        "Ha delle pale speciali per catturare l'acqua",
        "Fa un rumore rombante quando gira",
        "Più gira veloce, più energia facciamo!"
      ],
      simpleExplanation: "È come quando soffi su una girandola e gira: l'acqua fa girare la turbina!"
    },
    generator: {
      title: "⚡ Generatore Elettrico",
      emoji: "✨",
      description: "Questa macchina magica trasforma il movimento in elettricità, come per magia!",
      funFacts: [
        "Usa magneti super potenti!",
        "Crea l'elettricità che usiamo a casa",
        "Fa lampi di energia elettrica",
        "È la parte più importante della centrale!"
      ],
      simpleExplanation: "Quando la turbina gira, questo fa l'elettricità che accende le luci!"
    },
    power: {
      title: "🔌 Linee Elettriche",
      emoji: "⚡",
      description: "L'elettricità viaggia attraverso questi fili fino alle nostre case, scuole e città!",
      funFacts: [
        "L'elettricità viaggia velocissima!",
        "Accende migliaia di case!",
        "Non inquina l'aria!",
        "È energia pulita e verde!"
      ],
      simpleExplanation: "L'elettricità corre sui fili come un treno super veloce fino a casa tua!"
    }
  };

  // Popup memoizzato per prevenire re-render
  const ComponentPopup = React.memo(({ component }) => {
    const data = componentData[component];
    if (!data) return null;

    const popupContent = (
      <div 
        className="hydro-popup-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedComponent(null);
          }
        }}
      >
        <div 
          className="hydro-popup-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="hydro-popup-header">
            <div className="hydro-popup-emoji-bg">{data.emoji}</div>
            
            <button
              onClick={() => setSelectedComponent(null)}
              className="hydro-popup-close"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="hydro-popup-header-content">
              <h2 className="hydro-popup-title">{data.title}</h2>
              <p className="hydro-popup-description">{data.description}</p>
            </div>
          </div>

          <div className="hydro-popup-explanation">
            <div className="hydro-popup-explanation-content">
              <div className="hydro-popup-emoji">💡</div>
              <div>
                <h3 className="hydro-popup-explanation-title">Spiegazione Semplice</h3>
                <p className="hydro-popup-explanation-text">{data.simpleExplanation}</p>
              </div>
            </div>
          </div>

          <div className="hydro-popup-facts">
            <h3 className="hydro-popup-facts-title">
              <span className="text-3xl">🌟</span>
              Curiosità Divertenti!
            </h3>
            <div className="hydro-popup-facts-list">
              {data.funFacts.map((fact, idx) => (
                <div key={idx} className="hydro-popup-fact-item">
                  <div className="hydro-popup-fact-emoji">
                    {['🎈', '🎨', '🎪', '🎯'][idx]}
                  </div>
                  <span className="hydro-popup-fact-text">{fact}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hydro-popup-footer">
            <p className="hydro-popup-footer-text">
              🎉 Esplora tutti i componenti per vincere un premio! 🏆
            </p>
            <p className="hydro-popup-footer-progress">
              {exploredComponents.length}/5 componenti esplorati
            </p>
          </div>
        </div>
      </div>
    );

    return createPortal(popupContent, document.body);
  });

  const CongratsPopup = React.memo(() => {
    const popupContent = (
      <div 
        className="hydro-popup-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCongrats(false);
            if (onComplete) onComplete(100);
          }
        }}
      >
        <div 
          className="hydro-congrats-popup"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="hydro-congrats-emoji">🎉</div>
          <h2 className="hydro-congrats-title">Fantastico!</h2>
          <p className="hydro-congrats-text">
            Hai esplorato tutti i componenti della centrale idroelettrica!
          </p>
          <div className="hydro-congrats-reward">
            <div className="hydro-congrats-trophy">🏆</div>
            <p className="hydro-congrats-points">+100 Punti!</p>
          </div>
          <button
            onClick={() => {
              setShowCongrats(false);
              if (onComplete) onComplete(100);
            }}
            className="hydro-congrats-button"
            type="button"
          >
            Continua l'Avventura! 🚀
          </button>
        </div>
      </div>
    );

    return createPortal(popupContent, document.body);
  });

  return (
    <div className="hydro-plant-kids-container">
      <div className="hydro-plant-content">
        <div className="hydro-header-card">
          <div className="hydro-header-top">
            {onBack && (
              <button onClick={onBack} className="hydro-back-button" type="button">
                <ArrowLeft className="w-5 h-5" />
                <span>Indietro</span>
              </button>
            )}
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="hydro-sound-button"
              type="button"
            >
              {soundEnabled ? 
                <Volume2 className="w-6 h-6 text-purple-600" /> : 
                <VolumeX className="w-6 h-6 text-gray-500" />
              }
            </button>
          </div>

          <h1 className="hydro-main-title">
            🌊 La centrale idroelettrica interattiva ⚡
          </h1>
          <p className="hydro-subtitle">
            Clicca sui componenti per scoprire come l'acqua diventa elettricità!
          </p>

          <div className="hydro-progress-tracker">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className={`hydro-progress-circle ${
                  exploredComponents.length >= num ? 'completed' : 'incomplete'
                }`}
              >
                {exploredComponents.length >= num ? '✓' : num}
              </div>
            ))}
          </div>
        </div>

        <div className="hydro-controls-card">
          <h2 className="hydro-controls-title">🎮 Controlli Magici</h2>
          <div className="hydro-controls-grid">
            <div className="hydro-flow-control">
              <div className="hydro-flow-header">
                <span className="hydro-flow-label">💧 Flusso d'Acqua</span>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`hydro-toggle-button ${isRunning ? 'running' : 'stopped'}`}
                  type="button"
                >
                  {isRunning ? '⏸ STOP' : '▶ START'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={flowIntensity}
                onChange={(e) => setFlowIntensity(Number(e.target.value))}
                disabled={!isRunning}
                className="hydro-slider"
                style={{
                  background: `linear-gradient(to right, #60a5fa ${flowIntensity}%, #e5e7eb ${flowIntensity}%)`
                }}
              />
              <div className="hydro-slider-value">
                {flowIntensity}%
              </div>
            </div>

            <div className="hydro-metric-card water">
              <Droplets className="hydro-metric-icon text-blue-600" />
              <div className="hydro-metric-label">Acqua nel Bacino</div>
              <div className="hydro-metric-value">{displayWaterLevel}%</div>
            </div>

            <div className="hydro-metric-card energy">
              <Zap className="hydro-metric-icon text-yellow-600" />
              <div className="hydro-metric-label">Energia Prodotta</div>
              <div className="hydro-metric-value">{displayEnergy} MW</div>
            </div>
          </div>
        </div>

        <div className="hydro-visualization-card">
          <svg viewBox="0 0 800 400" className="hydro-svg-container" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 0.8}} />
                <stop offset="100%" style={{stopColor: '#2563eb', stopOpacity: 0.9}} />
              </linearGradient>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="800" height="150" fill="#bae6fd" />
            
            <circle cx="700" cy="60" r="30" fill="#fbbf24" opacity="0.8">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
            </circle>

            <path d="M 0 120 L 100 50 L 200 120 Z" fill="#94a3b8" opacity="0.6" />
            <path d="M 150 120 L 280 30 L 400 120 Z" fill="#64748b" opacity="0.7" />

            {/* Livello acqua - aggiornato tramite DOM diretto */}
            <rect 
              id="water-level-rect"
              x="50" 
              y={150 + (100 - displayWaterLevel)} 
              width="250" 
              height={displayWaterLevel} 
              fill="url(#waterGradient)"
            />

            <g 
              onClick={() => handleComponentClick('dam')}
              className="hydro-svg-clickable"
            >
              <path d="M 300 150 L 300 280 L 320 300 L 320 130" fill="#64748b" />
              <circle cx="310" cy="140" r="10" fill="#ef4444" opacity={isRunning ? 1 : 0.3} />
              {!exploredComponents.includes('dam') && (
                <g>
                  <circle cx="310" cy="180" r="20" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="20;25;20" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="310" y="185" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">👆</text>
                </g>
              )}
            </g>

            <g 
              onClick={() => handleComponentClick('pipes')}
              className="hydro-svg-clickable"
            >
              <path d="M 300 240 L 420 300" stroke="#475569" strokeWidth="25" fill="none" />
              {!exploredComponents.includes('pipes') && (
                <g>
                  <circle cx="360" cy="270" r="20" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="20;25;20" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="360" y="275" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">👆</text>
                </g>
              )}
            </g>
            
            {isRunning && Array.from({length: 8}, (_, i) => (
              <circle key={i} r="5" fill="#60a5fa" filter="url(#glow)">
                <animateMotion
                  dur={`${1.5 / (flowIntensity / 50)}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.2}s`}
                  path="M 300 240 L 420 300"
                />
              </circle>
            ))}

            <g 
              onClick={() => handleComponentClick('turbine')}
              className="hydro-svg-clickable"
            >
              <rect x="400" y="280" width="120" height="120" fill="#334155" rx="5" />
              {!exploredComponents.includes('turbine') && (
                <g>
                  <circle cx="460" cy="310" r="25" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="25;30;25" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="460" y="320" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">👆</text>
                </g>
              )}
            </g>
            
            {/* Turbina - animata tramite DOM diretto */}
            <g id="turbine-animation" transform="translate(460, 340)" filter="url(#glow)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1="0" y1="0"
                  x2={Math.cos((angle * Math.PI) / 180) * 22}
                  y2={Math.sin((angle * Math.PI) / 180) * 22}
                  stroke="url(#energyGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="0" cy="0" r="10" fill="#f59e0b" />
            </g>

            <g 
              onClick={() => handleComponentClick('generator')}
              className="hydro-svg-clickable"
            >
              <rect x="430" y="310" width="60" height="40" fill="#fbbf24" rx="3" />
              {!exploredComponents.includes('generator') && (
                <g>
                  <circle cx="460" cy="330" r="20" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="20;25;20" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="460" y="337" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">👆</text>
                </g>
              )}
            </g>

            <g 
              onClick={() => handleComponentClick('power')}
              className="hydro-svg-clickable"
            >
              <line x1="520" y1="320" x2="650" y2="220" stroke="#334155" strokeWidth="4" />
              <line x1="520" y1="330" x2="650" y2="230" stroke="#334155" strokeWidth="4" />
              {!exploredComponents.includes('power') && (
                <g>
                  <circle cx="585" cy="275" r="20" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="20;25;20" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="585" y="282" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">👆</text>
                </g>
              )}
            </g>
            
            {isRunning && Array.from({length: 6}, (_, i) => (
              <circle key={i} r="6" fill="url(#energyGradient)" filter="url(#glow)">
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  begin={`${i * 0.3}s`}
                  path="M 520 320 L 650 220"
                />
              </circle>
            ))}

            <path d="M 650 220 L 650 150 L 640 160 L 650 150 L 660 160" stroke="#475569" strokeWidth="5" fill="none" />
            <rect x="700" y="260" width="30" height="40" fill="#64748b" />
            <rect x="740" y="240" width="35" height="60" fill="#64748b" />
            <rect x="705" y="267" width="5" height="5" fill="#fbbf24" opacity={isRunning ? 1 : 0.2} />
            <rect x="0" y="300" width="800" height="100" fill="#22c55e" opacity="0.6" />
          </svg>
        </div>

        {selectedComponent && <ComponentPopup component={selectedComponent} />}
        {showCongrats && <CongratsPopup />}

        <div className="hydro-instructions-card">
          <h3 className="hydro-instructions-title">
            <span className="text-3xl">🎯</span>
            Come Giocare
          </h3>
          <div className="hydro-instructions-grid">
            <div className="hydro-instruction-item">
              <strong className="hydro-instruction-title">1. 👆 Clicca</strong>
              <p className="hydro-instruction-text">Tocca i cerchi gialli per scoprire ogni parte!</p>
            </div>
            <div className="hydro-instruction-item">
              <strong className="hydro-instruction-title">2. 🎮 Controlla</strong>
              <p className="hydro-instruction-text">Usa lo slider per cambiare il flusso d'acqua!</p>
            </div>
            <div className="hydro-instruction-item">
              <strong className="hydro-instruction-title">3. 👀 Osserva</strong>
              <p className="hydro-instruction-text">Guarda l'acqua e l'energia muoversi!</p>
            </div>
            <div className="hydro-instruction-item">
              <strong className="hydro-instruction-title">4. 🏆 Vinci</strong>
              <p className="hydro-instruction-text">Esplora tutti e 5 i componenti per il premio!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentraleIdroelettricaKids;