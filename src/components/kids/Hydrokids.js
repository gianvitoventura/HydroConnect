import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Droplets, Zap, ArrowLeft, X } from 'lucide-react';
import './Hydrokids.css';

const CentraleIdroelettricaKids = ({ onBack, onComplete }) => {
  const [isRunning, setIsRunning] = useState(true);
  
  // STATI AGGIUNTIVI PER I CONTROLLI (Come da immagini e richiesta)
  const [flowIntensity, setFlowIntensity] = useState(60); // 
  const [reservoirHeight, setReservoirHeight] = useState(80); // 20-100%
  const [efficiency, setEfficiency] = useState(85); // 50-100%

  const [selectedComponent, setSelectedComponent] = useState(null);
  const [exploredComponents, setExploredComponents] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false);
  
  // Display values - aggiornati SOLO ogni 3 secondi
  const [displayWaterLevel, setDisplayWaterLevel] = useState(80); 
  const [displayEnergy, setDisplayEnergy] = useState(0);
  
  // Valori reali per animazioni - usano il ref per evitare re-render continui
  const waterLevelRef = useRef(80);
  const turbineRotationRef = useRef(0);
  
  // NUOVI OFFSET PER SCHIACCIARE IL CIELO E ALZARE LA CENTRALE
  const DAM_TOP_Y = 200; // Cima della diga
  const DAM_BOTTOM_Y = 350; // Base della diga
  const damHeight = DAM_BOTTOM_Y - DAM_TOP_Y;
  
  const GROUND_Y = 400; // Livello del terreno

  // Costanti per la condotta 
  const PIPE_START_Y = 300;
  const PIPE_END_Y = 350; 
  
  // Aggiorna display e calcola energia (ogni 3 secondi)
  useEffect(() => {
    const interval = setInterval(() => {
      // Sincronizza il livello di visualizzazione con il livello attuale nel ref
      setDisplayWaterLevel(Math.round(waterLevelRef.current));
      
      // NUOVA FORMULA ENERGETICA COMBINATA: E = Flow * Height * Efficiency * Costante
      const flowFactor = isRunning ? flowIntensity / 100 : 0; // Se ferma, il flusso è 0
      const heightFactor = waterLevelRef.current / 100; // Usa il livello attuale (ref)
      const efficiencyFactor = efficiency / 100;
      
      // Costante base di potenza (regolata per valori realistici con i nuovi controlli)
      const energy = Math.round(flowFactor * heightFactor * efficiencyFactor * 850); 
      setDisplayEnergy(energy);
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning, flowIntensity, efficiency]); 

  // Animazione waterLevel con requestAnimationFrame: gestisce il drenaggio e il riempimento
  useEffect(() => {
    let animationFrame;
    let lastUpdate = Date.now();
    
    const animate = () => {
      const now = Date.now();
      if (now - lastUpdate > 100) {
        
        // 1. Drenaggio: l'acqua scende se la centrale è in funzione e c'è flusso
        if (isRunning && flowIntensity > 0) {
           // Tasso di drenaggio proporzionale al flusso
           const drainRate = (flowIntensity / 100) * 0.15; 
           waterLevelRef.current = Math.max(20, waterLevelRef.current - drainRate); // Minimo 20%
        }

        // 2. Riempimento/Livello utente: l'acqua sale o scende lentamente fino al livello impostato (reservoirHeight)
        const targetLevel = reservoirHeight;
        
        if (waterLevelRef.current < targetLevel) {
             // Tasso di riempimento più lento del drenaggio (simulazione realistica)
            waterLevelRef.current = Math.min(targetLevel, waterLevelRef.current + 0.15); 
        } else if (waterLevelRef.current > targetLevel) {
            // Tasso di discesa verso il target (più veloce del drenaggio passivo)
            waterLevelRef.current = Math.max(20, waterLevelRef.current - 0.1); 
        }

        // Aggiorna l'SVG direttamente (manipolazione DOM per performance)
        const waterRect = document.getElementById('water-level-rect');
        if (waterRect) {
          const level = waterLevelRef.current;
          // Calcola la posizione Y e l'altezza in base al livello (%) e alle costanti DAM
          waterRect.setAttribute('y', DAM_TOP_Y + (damHeight * (1 - level / 100))); 
          waterRect.setAttribute('height', damHeight * (level / 100));
        }
        
        lastUpdate = now;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isRunning, flowIntensity, reservoirHeight, DAM_TOP_Y, damHeight]); 

  // Animazione turbine con requestAnimationFrame
  useEffect(() => {
    if (!isRunning) return;
    
    let animationFrame;
    let lastUpdate = Date.now();
    
    // Centro della turbina (allineato al nuovo layout)
    const TURBINE_CENTER_Y = 360; 
    const TURBINE_CENTER_X = 450;
    
    const animate = () => {
      const now = Date.now();
      if (now - lastUpdate > 50) {
        // Velocità di rotazione proporzionale ai 3 fattori
        const rotationSpeed = (flowIntensity / 10) * (waterLevelRef.current / 100) * (efficiency / 100);
        turbineRotationRef.current = (turbineRotationRef.current + rotationSpeed * 10) % 360; 
        
        // Aggiorna l'SVG direttamente
        const turbineGroup = document.getElementById('turbine-animation');
        if (turbineGroup) {
          turbineGroup.setAttribute('transform', `translate(${TURBINE_CENTER_X}, ${TURBINE_CENTER_Y}) rotate(${turbineRotationRef.current})`); 
        }
        
        lastUpdate = now;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isRunning, flowIntensity, efficiency]);
  
  // Gestione overflow del body (per i popup)
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
      
      // Controllo di completamento del gioco
      if (newExplored.length === 5) {
        setTimeout(() => setShowCongrats(true), 500);
      }
    }
  };

  const componentData = { 
    dam: { title: "🏔️ Diga e Bacino", emoji: "💧", description: "La diga è come una grande vasca che raccoglie l'acqua della pioggia e della neve dalle montagne!", funFacts: ["L'acqua qui dentro pesa moltissimo!", "Più alta è l'acqua, più energia possiamo fare!", "Alcune dighe sono alte come grattacieli!", "Alcune centrali non hanno una diga ma solo una vasca, poco più grande di una piscina"], simpleExplanation: "È come quando metti l'acqua in alto: quando la fai scendere ha molta forza!" },
    pipes: { title: "🔵 Condotta Forzata", emoji: "🚰", description: "Questi tubi portano l'acqua giù velocissima, usando la pendenza per aumentare la pressione!", funFacts: ["L'acqua va veloce come un'auto da corsa!", "I tubi sono così grandi che ci potresti entrare dentro!", "Sono fatti di metallo super resistente", "L'acqua a volte fa salti incredibili!"], simpleExplanation: "Più l'acqua scende veloce, più energia avremo!" },
    turbine: { title: "⚙️ Turbina Magica", emoji: "🌀", description: "La turbina gira girissima quando l'acqua la colpisce! È come un mulino a vento ma con l'acqua!", funFacts: ["Gira velocissima, centinaia di volte al minuto!", "Ha delle pale speciali per catturare l'acqua", "Fa un rumore rombante quando gira", "Più gira veloce, più energia facciamo!"], simpleExplanation: "È come quando soffi su una girandola e gira: l'acqua fa girare la turbina!" },
    generator: { title: "⚡ Generatore Elettrico", emoji: "✨", description: "Questa macchina magica trasforma il movimento in elettricità, come per magia!", funFacts: ["Usa magneti super potenti!", "Crea l'elettricità che usiamo a casa", "Fa lampi di energia elettrica", "È la parte più importante della centrale!"], simpleExplanation: "Quando la turbina gira, questo fa l'elettricità che accende le luci!" },
    power: { title: "🔌 Linee Elettriche", emoji: "⚡", description: "L'elettricità viaggia attraverso questi fili fino alle nostre case, scuole e città!", funFacts: ["L'elettricità viaggia velocissima!", "Accende migliaia di case!", "Non inquina l'aria!", "È energia pulita e verde!"], simpleExplanation: "L'elettricità corre sui fili come un treno super veloce fino a casa tua!" }
  };


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
                <h3 className="hydro-popup-explanation-title">Spiegazione</h3>
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
            <p className="hydro-congrats-points">+500 Punti!</p>
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
          </div>

          <h1 className="hydro-main-title">
            La Centrale Idroelettrica Interattiva
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
          
          <div className="hydro-sliders-grid"> 
             
            {/* Pulsante Start/Stop (Prima colonna) */}
            <div className="hydro-flow-control">
                <div className="hydro-flow-header">
                  <span className="hydro-flow-label">Stato Centrale</span>
                </div>
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    // Colori invertiti per coerenza con l'immagine: Verde = Produzione
                    className={`hydro-toggle-button ${isRunning ? 'stopped' : 'running'}`} 
                    type="button"
                >
                    {isRunning ? '▶ PRODUZIONE' : '⏸ FERMO'}
                </button>
            </div>
            
            {/* Slider 1: Flusso d'Acqua */}
            <div className="hydro-flow-control">
              <div className="hydro-flow-header">
                <span className="hydro-flow-label">💧 Flusso d'Acqua</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={flowIntensity}
                onChange={(e) => setFlowIntensity(Number(e.target.value))}
                disabled={!isRunning}
                className="hydro-slider blue-fill" 
                style={{
                  background: `linear-gradient(to right, #60a5fa ${flowIntensity}%, #e5e7eb ${flowIntensity}%)`
                }}
              />
              <div className="hydro-slider-value">
                {flowIntensity}%
              </div>
            </div>
            
            {/* Slider 2: Altezza Bacino (Nuovo) */}
            <div className="hydro-flow-control">
              <div className="hydro-flow-header">
                <span className="hydro-flow-label">⛰️ Altezza Bacino</span>
              </div>
              <input
                type="range"
                min="0" 
                max="100" 
                value={reservoirHeight}
                onChange={(e) => setReservoirHeight(Number(e.target.value))}
                className="hydro-slider green-fill" 
                style={{
                  background: `linear-gradient(to right, #10b981 ${reservoirHeight}%, #e5e7eb ${reservoirHeight}%)`
                }}
              />
              <div className="hydro-slider-value green-text">
                {reservoirHeight}%
              </div>
            </div>

            {/* Slider 3: Rendimento Impianto (Nuovo) */}
            <div className="hydro-flow-control">
              <div className="hydro-flow-header">
                <span className="hydro-flow-label">✨ Rendimento Impianto</span>
              </div>
              <input
                type="range"
                min="0" 
                max="100"
                value={efficiency}
                onChange={(e) => setEfficiency(Number(e.target.value))}
                className="hydro-slider yellow-fill" 
                style={{
                  background: `linear-gradient(to right, #facc15 ${efficiency}%, #e5e7eb ${efficiency}%)`
                }}
              />
              <div className="hydro-slider-value yellow-text">
                {efficiency}%
              </div>
            </div>

          </div> 
          
          <div className="hydro-metrics-grid">
            <div className="hydro-metric-card water">
              <Droplets className="hydro-metric-icon text-blue-600" />
              <div className="hydro-metric-label">Acqua nel Bacino</div>
              <div className="hydro-metric-value">{displayWaterLevel}%</div>
            </div>

            <div className="hydro-metric-card energy">
              <Zap className="hydro-metric-icon text-yellow-600" />
              <div className="hydro-metric-label">Energia Prodotta</div>
              <div className="hydro-metric-value">{displayEnergy} MWh</div>
            </div>
          </div>
        </div>

        <div className="hydro-visualization-card">
          {/* viewBox RIDOTTO A 460 per compattare */}
          <svg viewBox="0 0 800 460" className="hydro-svg-container" preserveAspectRatio="xMidYMid meet">
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
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#87CEEB', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#E0F6FF', stopOpacity: 1}} />
              </linearGradient>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              </linearGradient>
            </defs>

            {/* Sfondo cielo - ALTEZZA 400 (schiacciato) */}
            <rect x="0" y="0" width="800" height={GROUND_Y} fill="url(#skyGrad)" />
            
            {/* Luna - Posizione Y alzata leggermente per restare nel viewBox 460 */}
            <g transform="translate(600, 150)">
                <circle cx="0" cy="0" r="35" fill="#e5e7eb" />
                <path 
                    d="M 15 -25 A 25 25 0 0 0 15 25 A 20 20 0 0 1 15 -25 Z" 
                    fill="url(#skyGrad)" 
                />
            </g>
            
            {/* Montagne - Base a Y=400 (Nuovo Terreno) */}
            {/* Montagne alzate di 40 per mantenere proporzioni con il nuovo viewBox */}
            <path d={`M 0 ${GROUND_Y} L 150 120 L 300 ${GROUND_Y} Z`} fill="#8B9DC3" opacity="0.8" />
            <path d={`M 200 ${GROUND_Y} L 350 170 L 500 ${GROUND_Y} Z`} fill="#708090" opacity="0.9" />

            {/* Terreno - Base */}
            <rect x="0" y={GROUND_Y} width="800" height="60" fill="#22c55e" opacity="0.6" />

            {/* DIGA/BACINO - Posizioni: Y start 200, Y end 350 */}
            <g 
              onClick={() => handleComponentClick('dam')}
              className="hydro-svg-clickable"
            >
              {/* Struttura diga (Base a 350, cima a 200) */}
              <path d={`M 50 ${DAM_TOP_Y} L 50 ${DAM_BOTTOM_Y} L 250 ${DAM_BOTTOM_Y} L 250 ${DAM_TOP_Y}`} 
                    fill="none" 
                    stroke="#5A5A5A" 
                    strokeWidth="15" />
              
              {/* Acqua nel bacino - animata dinamicamente. Y start 200. */}
              <rect 
                id="water-level-rect"
                x="60" 
                // Calcolo y e altezza basato su DAM_TOP_Y e damHeight
                y={DAM_TOP_Y + (damHeight * (1 - displayWaterLevel / 100))} 
                width="180" 
                height={damHeight * (displayWaterLevel / 100)} 
                fill="url(#waterGradient)"
              />
              
              {/* Indicatore interattivo */}
              {!exploredComponents.includes('dam') && (
                <g>
                  <circle cx="150" cy="275" r="25" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="25;30;25" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="150" y="283" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">👆</text>
                </g>
              )}
            </g>

            {/* CONDOTTA/TUBI - Condotta rialzata di 10px */}
            <g 
              onClick={() => handleComponentClick('pipes')}
              className="hydro-svg-clickable"
            >
              {/* Tubo principale - Percorso inclinato (Inizia a Y=340, finisce a Y=380) */}
              <path d={`M 250 ${PIPE_START_Y} L 400 ${PIPE_END_Y} L 420 ${PIPE_END_Y} L 420 ${PIPE_END_Y + 20} L 400 ${PIPE_END_Y + 20} L 250 ${PIPE_START_Y + 20}`}
                    fill="#475569"
                    stroke="#2D3748"
                    strokeWidth="2" />
              
              {/* Particella d'acqua - animazione lungo il percorso inclinato */}
              {isRunning && flowIntensity > 0 && (
                <circle r="8" fill="#3B82F6" filter="url(#glow)">
                  <animateMotion
                    dur={`${3 / (flowIntensity / 50)}s`}
                    repeatCount="indefinite"
                    path={`M 250 ${PIPE_START_Y + 10} L 410 ${PIPE_END_Y + 10}`}
                  />
                </circle>
              )}
              
              {/* Indicatore interattivo (Spostato in alto di 10) */}
              {!exploredComponents.includes('pipes') && (
                <g>
                  <circle cx="330" cy="370" r="25" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="25;30;25" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="330" y="378" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">👆</text>
                </g>
              )}
            </g>

            {/* TURBINA - Posizione ripristinata (Centro 450, 360) */}
            <g 
              onClick={() => handleComponentClick('turbine')}
              className="hydro-svg-clickable"
            >
              {/* Contenitore turbina (Tra 320 e 400) */}
              <rect x="400" y="320" width="100" height="80" fill="#334155" rx="5" />
              
              {/* Turbina animata (Centro a 450, 360) */}
              <g id="turbine-animation" transform="translate(450, 360)" filter="url(#glow)">
                {/* Pale della turbina */}
                {[0, 60, 120, 180, 240, 300].map((angle) => (
                  <rect
                    key={angle}
                    x="-3"
                    y="-20"
                    width="6"
                    height="40"
                    fill="url(#energyGradient)"
                    transform={`rotate(${angle})`}
                  />
                ))}
                <circle cx="0" cy="0" r="8" fill="#DC2626" />
              </g>
              
              {/* Scarico dell'acqua (Tailrace) - Nel terreno Y=400 */}
              <rect x="500" y="380" width="300" height="20" fill="#3B82F6" opacity="0.3" />

              {/* Indicatore interattivo */}
              {!exploredComponents.includes('turbine') && (
                <g>
                  <circle cx="450" cy="340" r="25" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="25;30;25" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="450" y="348" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">👆</text>
                </g>
              )}
            </g>

            {/* GENERATORE - Posizione ripristinata (accanto alla turbina) */}
            <g 
              onClick={() => handleComponentClick('generator')}
              className="hydro-svg-clickable"
            >
              {/* Corpo generatore */}
              <rect x="500" y="330" width="80" height="60" fill="#FCD34D" rx="5" />
              <rect x="510" y="340" width="60" height="40" fill="#F59E0B" rx="3" />
              
              {/* Bobine interne */}
              <circle cx="540" cy="360" r="12" fill="none" stroke="#DC2626" strokeWidth="3" />
              <line x1="520" y1="360" x2="560" y2="360" stroke="#DC2626" strokeWidth="3" />
              
              {/* Indicatore interattivo */}
              {!exploredComponents.includes('generator') && (
                <g>
                  <circle cx="540" cy="345" r="25" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="25;30;25" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="540" y="353" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">👆</text>
                </g>
              )}
            </g>

            {/* LINEE ELETTRICHE E CITTÀ - Allineate al nuovo terreno (Y=400) */}
            <g 
              onClick={() => handleComponentClick('power')}
              className="hydro-svg-clickable"
            >
              
              {/* Pali Elettrici (3 pali, base a y=400, cima a y=310) */}
              <line x1="600" y1={GROUND_Y} x2="600" y2="310" stroke="#4B5563" strokeWidth="4" />
              <line x1="680" y1={GROUND_Y} x2="680" y2="310" stroke="#4B5563" strokeWidth="4" />
              <line x1="760" y1={GROUND_Y} x2="760" y2="310" stroke="#4B5563" strokeWidth="4" />

              {/* Traversi sui pali */}
              <line x1="585" y1="320" x2="615" y2="320" stroke="#4B5563" strokeWidth="3" />
              <line x1="665" y1="320" x2="695" y2="320" stroke="#4B5563" strokeWidth="3" />
              <line x1="745" y1="320" x2="775" y2="320" stroke="#4B5563" strokeWidth="3" />
              
              {/* Cavi elettrici Orizzontali/Paralleli (3 linee - connessione dal generatore a 580) */}
              <polyline points="580,350 600,340 680,340 760,340 780,350" fill="none" stroke="#374151" strokeWidth="2" />
              <polyline points="580,360 600,350 680,350 760,350 780,360" fill="none" stroke="#374151" strokeWidth="2" />
              <polyline points="580,370 600,360 680,360 760,360 780,370" fill="none" stroke="#374151" strokeWidth="2" />
              
              {/* Particella energia animata (percorso centrale) */}
              {isRunning && displayEnergy > 0 && (
                <circle r="5" fill="url(#energyGradient)" filter="url(#glow)">
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path="M 580 360 L 780 360"
                  />
                </circle>
              )}
              
              {/* Case che si illuminano - Posizionate dopo la linea, allineate a Y=400 */}
              
              {/* Casa 1 (piccola) */}
              <g transform="translate(680, 0)">
                  <rect x="0" y="370" width="30" height="30" fill="#8B7355" />
                  <polygon points="0,370 15,350 30,370" fill="#C0392B" />
                  <rect x="5" y="375" width="8" height="8" fill={isRunning && displayEnergy > 50 ? "#FBBF24" : "#333"} />
                  <rect x="17" y="375" width="8" height="8" fill={isRunning && displayEnergy > 50 ? "#FBBF24" : "#333"} />
              </g>

              {/* Casa 2 (media) */}
              <g transform="translate(715, 0)">
                  <rect x="0" y="360" width="40" height="40" fill="#95A5A6" />
                  <rect x="10" y="370" width="8" height="8" fill={isRunning && displayEnergy > 150 ? "#FBBF24" : "#333"} />
                  <rect x="25" y="370" width="8" height="8" fill={isRunning && displayEnergy > 150 ? "#FBBF24" : "#333"} />
                  <rect x="10" y="383" width="8" height="8" fill={isRunning && displayEnergy > 150 ? "#FBBF24" : "#333"} />
              </g>

              {/* Casa 3 (alta) */}
               <g transform="translate(620, 0)">
                  <rect x="0" y="350" width="50" height="50" fill="#2E86C1" />
                  <rect x="10" y="360" width="10" height="10" fill={isRunning && displayEnergy > 250 ? "#FBBF24" : "#333"} />
                  <rect x="30" y="360" width="10" height="10" fill={isRunning && displayEnergy > 250 ? "#FBBF24" : "#333"} />
                  <rect x="10" y="375" width="10" height="10" fill={isRunning && displayEnergy > 250 ? "#FBBF24" : "#333"} />
                  <rect x="30" y="375" width="10" height="10" fill={isRunning && displayEnergy > 250 ? "#FBBF24" : "#333"} />
              </g>

              
              {/* Indicatore interattivo */}
              {!exploredComponents.includes('power') && (
                <g>
                  <circle cx="675" cy="380" r="25" fill="#fbbf24" opacity="0.3">
                    <animate attributeName="r" values="25;30;25" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="675" y="388" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">👆</text>
                </g>
              )}
            </g>

            {/* Terreno (Sovrapposto per dare profondità) */}
            <rect x="0" y={GROUND_Y} width="800" height="60" fill="#22c55e" opacity="0.6" />
          </svg>
        </div>

        {selectedComponent && <ComponentPopup component={selectedComponent} />}
        {showCongrats && <CongratsPopup />}

        <div className="hydro-instructions-card">
          <h2 className="hydro-controls-title">🎯 Come giocare</h2>
          <div className="hydro-instructions-grid">
            <div className="hydro-instruction-item">
              <strong className="hydro-instruction-title">1. 👆 Clicca</strong>
              <p className="hydro-instruction-text">Tocca i cerchi gialli per scoprire ogni parte!</p>
            </div>
            <div className="hydro-instruction-item">
              <strong className="hydro-instruction-title">2. ⚙️ Controlla</strong>
              <p className="hydro-instruction-text">Usa i tre slider per massimizzare la produzione di energia!</p>
            </div>
            <div className="hydro-instruction-item">
              <strong className="hydro-instruction-title">3. 👀 Osserva</strong>
              <p className="hydro-instruction-text">Guarda come Flusso, Altezza e Rendimento influenzano l'elettricità!</p>
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